import type { INestApplication } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Transport, type MicroserviceOptions } from '@nestjs/microservices'

import type { AllConfigs } from '@shared/interfaces'

import { grpcLoader, grpcPackages, grpcProtoPaths } from './grpc.options'

export function createGrpcServer(app: INestApplication, config: ConfigService<AllConfigs>) {
	const grpcHost = config.getOrThrow('grpc.host', { infer: true })
	const grpcPort = config.getOrThrow('grpc.port', { infer: true })

	app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.GRPC,
		options: {
			package: grpcPackages,
			protoPath: grpcProtoPaths,
			url: `${grpcHost}:${grpcPort}`,
			loader: grpcLoader,
		},
	})
}
