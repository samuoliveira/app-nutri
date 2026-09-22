import type { Insight } from '@/core/domain/model';
import type { UiState } from '@/core/presentation/ui-state';

export interface InsightState {
  readonly ui: UiState<Insight>;
  readonly creating: boolean;
  readonly approved: boolean;
}
