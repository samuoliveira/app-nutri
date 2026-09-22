import type { Band } from '@/core/domain/model';

export interface RangeBarProps {
  value: number;
  bands: ReadonlyArray<Band>;
  /** Marcas de escala desenhadas embaixo (ex.: 70 · 100 · 126). */
  ticks: ReadonlyArray<number>;
  min: number;
  max: number;
  accessibilityLabel: string;
}
