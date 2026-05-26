import {
	ACCOUNT_SERVICE_NAME,
	type AccountServiceController,
	type ConfirmEmailChangeRequest,
	type ConfirmEmailChangeResponse,
	type ConfirmPhoneChangeRequest,
	type ConfirmPhoneChangeResponse,
	type GetAccountRequest,
	type GetAccountResponse,
	type InitEmailChangeRequest,
	type InitEmailChangeResponse,
	type InitPhoneChangeRequest,
	type InitPhoneChangeResponse,
} from '@fatal-cinema/contracts/gen/account'
import { Controller, UseInterceptors } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'

import { GrpcMetricsInterceptor } from '@observability/interceptors'

import { AccountService } from './account.service'

@UseInterceptors(GrpcMetricsInterceptor)
@Controller()
export class AccountController implements AccountServiceController {
	constructor(private readonly accountService: AccountService) {}

	@GrpcMethod(ACCOUNT_SERVICE_NAME, 'GetAccount')
	async getAccount(data: GetAccountRequest): Promise<GetAccountResponse> {
		return this.accountService.getAccount(data)
	}

	@GrpcMethod(ACCOUNT_SERVICE_NAME, 'InitEmailChange')
	initEmailChange(data: InitEmailChangeRequest): Promise<InitEmailChangeResponse> {
		return this.accountService.initEmailChange(data)
	}

	@GrpcMethod(ACCOUNT_SERVICE_NAME, 'ConfirmEmailChange')
	confirmEmailChange(data: ConfirmEmailChangeRequest): Promise<ConfirmEmailChangeResponse> {
		return this.accountService.confirmEmailChange(data)
	}

	@GrpcMethod(ACCOUNT_SERVICE_NAME, 'InitPhoneChange')
	initPhoneChange(data: InitPhoneChangeRequest): Promise<InitPhoneChangeResponse> {
		return this.accountService.initPhoneChange(data)
	}

	@GrpcMethod(ACCOUNT_SERVICE_NAME, 'ConfirmPhoneChange')
	confirmPhoneChange(data: ConfirmPhoneChangeRequest): Promise<ConfirmPhoneChangeResponse> {
		return this.accountService.confirmPhoneChange(data)
	}
}
