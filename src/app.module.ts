import { Module } from '@nestjs/common'

import { CoreModule } from '@core/core.module'
import { LibsModule } from '@libs/libs.module'
import { ObservabilityModule } from '@observability/observability.module'
import { SharedModule } from '@shared/shared.module'
import { ApiModule } from '@api/api.module'

@Module({
	imports: [SharedModule, CoreModule, LibsModule, ObservabilityModule, ApiModule],
})
export class AppModule {}
