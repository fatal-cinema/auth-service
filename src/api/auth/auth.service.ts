import { RpcStatus } from '@fatal-cinema/common'
import type { RefreshRequest, SendOtpRequest, SendOtpResponse, VerifyOtpRequest, VerifyOtpResponse } from '@fatal-cinema/contracts/gen/auth'
import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'

import { MessagingService } from '@core/messaging/messaging.service'
import { OtpService } from '@libs/otp/otp.service'
import { TokenService } from '@libs/token/token.service'
import type { TAccount } from '@shared/objects'
import { UserRepository } from '@shared/repositories'
import { UsersGrpcClient } from '@api/users/users.grpc'

import { AuthRepository } from './auth.repository'

@Injectable()
export class AuthService {
	constructor(
		private readonly authRepository: AuthRepository,
		private readonly userRepository: UserRepository,
		private readonly otpService: OtpService,
		private readonly tokenService: TokenService,
		private readonly messagingService: MessagingService,
		private readonly usersClient: UsersGrpcClient
	) {}

	async sendOtp(data: SendOtpRequest): Promise<SendOtpResponse> {
		const { identifier, type } = data

		let account: TAccount | null

		if (type === 'phone') {
			account = await this.userRepository.findByPhone(identifier)
		} else {
			account = await this.userRepository.findByEmail(identifier)
		}

		if (!account) {
			account = await this.userRepository.create({
				email: type === 'email' ? identifier : undefined,
				phone: type === 'phone' ? identifier : undefined,
			})
		}

		const { code } = await this.otpService.send(identifier, type as 'phone' | 'email')

		console.debug(`CODE: ${code}`)

		await this.messagingService.otpRequested({ identifier, type, code })

		return { ok: true }
	}

	async verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
		const { identifier, type, code } = data

		await this.otpService.verify(identifier, type as 'phone' | 'email', code)

		let account: TAccount | null

		if (type === 'phone') {
			account = await this.userRepository.findByPhone(identifier)
		} else {
			account = await this.userRepository.findByEmail(identifier)
		}

		if (!account) {
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Account not found',
			})
		}

		if (type === 'phone' && !account.isPhoneVerified) {
			await this.userRepository.update(account.id, { isPhoneVerified: true })
		} else if (type === 'email' && !account.isEmailVerified) {
			await this.userRepository.update(account.id, { isEmailVerified: true })
		}

		this.usersClient.createUser({ id: account.id }).subscribe()

		return this.tokenService.generate(account.id)
	}

	async refresh(data: RefreshRequest) {
		const { refreshToken } = data

		const result = this.tokenService.verify(refreshToken)

		if (!result.valid || !result.userId) {
			throw new RpcException({
				code: RpcStatus.UNAUTHENTICATED,
				details: result.reason,
			})
		}

		return this.tokenService.generate(result.userId)
	}
}
