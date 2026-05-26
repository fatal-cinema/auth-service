import {
	AUTH_SERVICE_NAME,
	AuthServiceController,
	type RefreshRequest,
	type RefreshResponse,
	type SendOtpRequest,
	type SendOtpResponse,
	type VerifyOtpRequest,
	type VerifyOtpResponse,
} from '@fatal-cinema/contracts/gen/auth'
import { Controller, UseInterceptors } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'

import { GrpcMetricsInterceptor } from '@observability/interceptors'

import { AuthService } from './auth.service'

@UseInterceptors(GrpcMetricsInterceptor)
@Controller()
export class AuthController implements AuthServiceController {
	constructor(private readonly authService: AuthService) {}

	@GrpcMethod(AUTH_SERVICE_NAME, 'SendOtp')
	async sendOtp(data: SendOtpRequest): Promise<SendOtpResponse> {
		return this.authService.sendOtp(data)
	}

	@GrpcMethod(AUTH_SERVICE_NAME, 'VerifyOtp')
	async verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
		return this.authService.verifyOtp(data)
	}

	@GrpcMethod(AUTH_SERVICE_NAME, 'Refresh')
	async refresh(data: RefreshRequest): Promise<RefreshResponse> {
		return this.authService.refresh(data)
	}
}
