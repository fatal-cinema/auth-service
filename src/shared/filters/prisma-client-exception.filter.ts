import { RpcStatus } from '@fatal-cinema/common'
import { ArgumentsHost, Catch, HttpStatus, Logger } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { RpcException } from '@nestjs/microservices'
import { Prisma } from '@prisma/generated/client'
import { Response } from 'express'
import { Observable, throwError } from 'rxjs'

@Catch(Prisma.PrismaClientKnownRequestError) // Ловим только ошибки Prisma
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
	private readonly logger = new Logger(PrismaClientExceptionFilter.name)

	catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost): Observable<never> {
		const errorLog = {
			code: exception.code,
			timestamp: new Date().toISOString(),
			model: exception.meta?.modelName,
			target: exception.meta?.target,
			// Стек-трейс пишем только если это не 404/409, чтобы не забивать память
			stack: !['P2002', 'P2025'].includes(exception.code) ? exception.stack : undefined,
		}

		this.logger.warn(`Prisma Error ${exception.code}`, errorLog)

		switch (exception.code) {
			case 'P2002': {
				// Ошибка уникальности (email уже есть)
				const target = (exception.meta?.target as string[])?.join(', ')
				const fields = (exception.meta?.target as string[]) || []

				return throwError(() => {
					new RpcException({
						code: RpcStatus.ALREADY_EXISTS,
						details: `Запись с таким значением уже существует${target ? `: ${target}` : ''}`,
						fields,
					})
				})
			}
			case 'P2025': {
				// Запись не найдена (ошибка update/delete)
				return throwError(() => {
					new RpcException({
						code: RpcStatus.NOT_FOUND,
						details: 'Запись не найдена в базе данных',
					})
				})
			}
			default:
				// Все остальные ошибки Prisma (P2003, P2024 и т.д.) пробрасываем как 500
				return throwError(
					() =>
						new RpcException({
							code: RpcStatus.INTERNAL,
							details: 'Internal Server Error',
						})
				)
		}
	}
}
