import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'

import { PrismaClientExceptionFilter } from '@shared/filters'

import { AppModule } from './app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	const httpAdapterHost = app.get(HttpAdapterHost)

	app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapterHost.httpAdapter))

	app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.GRPC,
		options: {
			package: ['auth.v1'],
			protoPath: 'node_modules/@fatal-cinema/contracts/proto/auth/v1/auth.proto',
			url: 'localhost:50051',
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
