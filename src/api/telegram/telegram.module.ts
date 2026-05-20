import { Module } from '@nestjs/common'

import { TokenModule } from '@libs/token/token.module'
import { UsersModule } from '@api/users/users.module'

import { TelegramController } from './telegram.controller'
import { TelegramRepository } from './telegram.repository'
import { TelegramService } from './telegram.service'

@Module({
	imports: [TokenModule, UsersModule],
	controllers: [TelegramController],
	providers: [TelegramService, TelegramRepository],
})
export class TelegramModule {}
