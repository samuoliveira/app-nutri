import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { FeatureFlag } from '../flags/feature-flag.entity';
import { Insight } from '../insights/insight.entity';
import { Measurement } from '../patients/measurement.entity';
import { Patient } from '../patients/patient.entity';
import { Appointment } from '../schedule/appointment.entity';

/**
 * synchronize ligado porque é um projeto de avaliação: o schema nasce com o
 * container. Em produção isso vira migration versionada.
 */
export function databaseConfig(): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number(process.env.DATABASE_PORT ?? 5432),
    username: process.env.DATABASE_USER ?? 'nutri',
    password: process.env.DATABASE_PASSWORD ?? 'nutri',
    database: process.env.DATABASE_NAME ?? 'nutri',
    entities: [Patient, Measurement, Insight, FeatureFlag, Appointment],
    synchronize: true,
    retryAttempts: 10,
    retryDelay: 3000,
  };
}
