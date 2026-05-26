import { ConfigService } from '@nestjs/config'
import { HttpAdapterHost, NestFactory } from '@nestjs/core'

import { createGrpcServer } from '@core/grpc/grpc.server'
import { PrismaClientExceptionFilter } from '@shared/filters'

import '@observability/tracing/tracing'

import { AppModule } from './app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	const config = app.get(ConfigService)
	const httpAdapterHost = app.get(HttpAdapterHost)

	app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapterHost.httpAdapter))

	createGrpcServer(app, config)

	await app.startAllMicroservices()
	await app.listen(9101)
}
bootstrap()
