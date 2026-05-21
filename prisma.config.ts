import * as dotenv from 'dotenv'
import { defineConfig } from 'prisma/config'

if (process.env.NODE_ENV !== 'production') {
	dotenv.config({ path: '.env.development.local' })
}

export default defineConfig({
	schema: 'prisma/schema.prisma',
	migrations: {
		path: 'prisma/migrations',
	},
	datasource: {
		url: `postgresql://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`,
	},
})
