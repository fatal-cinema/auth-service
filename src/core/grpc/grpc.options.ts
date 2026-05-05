import { PROTO_PATHS } from '@fatal-cinema/contracts'
import { AUTH_V1_PACKAGE_NAME } from '@fatal-cinema/contracts/gen/auth'
import type { GrpcOptions } from '@nestjs/microservices'

export const grpcPackages = [AUTH_V1_PACKAGE_NAME]

export const grpcProtoPaths = [PROTO_PATHS.AUTH]

export const grpcLoader: NonNullable<GrpcOptions['options']['loader']> = {
	keepCase: false,
	longs: String,
	enums: String,
	defaults: true,
	oneofs: true,
}
