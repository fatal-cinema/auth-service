import { registerAs } from '@nestjs/config'

import type { PassportConfig } from '@shared/interfaces'
import { validateEnv } from '@shared/utils'
import { PassportValidator } from '@shared/validators'

export const passportEnv = registerAs<PassportConfig>('passport', () => {
	validateEnv(process.env, PassportValidator)

	return {
		secret: process.env.PASSPORT_SECRET!,
		accessTtl: parseInt(process.env.PASSPORT_ACCESS_TTL!),
		refreshTtl: parseInt(process.env.PASSPORT_REFRESH_TTL!),
	}
})
