import type { Patient } from '@/core/domain/model';
import type { PatientStatusFilter } from '@/core/domain/repository';
import type { UiState } from '@/core/presentation/ui-state';

export interface PatientsListData {
  readonly items: ReadonlyArray<Patient>;
  readonly total: number;
}

export interface PatientsState {
  readonly ui: UiState<PatientsListData>;
  readonly filter: PatientStatusFilter;
  readonly search: string;
  readonly loadingMore: boolean;
}
