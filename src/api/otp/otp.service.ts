import { createHash } from 'node:crypto'
import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { generateCode } from 'patcode'

import { RedisService } from '@core/redis/redis.service'

@Injectable()
export class OtpService {
	constructor(private readonly redisService: RedisService) {}

	async send(identifier: string, type: 'phone' | 'email') {
		const { code, hash } = this.generateCode()

		await this.redisService.set(`otp:${type}:${identifier}`, hash, 'EX', 300)

		return code
	}

	async verify(identifier: string, type: 'phone' | 'email', code: string) {
		const storedHash = await this.redisService.get(`otp:${type}:${identifier}`)

		if (!storedHash) {
			throw new RpcException('Invalid or expired otp code')
		}

		const incomingHash = createHash('sha256').update(code).digest('hex')

		if (storedHash !== incomingHash) {
			throw new RpcException('Invalid or expired otp code')
		}

		await this.redisService.del(`otp:${type}:${identifier}`)
	}

	private generateCode() {
		const code = generateCode()
		const hash = createHash('sha256').update(code).digest('hex')

		return { code, hash }
	}
}
