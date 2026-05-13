import { Module } from '@nestjs/common'

import { AccountModule } from './account/account.module'
import { AuthModule } from './auth/auth.module'
import { TelegramModule } from './telegram/telegram.module'

@Module({
	imports: [AuthModule, AccountModule, TelegramModule],
})
export class ApiModule {}
