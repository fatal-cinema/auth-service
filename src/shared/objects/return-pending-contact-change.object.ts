import { PendingContactChangeGetPayload, PendingContactChangeSelect } from '@/prisma/generated/models'

export const returnPendingContactChangeObject = {
	id: true,
	accountId: true,
	expiresAt: true,
	type: true,
	value: true,
} satisfies PendingContactChangeSelect

export type TPendingContactChange = PendingContactChangeGetPayload<{
	select: typeof returnPendingContactChangeObject
}>
