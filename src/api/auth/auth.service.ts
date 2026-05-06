import { RpcStatus } from '@fatal-cinema/common'
import type { RefreshRequest, SendOtpRequest, SendOtpResponse, VerifyOtpRequest, VerifyOtpResponse } from '@fatal-cinema/contracts/gen/auth'
import { PassportService, TokenPayload } from '@fatal-cinema/passport'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RpcException } from '@nestjs/microservices'

import type { AllConfigs } from '@shared/interfaces'
import type { TAccount } from '@shared/objects'
import { OtpService } from '@api/otp/otp.service'

import { AuthRepository } from './auth.repository'

@Injectable()
export class AuthService {
	private readonly ACCESS_TOKEN_TTL: number
	private readonly REFRESH_TOKEN_TTL: number

	constructor(
		private readonly configService: ConfigService<AllConfigs>,
		private readonly authRepository: AuthRepository,
		private readonly otpService: OtpService,
		private readonly passportService: PassportService
	) {
		this.ACCESS_TOKEN_TTL = configService.getOrThrow('passport.accessTtl', { infer: true })
		this.REFRESH_TOKEN_TTL = configService.getOrThrow('passport.refreshTtl', { infer: true })
	}

	async sendOtp(data: SendOtpRequest): Promise<SendOtpResponse> {
		const { identifier, type } = data

		let account: TAccount | null

		if (type === 'phone') {
			account = await this.authRepository.findByPhone(identifier)
		} else {
			account = await this.authRepository.findByEmail(identifier)
		}

		if (!account) {
			account = await this.authRepository.create({
				email: type === 'email' ? identifier : undefined,
				phone: type === 'phone' ? identifier : undefined,
			})
		}

		const code = await this.otpService.send(identifier, type as 'phone' | 'email')

		console.debug('CODE: ', code)

		return { ok: true }
	}

	async verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
		const { identifier, type, code } = data

		await this.otpService.verify(identifier, type as 'phone' | 'email', code)

		let account: TAccount | null

		if (type === 'phone') {
			account = await this.authRepository.findByPhone(identifier)
		} else {
			account = await this.authRepository.findByEmail(identifier)
		}

		if (!account) {
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Account not found',
			})
		}

		if (type === 'phone' && !account.isPhoneVerified) {
			await this.authRepository.update(account.id, { isPhoneVerified: true })
		} else if (type === 'email' && !account.isEmailVerified) {
			await this.authRepository.update(account.id, { isEmailVerified: true })
		}

		return this.generateTokens(account.id)
	}

	async refresh(data: RefreshRequest) {
		const { refreshToken } = data

		const result = this.passportService.verify(refreshToken)

		if (!result.valid || !result.userId) {
			throw new RpcException({
				code: RpcStatus.UNAUTHENTICATED,
				details: result.reason,
			})
		}

		return this.generateTokens(result.userId)
	}

	private generateTokens(userId: string) {
		const payload: TokenPayload = {
			sub: userId,
		}

		const accessToken = this.passportService.generate(String(payload.sub), this.ACCESS_TOKEN_TTL)
		const refreshToken = this.passportService.generate(String(payload.sub), this.REFRESH_TOKEN_TTL)

		return { accessToken, refreshToken }
	}
}
