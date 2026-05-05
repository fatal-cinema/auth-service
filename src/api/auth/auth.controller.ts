import {
	AuthServiceController,
	type SendOtpRequest,
	type SendOtpResponse,
	type VerifyOtpRequest,
	type VerifyOtpResponse,
} from '@fatal-cinema/contracts/gen/auth'
import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'

import { AuthService } from './auth.service'

@Controller()
export class AuthController implements AuthServiceController {
	constructor(private readonly authService: AuthService) {}

	@GrpcMethod('AuthService', 'SendOtp')
	async sendOtp(data: SendOtpRequest): Promise<SendOtpResponse> {
		return this.authService.sendOtp(data)
	}

	@GrpcMethod('AuthService', 'VerifyOtp')
	async verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
		return this.authService.verifyOtp(data)
	}
}
