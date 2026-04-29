import { SendOtpRequest } from '@fatal-cinema/contracts/gen/auth/v1/auth'
import { Injectable } from '@nestjs/common'

@Injectable()
export class AuthService {
	async sendOtp(data: SendOtpRequest) {}
}
