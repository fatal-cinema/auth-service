import { type SendOtpRequest, type SendOtpResponse } from '@fatal-cinema/contracts/gen/auth/v1/auth'
import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'

import { AuthService } from './auth.service'

@Controller()
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@GrpcMethod('AuthService', 'SendOtp')
	async sendOtp(data: SendOtpRequest): Promise<SendOtpResponse> {
		console.log('Incoming OTP request: ', data)
		return { ok: true }
	}
}
