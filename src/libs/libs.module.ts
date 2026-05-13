import { Module } from '@nestjs/common'

import { OtpModule } from './otp/otp.module'
import { TokenModule } from './token/token.module'

@Module({
	imports: [OtpModule, TokenModule],
})
export class LibsModule {}
