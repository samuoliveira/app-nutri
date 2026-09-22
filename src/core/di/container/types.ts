import type { Database } from '@/core/database/database';
import type {
  FlagRepository,
  InsightRepository,
  MeasurementRepository,
  PatientRepository,
  ScheduleRepository,
} from '@/core/domain/repository';

export interface Container {
  readonly database: Database;
  readonly patients: PatientRepository;
  readonly measurements: MeasurementRepository;
  readonly schedule: ScheduleRepository;
  readonly insights: InsightRepository;
  readonly flags: FlagRepository;
}
