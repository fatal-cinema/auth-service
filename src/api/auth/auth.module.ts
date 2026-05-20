import { Module } from '@nestjs/common'

import { OtpModule } from '@libs/otp/otp.module'
import { TokenModule } from '@libs/token/token.module'
import { UsersModule } from '@api/users/users.module'

import { AuthController } from './auth.controller'
import { AuthRepository } from './auth.repository'
import { AuthService } from './auth.service'

@Module({
	imports: [OtpModule, TokenModule, UsersModule],
	controllers: [AuthController],
	providers: [AuthService, AuthRepository],
})
export class AuthModule {}
