import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { databaseEnv, grpcEnv, passportEnv, redisEnv, rmqEnv, telegramEnv } from '@config/env'
import { IS_DEV_ENV } from '@shared/utils'

import { MessagingModule } from './messaging/messaging.module'
import { PrismaModule } from './prisma/prisma.module'
import { RedisModule } from './redis/redis.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			ignoreEnvFile: !IS_DEV_ENV,
			load: [grpcEnv, databaseEnv, redisEnv, passportEnv, telegramEnv, rmqEnv],
		}),
		PrismaModule,
		RedisModule,
		MessagingModule,
	],
})
export class CoreModule {}
