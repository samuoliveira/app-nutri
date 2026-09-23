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

/** Resultado de uma rodada de reenvio da fila offline. */
export interface SyncReport {
  /** Confirmadas pelo servidor e removidas da fila. */
  readonly sent: number;
  /** Recusadas pelo servidor: mudança local desfeita e removidas da fila. */
  readonly dropped: number;
  /** Continuam na fila porque a rede falhou de novo. */
  readonly remaining: number;
}

export interface PatientRepository {
  list(query: PatientQuery, cursor: string | null): Promise<Result<PatientPage>>;
  byId(id: string): Promise<Result<Patient>>;
  setPinned(id: string, pinned: boolean): Promise<Result<Patient>>;
  countByStatus(): Promise<Result<Record<'em_dia' | 'atencao' | 'novo', number>>>;
  /** Reenvia ao servidor o que ficou na fila enquanto o aparelho estava offline. */
  syncPending(): Promise<Result<SyncReport>>;
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
  approve(insightId: string): Promise<Result<Insight>>;
}

export interface FlagRepository {
  snapshot(): Promise<Result<Record<string, boolean>>>;
}
