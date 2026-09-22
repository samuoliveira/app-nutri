/** Portas: o domínio declara, a camada data implementa. */
import type { Appointment, Insight, Measurement, Patient } from '../model';
import type { Result } from '../result';

export interface PatientQuery {
  readonly status: PatientStatusFilter;
  readonly search: string;
}

export type PatientStatusFilter = 'all' | 'em_dia' | 'atencao' | 'novo';

export interface PatientPage {
  readonly items: ReadonlyArray<Patient>;
  readonly total: number;
  readonly nextCursor: string | null;
}

export interface PatientRepository {
  list(query: PatientQuery, cursor: string | null): Promise<Result<PatientPage>>;
  byId(id: string): Promise<Result<Patient>>;
  setPinned(id: string, pinned: boolean): Promise<Result<Patient>>;
  countByStatus(): Promise<Result<Record<'em_dia' | 'atencao' | 'novo', number>>>;
}

export interface MeasurementRepository {
  history(patientId: string, sinceISO: string): Promise<Result<ReadonlyArray<Measurement>>>;
  latest(patientId: string): Promise<Result<ReadonlyArray<Measurement>>>;
}

export interface ScheduleRepository {
  today(nowISO: string): Promise<Result<ReadonlyArray<Appointment>>>;
}

export interface InsightRepository {
  latestFor(patientId: string): Promise<Result<Insight | null>>;
  create(patientId: string): Promise<Result<Insight>>;
}

export interface FlagRepository {
  snapshot(): Promise<Result<Record<string, boolean>>>;
}
