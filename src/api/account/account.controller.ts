import {
	ACCOUNT_SERVICE_NAME,
	type AccountServiceController,
	type GetAccountRequest,
	type GetAccountResponse,
} from '@fatal-cinema/contracts/gen/account'
import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'

import { AccountService } from './account.service'

@Controller()
export class AccountController implements AccountServiceController {
	constructor(private readonly accountService: AccountService) {}

	@GrpcMethod(ACCOUNT_SERVICE_NAME, 'GetAccount')
	async getAccount(data: GetAccountRequest): Promise<GetAccountResponse> {
		return this.accountService.getAccount(data)
	}
}
