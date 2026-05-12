import { AccountGetPayload, AccountSelect } from '@/prisma/generated/models'

export const returnAccountObject = {
	id: true,
	phone: true,
	email: true,
	isEmailVerified: true,
	isPhoneVerified: true,
	role: true,
} satisfies AccountSelect

export type TAccount = AccountGetPayload<{
	select: typeof returnAccountObject
}>
