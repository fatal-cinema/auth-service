import { Injectable } from '@nestjs/common'
import { AccountCreateInput } from '@prisma/generated/models'

import { PrismaService } from '@core/prisma/prisma.service'
import { returnAccountObject, TAccount } from '@shared/objects'

@Injectable()
export class AuthRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async findByPhone(phone: string): Promise<TAccount | null> {
		const account = await this.prismaService.account.findUnique({
			where: { phone },
			select: returnAccountObject,
		})

		return account
	}

	async findByEmail(email: string): Promise<TAccount | null> {
		const account = await this.prismaService.account.findUnique({
			where: { email },
			select: returnAccountObject,
		})

		return account
	}

	async create(data: AccountCreateInput): Promise<TAccount> {
		const newAccount = await this.prismaService.account.create({
			data,
			select: returnAccountObject,
		})

		return newAccount
	}
}
