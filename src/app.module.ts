import { Module } from '@nestjs/common'

import { CoreModule } from '@core/core.module'
import { SharedModule } from '@shared/shared.module'
import { ApiModule } from '@api/api.module'

@Module({
	imports: [SharedModule, CoreModule, ApiModule],
})
export class AppModule {}
