import { PassportService, TokenPayload } from '@fatal-cinema/passport'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { AllConfigs } from '@shared/interfaces'

@Injectable()
export class TokenService {
	private readonly ACCESS_TOKEN_TTL: number
	private readonly REFRESH_TOKEN_TTL: number

	constructor(
		private readonly configService: ConfigService<AllConfigs>,
		private readonly passportService: PassportService
	) {
		this.ACCESS_TOKEN_TTL = configService.getOrThrow('passport.accessTtl', { infer: true })
		this.REFRESH_TOKEN_TTL = configService.getOrThrow('passport.refreshTtl', { infer: true })
	}

	generate(userId: string) {
		const payload: TokenPayload = {
			sub: userId,
		}

		const accessToken = this.passportService.generate(String(payload.sub), this.ACCESS_TOKEN_TTL)
		const refreshToken = this.passportService.generate(String(payload.sub), this.REFRESH_TOKEN_TTL)

		return { accessToken, refreshToken }
	}

	verify(token: string) {
		return this.passportService.verify(token)
	}
}
