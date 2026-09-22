import type { Measurement, Patient } from '@/core/domain/model';
import type { UiState } from '@/core/presentation/ui-state';
import type { Indicator } from '@/feature/biomarkers/domain';

export interface PatientDetailData {
  readonly patient: Patient;
  readonly indicators: ReadonlyArray<Indicator>;
  readonly weightSeries: ReadonlyArray<number>;
  readonly measurements: ReadonlyArray<Measurement>;
}

export interface PatientDetailModel {
  readonly ui: UiState<PatientDetailData>;
  readonly refresh: () => void;
  readonly togglePin: () => void;
}
