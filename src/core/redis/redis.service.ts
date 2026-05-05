import { error } from 'console'
import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

import { AllConfigs } from '@shared/interfaces'

@Injectable()
export class RedisService extends Redis implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(RedisService.name)

	constructor(private readonly configService: ConfigService<AllConfigs>) {
		super({
			host: configService.getOrThrow('redis.host', { infer: true }),
			username: configService.getOrThrow('redis.user', { infer: true }),
			password: configService.getOrThrow('redis.password', { infer: true }),
			port: configService.getOrThrow('redis.port', { infer: true }),
			maxRetriesPerRequest: 5,
			enableOfflineQueue: true,
		})
	}

	async onModuleInit() {
		const start = Date.now()

		this.logger.log('🔄 Initializing Redis connection...')

		this.on('connect', () => {
			this.logger.log('🔄 Redis connecting...')
		})

		this.on('ready', () => {
			const ms = Date.now() - start
			this.logger.log(`✅ Redis connected (time=${ms}ms)`)
		})

		this.on('error', error => {
			this.logger.error('❌ Redis error', {
				error: error.message ?? error,
			})
		})

		this.on('close', () => {
			this.logger.warn('🟢 Redis connection closed')
		})

		this.on('reconnecting', () => {
			this.logger.log('🔄 Redis reconnecting...')
		})
	}

	async onModuleDestroy() {
		this.logger.log('🔻 Closing Redis connection...')

		try {
			await this.quit()

			this.logger.log('🟢 Redis connection close')
		} catch (error) {
			this.logger.error('🔴 Error closing Redis connection: ', error)
		}
	}
}
