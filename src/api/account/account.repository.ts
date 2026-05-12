import { Injectable } from '@nestjs/common'
import { ContactType } from '@prisma/generated/enums'
import { PendingContactChangeUpdateInput } from '@prisma/generated/models'

import { PrismaService } from '@core/prisma/prisma.service'
import { returnAccountObject, returnPendingContactChangeObject, TAccount, TPendingContactChange } from '@shared/objects'

@Injectable()
export class AccountRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async findById(id: string): Promise<TAccount | null> {
		const account = await this.prismaService.account.findUnique({
			where: {
				id,
			},
			select: returnAccountObject,
		})

		return account
	}

	async findPendingContactChange(accountId: string, type: ContactType): Promise<TPendingContactChange | null> {
		const pendingContactChange = await this.prismaService.pendingContactChange.findUnique({
			where: {
				accountId_type: {
					accountId,
					type,
				},
			},
			select: returnPendingContactChangeObject,
		})

		return pendingContactChange
	}

	async upsertPendingContactChange(data: {
		accountId: string
		type: ContactType
		value: string
		codeHash: string
		expiresAt: Date
	}): Promise<TPendingContactChange | null> {
		const upsertedPendingContactChange = await this.prismaService.pendingContactChange.upsert({
			where: {
				accountId_type: {
					accountId: data.accountId,
					type: data.type,
				},
			},
			create: data,
			update: data,
			select: returnPendingContactChangeObject,
		})

		return upsertedPendingContactChange
	}

	async deletePendingContactChange(accountId: string, type: ContactType): Promise<void> {
		await this.prismaService.pendingContactChange.delete({
			where: {
				accountId_type: {
					accountId: accountId,
					type: type,
				},
			},
			select: null,
		})
	}
}
