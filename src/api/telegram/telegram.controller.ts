import {
	TELEGRAM_SERVICE_NAME,
	TelegramServiceController,
	type TelegramCompleteRequest,
	type TelegramCompleteResponse,
	type TelegramConsumeRequest,
	type TelegramConsumeResponse,
	type TelegramInitResponse,
	type TelegramVerifyRequest,
	type TelegramVerifyResponse,
} from '@fatal-cinema/contracts/gen/telegram'
import { Controller, UseInterceptors } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'

import { GrpcMetricsInterceptor } from '@observability/interceptors'

import { TelegramService } from './telegram.service'

@UseInterceptors(GrpcMetricsInterceptor)
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

	@GrpcMethod(TELEGRAM_SERVICE_NAME, 'TelegramComplete')
	async telegramComplete(data: TelegramCompleteRequest): Promise<TelegramCompleteResponse> {
		return this.telegramService.complete(data)
	}

	@GrpcMethod(TELEGRAM_SERVICE_NAME, 'TelegramConsume')
	async telegramConsume(data: TelegramConsumeRequest): Promise<TelegramConsumeResponse> {
		return this.telegramService.consumeSession(data)
	}
}
