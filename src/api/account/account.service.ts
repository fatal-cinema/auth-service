import { convertEnum, nullToUndefined, RpcStatus } from '@fatal-cinema/common'
import {
	ConfirmEmailChangeRequest,
	ConfirmEmailChangeResponse,
	ConfirmPhoneChangeRequest,
	ConfirmPhoneChangeResponse,
	GetAccountRequest,
	GetAccountResponse,
	InitEmailChangeRequest,
	InitEmailChangeResponse,
	InitPhoneChangeRequest,
	InitPhoneChangeResponse,
	Role,
} from '@fatal-cinema/contracts/gen/account'
import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'

import { OtpService } from '@libs/otp/otp.service'
import { UserRepository } from '@shared/repositories'

import { AccountRepository } from './account.repository'

@Injectable()
export class AccountService {
	constructor(
		private readonly accountRepository: AccountRepository,
		private readonly userRepository: UserRepository,
		private readonly otpService: OtpService
	) {}

	async getAccount(data: GetAccountRequest): Promise<GetAccountResponse> {
		const { id } = data

		const account = await this.userRepository.findById(id)

		if (!account) {
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Account not found',
			})
		}

		return { ...nullToUndefined(account), role: convertEnum(Role, account.role) }
	}

	async initEmailChange(data: InitEmailChangeRequest): Promise<InitEmailChangeResponse> {
		const { email, userId } = data

		const existingUser = await this.userRepository.findByEmail(email)

		if (existingUser) {
			throw new RpcException({
				code: RpcStatus.ALREADY_EXISTS,
				details: 'Email already in use',
			})
		}

		const { code, hash } = await this.otpService.send(email, 'email')

		console.debug('CODE: ', code)

		await this.accountRepository.upsertPendingContactChange({
			accountId: userId,
			type: 'EMAIL',
			value: email,
			codeHash: hash,
			expiresAt: new Date(Date.now() + 5 * 60 * 1000),
		})

		return { ok: true }
	}

	async confirmEmailChange(data: ConfirmEmailChangeRequest): Promise<ConfirmEmailChangeResponse> {
		const { code, email, userId } = data

		const pendingContactChange = await this.accountRepository.findPendingContactChange(userId, 'EMAIL')

		if (!pendingContactChange) {
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'No pending request',
			})
		}
		if (pendingContactChange.value !== email) {
			throw new RpcException({
				code: RpcStatus.INVALID_ARGUMENT,
				details: 'Email mismatch',
			})
		}
		if (pendingContactChange.expiresAt < new Date()) {
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Code expired',
			})
		}

		await this.otpService.verify(pendingContactChange.value, 'email', code)

		await this.userRepository.update(userId, {
			email,
			isEmailVerified: true,
		})

		await this.accountRepository.deletePendingContactChange(userId, 'EMAIL')

		return { ok: true }
	}

	async initPhoneChange(data: InitPhoneChangeRequest): Promise<InitPhoneChangeResponse> {
		const { phone, userId } = data

		const existingUser = await this.userRepository.findByPhone(phone)

		if (existingUser) {
			throw new RpcException({
				code: RpcStatus.ALREADY_EXISTS,
				details: 'Phone already in use',
			})
		}

		const { code, hash } = await this.otpService.send(phone, 'phone')

		console.debug('CODE: ', code)

		await this.accountRepository.upsertPendingContactChange({
			accountId: userId,
			type: 'PHONE',
			value: phone,
			codeHash: hash,
			expiresAt: new Date(Date.now() + 5 * 60 * 1000),
		})

		return { ok: true }
	}

	async confirmPhoneChange(data: ConfirmPhoneChangeRequest): Promise<ConfirmPhoneChangeResponse> {
		const { code, phone, userId } = data

		const pendingContactChange = await this.accountRepository.findPendingContactChange(userId, 'PHONE')

		if (!pendingContactChange) {
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'No pending request',
			})
		}
		if (pendingContactChange.value !== phone) {
			throw new RpcException({
				code: RpcStatus.INVALID_ARGUMENT,
				details: 'Phone mismatch',
			})
		}
		if (pendingContactChange.expiresAt < new Date()) {
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Code expired',
			})
		}

		await this.otpService.verify(pendingContactChange.value, 'phone', code)

		await this.userRepository.update(userId, {
			phone,
			isPhoneVerified: true,
		})

		await this.accountRepository.deletePendingContactChange(userId, 'PHONE')

		return { ok: true }
	}
}
