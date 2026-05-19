import { registerAs } from '@nestjs/config'

import type { RmqConfig } from '@shared/interfaces'
import { validateEnv } from '@shared/utils'
import { RmqValidator } from '@shared/validators'

export const rmqEnv = registerAs<RmqConfig>('rmq', () => {
	validateEnv(process.env, RmqValidator)

	return {
		url: process.env.RMQ_URL!,
	}
})
