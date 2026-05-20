import { createHash, createHmac, randomBytes } from 'node:crypto'
import { RpcStatus } from '@fatal-cinema/common'
import type {
	TelegramCompleteRequest,
	TelegramCompleteResponse,
	TelegramConsumeRequest,
	TelegramConsumeResponse,
	TelegramVerifyRequest,
	TelegramVerifyResponse,
} from '@fatal-cinema/contracts/gen/telegram'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RpcException } from '@nestjs/microservices'

import { RedisService } from '@core/redis/redis.service'
import { TokenService } from '@libs/token/token.service'
import type { AllConfigs } from '@shared/interfaces'
import { UserRepository } from '@shared/repositories'
import { UsersGrpcClient } from '@api/users/users.grpc'

import { TelegramRepository } from './telegram.repository'

@Injectable()
export class TelegramService {
	private readonly BOT_ID: string
	private readonly BOT_TOKEN: string
	private readonly BOT_USERNAME: string
	private readonly REDIRECT_ORIGIN: string

	constructor(
		private readonly configService: ConfigService<AllConfigs>,
		private readonly telegramRepository: TelegramRepository,
		private readonly userRepository: UserRepository,
		private readonly redisService: RedisService,
		private readonly tokenService: TokenService,
		private readonly usersClient: UsersGrpcClient
	) {
		this.BOT_ID = this.configService.getOrThrow('telegram.botId', { infer: true })
		this.BOT_TOKEN = this.configService.getOrThrow('telegram.botToken', { infer: true })
		this.BOT_USERNAME = this.configService.getOrThrow('telegram.botUsername', { infer: true })
		this.REDIRECT_ORIGIN = this.configService.getOrThrow('telegram.redirectOrigin', { infer: true })
	}

	getTelegramAuthUrl() {
		const url = new URL('https://oauth.telegram.org/auth')

		url.searchParams.append('bot_id', this.BOT_ID)
		url.searchParams.append('origin', this.REDIRECT_ORIGIN)
		url.searchParams.append('request_access', 'write')
		url.searchParams.append('return_to', `${this.REDIRECT_ORIGIN}/auth/telegram`)

		return { url: url.href }
	}

	async verify(data: TelegramVerifyRequest): Promise<TelegramVerifyResponse> {
		const isValid = this.checkTelegramAuth(data.query)

		if (!isValid) {
			throw new RpcException({
				code: RpcStatus.UNAUTHENTICATED,
				details: 'Invalid Telegram signature',
			})
		}

		const telegramId = data.query.id

		const existingAccount = await this.telegramRepository.findByTelegramId(telegramId)

		if (existingAccount && existingAccount.phone) {
			return this.tokenService.generate(existingAccount.id)
		}

		const sessionId = randomBytes(16).toString('hex')

		await this.redisService.set(`telegram_init_sessions:${sessionId}`, JSON.stringify({ ...data.query }), 'EX', 300)

		return { url: `https://t.me/${this.BOT_USERNAME}?start=${sessionId}` }
	}

	async complete(data: TelegramCompleteRequest): Promise<TelegramCompleteResponse> {
		const { sessionId, phone } = data

		const raw = await this.redisService.get(`telegram_init_sessions:${sessionId}`)

		if (!raw) {
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Session not found',
			})
		}

		const { id: telegramId } = JSON.parse(raw)

		let user = await this.userRepository.findByPhone(phone)

		if (!user) {
			user = await this.userRepository.create({ phone })
		}

		this.usersClient.createUser({ id: user.id }).subscribe()

		await this.userRepository.update(user.id, {
			telegramId,
			isPhoneVerified: true,
		})

		const tokens = this.tokenService.generate(user.id)

		await this.redisService.set(`telegram_tokens:${sessionId}`, JSON.stringify(tokens), 'EX', 120)

		await this.redisService.del(`telegram_init_sessions:${sessionId}`)

		return { sessionId }
	}

	async consumeSession(data: TelegramConsumeRequest): Promise<TelegramConsumeResponse> {
		const { sessionId } = data

		const raw = await this.redisService.get(`telegram_tokens:${sessionId}`)

		if (!raw) {
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Session not found',
			})
		}

		const tokens = JSON.parse(raw)

		await this.redisService.del(`telegram_tokens:${sessionId}`)

		return tokens
	}

	private checkTelegramAuth(query: Record<string, string>) {
		const hash = query.hash

		if (!hash) {
			return false
		}

		const dataCheckArr = Object.keys(query)
			.filter(k => k !== 'hash')
			.sort()
			.map(k => `${k}=${query[k]}`)

		const dataCheckString = dataCheckArr.join('\n')

		const secretKey = createHash('sha256').update(`${this.BOT_ID}:${this.BOT_TOKEN}`).digest()

		const hmac = createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

		const isValid = hmac === hash

		return isValid
	}
}
