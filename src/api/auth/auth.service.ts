import {
	type SendOtpRequest,
	type SendOtpResponse,
	type VerifyOtpRequest,
	type VerifyOtpResponse,
} from '@fatal-cinema/contracts/gen/auth/v1/auth'
import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'

import { TAccount } from '@shared/objects'
import { OtpService } from '@api/otp/otp.service'

import { AuthRepository } from './auth.repository'

@Injectable()
export class AuthService {
	constructor(
		private readonly authRepository: AuthRepository,
		private readonly otpService: OtpService
	) {}

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
			throw new RpcException('Account not found')
		}

		if (type === 'phone' && !account.isPhoneVerified) {
			await this.authRepository.update(account.id, { isPhoneVerified: true })
		} else if (type === 'email' && !account.isEmailVerified) {
			await this.authRepository.update(account.id, { isEmailVerified: true })
		}

		return { accessToken: '123456', refreshToken: '123456' }
	}
}
