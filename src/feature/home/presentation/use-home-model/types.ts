import type { UiState } from '@/core/presentation/ui-state';
import type { TodayItem } from '../../domain/today-schedule';

export interface HomeData {
  readonly greeting: string;
  readonly dateLabel: string;
  readonly today: ReadonlyArray<TodayItem>;
  readonly attentionCount: number;
  readonly totalPatients: number;
}

export interface HomeModel {
  readonly ui: UiState<HomeData>;
  readonly refresh: () => void;
}
