import type { Patient } from '@/core/domain/model';
import type { PatientQuery } from '@/core/domain/repository';

export interface ListPatientsInput {
  readonly query: PatientQuery;
  readonly cursor: string | null;
}

export interface ListPatientsOutput {
  readonly items: ReadonlyArray<Patient>;
  readonly total: number;
  readonly nextCursor: string | null;
}
