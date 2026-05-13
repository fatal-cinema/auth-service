import { Injectable } from '@nestjs/common'
import { AccountCreateInput, AccountUpdateInput } from '@prisma/generated/models'

import { PrismaService } from '@core/prisma/prisma.service'
import { returnAccountObject, TAccount } from '@shared/objects'

@Injectable()
export class AuthRepository {
	constructor(private readonly prismaService: PrismaService) {}
}
