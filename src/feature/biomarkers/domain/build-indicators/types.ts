import type { BandScale } from '../clinical-bands/types';

export interface Indicator {
  readonly key: 'glicemia' | 'pressao' | 'imc';
  readonly label: string;
  readonly value: number;
  readonly displayValue: string;
  readonly unit: string;
  readonly scale: BandScale;
  readonly levelLabel: string;
  readonly deltaLabel: string;
  readonly deltaTone: 'muted' | 'danger' | 'success';
}
