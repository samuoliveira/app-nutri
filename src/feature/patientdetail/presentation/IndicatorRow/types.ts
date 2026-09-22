import type { Indicator } from '@/feature/biomarkers/domain';

export interface IndicatorRowProps {
  indicator: Indicator;
  last?: boolean;
}
