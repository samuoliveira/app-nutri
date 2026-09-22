import type { Band, BandLevel } from '@/core/domain/model';

export interface BandScale {
  readonly bands: ReadonlyArray<Band>;
  /** Extremos do desenho: a faixa nunca some na borda. */
  readonly min: number;
  readonly max: number;
  readonly ticks: ReadonlyArray<number>;
  readonly unit: string;
}

export interface BandReading {
  readonly level: BandLevel;
  readonly label: string;
}
