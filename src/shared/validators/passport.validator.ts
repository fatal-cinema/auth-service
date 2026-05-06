import { IsInt, IsString } from 'class-validator'

export class PassportValidator {
	@IsString()
	PASSPORT_SECRET: string

	@IsInt()
	PASSPORT_ACCESS_TTL: number

	@IsInt()
	PASSPORT_REFRESH_TTL: number
}
