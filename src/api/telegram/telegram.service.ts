import { randomBytes } from 'node:crypto'
import type { TelegramVerifyRequest, TelegramVerifyResponse } from '@fatal-cinema/contracts/gen/telegram'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { RedisService } from '@core/redis/redis.service'
import { TokenService } from '@libs/token/token.service'
import { AllConfigs } from '@shared/interfaces'

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
		private readonly redisService: RedisService,
		private readonly tokenService: TokenService
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
		const telegramId = data.query.id

		const existingAccount = await this.telegramRepository.findByTelegramId(telegramId)

		if (existingAccount && existingAccount.phone) {
			return this.tokenService.generate(existingAccount.id)
		}

		const sessionId = randomBytes(16).toString('hex')

		await this.redisService.set(`telegram_sessions:${sessionId}`, JSON.stringify({ ...data.query }), 'EX', 300)

		return { url: `https://t.me/${this.BOT_USERNAME}?start=${sessionId}` }
	}
}
