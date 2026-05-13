import { Module } from '@nestjs/common'

import { OtpModule } from '@libs/otp/otp.module'

import { AccountController } from './account.controller'
import { AccountRepository } from './account.repository'
import { AccountService } from './account.service'

@Module({
	imports: [OtpModule],
	controllers: [AccountController],
	providers: [AccountService, AccountRepository],
})
export class AccountModule {}
