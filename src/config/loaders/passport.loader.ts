import { PassportOptions } from '@fatal-cinema/passport'
import { ConfigService } from '@nestjs/config'

import type { AllConfigs } from '@shared/interfaces'

export function getPassportConfig(configService: ConfigService<AllConfigs>): PassportOptions {
	return {
		secretKey: configService.getOrThrow('passport.secret', { infer: true }),
	}
}
