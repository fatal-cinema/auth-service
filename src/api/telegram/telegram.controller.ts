import {
	TELEGRAM_SERVICE_NAME,
	TelegramServiceController,
	type TelegramInitResponse,
	type TelegramVerifyRequest,
	type TelegramVerifyResponse,
} from '@fatal-cinema/contracts/gen/telegram'
import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'

import { TelegramService } from './telegram.service'

@Controller()
export class TelegramController implements TelegramServiceController {
	constructor(private readonly telegramService: TelegramService) {}

	@GrpcMethod(TELEGRAM_SERVICE_NAME, 'TelegramInit')
	async telegramInit(): Promise<TelegramInitResponse> {
		return this.telegramService.getTelegramAuthUrl()
	}

	@GrpcMethod(TELEGRAM_SERVICE_NAME, 'TelegramVerify')
	async telegramVerify(data: TelegramVerifyRequest): Promise<TelegramVerifyResponse> {
		return this.telegramService.verify(data)
	}
}
