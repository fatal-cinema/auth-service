import { Injectable } from '@nestjs/common'

import { PrismaService } from '@core/prisma/prisma.service'
import { returnAccountObject, TAccount } from '@shared/objects'

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
}
