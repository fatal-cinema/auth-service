import { Matches } from 'class-validator'

export class RmqValidator {
	@Matches(/^amqp:\/\/[^:]+:[^@]+@[^:]+:\d+$/)
	RMQ_URL: string
}
