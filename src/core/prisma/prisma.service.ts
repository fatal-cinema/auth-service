import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/generated/client'

import { AllConfigs } from '@shared/interfaces'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(PrismaService.name)

	constructor(private readonly configService: ConfigService<AllConfigs>) {
		const user = configService.getOrThrow('database.user', { infer: true })
		const pass = configService.getOrThrow('database.password', { infer: true })
		const host = configService.getOrThrow('database.host', { infer: true })
		const port = configService.getOrThrow('database.port', { infer: true })
		const name = configService.getOrThrow('database.name', { infer: true })

		const url = `postgresql://${user}:${pass}@${host}:${port}/${name}`

		super({ adapter: new PrismaPg({ connectionString: url }) })
	}

	public async onModuleInit() {
		const start = Date.now()

		this.logger.log('🔄 Initializing database connection...')

		try {
			await this.$connect()

			const ms = Date.now() - start

			this.logger.log(`✅ Database connection established successfully (time=${ms}ms)`)
		} catch (error) {
			this.logger.error('❌ Failed to establish database connection: ', error)

			throw error
		}
	}

	public async onModuleDestroy() {
		this.logger.log('🔻 Closing database connection...')

		try {
			await this.$disconnect()

			this.logger.log('🟢 Database connection closed successfully')
		} catch (error) {
			this.logger.error('🔴 Error occurred while closing the database connection: ', error)

			throw error
		}
	}
}
