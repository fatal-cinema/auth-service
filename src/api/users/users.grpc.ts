import {
	USERS_SERVICE_NAME,
	type CreateUserRequest,
	type CreateUserResponse,
	type GetMeRequest,
	type GetMeResponse,
	type PatchUserRequest,
	type PatchUserResponse,
	type UsersServiceClient,
} from '@fatal-cinema/contracts/gen/users'
import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { type ClientGrpc } from '@nestjs/microservices'
import { Observable } from 'rxjs'

@Injectable()
export class UsersGrpcClient implements OnModuleInit, UsersServiceClient {
	private usersService: UsersServiceClient

	constructor(@Inject(USERS_SERVICE_NAME) private readonly client: ClientGrpc) {}

	onModuleInit() {
		this.usersService = this.client.getService<UsersServiceClient>(USERS_SERVICE_NAME)
	}

	createUser(request: CreateUserRequest): Observable<CreateUserResponse> {
		return this.usersService.createUser(request)
	}

	getMe(request: GetMeRequest): Observable<GetMeResponse> {
		return this.usersService.getMe(request)
	}

	patchUser(request: PatchUserRequest): Observable<PatchUserResponse> {
		return this.usersService.patchUser(request)
	}
}
