import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FlagsModule } from './flags/flags.module';
import { HealthController } from './health/health.controller';
import { InsightsModule } from './insights/insights.module';
import { PatientsModule } from './patients/patients.module';
import { ScheduleModule } from './schedule/schedule.module';
import { databaseConfig } from './database/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(databaseConfig()),
    PatientsModule,
    InsightsModule,
    FlagsModule,
    ScheduleModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
