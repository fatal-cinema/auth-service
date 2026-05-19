import { Injectable } from '@nestjs/common'

import { PrismaService } from '@core/prisma/prisma.service'

@Injectable()
export class AuthRepository {
	constructor(private readonly prismaService: PrismaService) {}
}
