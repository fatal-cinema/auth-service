import { Module } from '@nestjs/common'

import { AuthModule } from './auth/auth.module'
import { OtpModule } from './otp/otp.module';

@Module({
	imports: [AuthModule, OtpModule],
})
export class ApiModule {}
