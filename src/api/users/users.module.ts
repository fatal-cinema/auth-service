import { PROTO_PATHS } from '@fatal-cinema/contracts'
import { USERS_SERVICE_NAME, USERS_V1_PACKAGE_NAME } from '@fatal-cinema/contracts/gen/users'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ClientsModule, Transport } from '@nestjs/microservices'

import type { AllConfigs } from '@shared/interfaces'

import { UsersGrpcClient } from './users.grpc'

@Module({
	imports: [
		ClientsModule.registerAsync([
			{
				name: USERS_SERVICE_NAME,
				useFactory: (configService: ConfigService<AllConfigs>) => ({
					transport: Transport.GRPC,
					options: {
						package: USERS_V1_PACKAGE_NAME,
						protoPath: PROTO_PATHS.USERS,
						url: configService.getOrThrow('grpc.clients.users', { infer: true }),
					},
				}),
				inject: [ConfigService],
			},
		]),
	],
	providers: [UsersGrpcClient],
	exports: [UsersGrpcClient],
})
export class UsersModule {}
