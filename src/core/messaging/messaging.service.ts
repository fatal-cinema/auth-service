import type { OtpRequestedEvent } from '@fatal-cinema/contracts'
import { Inject, Injectable } from '@nestjs/common'
import type { ClientProxy } from '@nestjs/microservices'

@Injectable()
export class MessagingService {
	constructor(@Inject('NOTIFICATIONS_CLIENT') private readonly client: ClientProxy) {}

	async otpRequested(data: OtpRequestedEvent) {
		return this.client.emit('auth.otp.requested', data)
	}
}
