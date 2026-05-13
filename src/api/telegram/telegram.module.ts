import { Module } from '@nestjs/common'

import { TokenModule } from '@libs/token/token.module'

import { TelegramController } from './telegram.controller'
import { TelegramRepository } from './telegram.repository'
import { TelegramService } from './telegram.service'

@Module({
	imports: [TokenModule],
	controllers: [TelegramController],
	providers: [TelegramService, TelegramRepository],
})
export class TelegramModule {}
