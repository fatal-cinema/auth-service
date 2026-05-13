import { Injectable } from '@nestjs/common'

import { PrismaService } from '@core/prisma/prisma.service'
import { returnAccountObject, TAccount } from '@shared/objects'

@Injectable()
export class TelegramRepository {
	constructor(private readonly prismaService: PrismaService) {}

	async findByTelegramId(telegramId: string): Promise<TAccount | null> {
		const account = await this.prismaService.account.findUnique({
			where: { telegramId },
			select: returnAccountObject,
		})

		return account
	}
}
