import { convertEnum, nullToUndefined, RpcStatus } from '@fatal-cinema/common'
import { GetAccountRequest, GetAccountResponse, Role } from '@fatal-cinema/contracts/gen/account'
import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'

import { AccountRepository } from './account.repository'

@Injectable()
export class AccountService {
	constructor(private readonly accountRepository: AccountRepository) {}

	async getAccount(data: GetAccountRequest): Promise<GetAccountResponse> {
		const { id } = data

		const account = await this.accountRepository.findById(id)

		if (!account) {
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Account not found',
			})
		}

		return { ...nullToUndefined(account), role: convertEnum(Role, account.role) }
	}
}
