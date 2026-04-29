import { SendOtpRequest } from '@fatal-cinema/contracts/gen/auth/v1/auth'
import { Injectable } from '@nestjs/common'

import { TAccount } from '@shared/objects'

import { AuthRepository } from './auth.repository'

@Injectable()
export class AuthService {
	constructor(private readonly authRepository: AuthRepository) {}

	async sendOtp(data: SendOtpRequest) {
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

		return { ok: true }
	}
}
