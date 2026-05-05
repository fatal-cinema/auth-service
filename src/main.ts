import { ConfigService } from '@nestjs/config'
import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'

import { PrismaClientExceptionFilter } from '@shared/filters'
import type { AllConfigs } from '@shared/interfaces'

import { AppModule } from './app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	const config = app.get(ConfigService<AllConfigs>)
	const httpAdapterHost = app.get(HttpAdapterHost)

	app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapterHost.httpAdapter))

	const grpcHost = config.getOrThrow('grpc.host', { infer: true })
	const grpcPort = config.getOrThrow('grpc.port', { infer: true })

	app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.GRPC,
		options: {
			package: ['auth.v1'],
			protoPath: 'node_modules/@fatal-cinema/contracts/proto/auth/v1/auth.proto',
			url: `${grpcHost}:${grpcPort}`,
			loader: {
				keepCase: false,
				longs: String,
				enums: String,
				defaults: true,
				oneofs: true,
			},
		},
	})

	await app.startAllMicroservices()
	await app.init()
}
bootstrap()
