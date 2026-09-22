import type { Measurement } from '@/core/domain/model';
import type { UiState } from '@/core/presentation/ui-state';
import type { SessionState } from '@/core/state/session-store';
import type { Indicator } from '../../domain/build-indicators/types';

export type BiomarkerRange = SessionState['biomarkerRange'];

export interface BiomarkersData {
  readonly patientName: string;
  readonly indicators: ReadonlyArray<Indicator>;
  readonly readings: ReadonlyArray<{ id: string; label: string; value: string }>;
  readonly measurements: ReadonlyArray<Measurement>;
}

export interface BiomarkersModel {
  readonly ui: UiState<BiomarkersData>;
  readonly range: BiomarkerRange;
  readonly setRange: (range: BiomarkerRange) => void;
  readonly refresh: () => void;
}
