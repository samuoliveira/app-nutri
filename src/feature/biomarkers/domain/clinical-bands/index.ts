import type { Band, BandLevel } from '@/core/domain/model';
import type { BandReading, BandScale } from './types';

export type { BandReading, BandScale } from './types';

/** Glicemia de jejum (mg/dL): <70 baixa · 70–99 normal · 100–125 atenção · 126+ alta. */
export const glycemiaScale: BandScale = {
  min: 50,
  max: 170,
  ticks: [70, 100, 126],
  unit: 'mg/dL',
  bands: [
    { level: 'baixo', from: 50, to: 70, label: 'Baixa' },
    { level: 'normal', from: 70, to: 100, label: 'Normal' },
    { level: 'atencao', from: 100, to: 126, label: 'Atenção' },
    { level: 'alto', from: 126, to: 170, label: 'Alta' },
  ],
};

/** Pressão sistólica (mmHg): <120 normal · 120–129 elevada · 130+ alta. */
export const systolicScale: BandScale = {
  min: 90,
  max: 180,
  ticks: [120, 130],
  unit: 'mmHg',
  bands: [
    { level: 'normal', from: 90, to: 120, label: 'Normal' },
    { level: 'atencao', from: 120, to: 130, label: 'Elevada' },
    { level: 'alto', from: 130, to: 180, label: 'Alta' },
  ],
};

/** IMC (OMS): <18,5 baixo · 18,5–24,9 normal · 25–29,9 sobrepeso · 30+ obesidade. */
export const bmiScale: BandScale = {
  min: 15,
  max: 40,
  ticks: [18.5, 25, 30],
  unit: '',
  bands: [
    { level: 'baixo', from: 15, to: 18.5, label: 'Baixo peso' },
    { level: 'normal', from: 18.5, to: 25, label: 'Adequado' },
    { level: 'atencao', from: 25, to: 30, label: 'Sobrepeso' },
    { level: 'alto', from: 30, to: 40, label: 'Obesidade' },
  ],
};

/** Diastólica 80+ já classifica como alta, mesmo com sistólica normal. */
export const DIASTOLIC_HIGH_FROM = 80;

export function classify(value: number, scale: BandScale): BandReading {
  const band = findBand(value, scale.bands);
  return { level: band.level, label: band.label };
}

export function classifyBloodPressure(systolic: number, diastolic: number): BandReading {
  const bySystolic = classify(systolic, systolicScale);
  if (diastolic >= DIASTOLIC_HIGH_FROM) return { level: 'alto', label: 'Alta' };
  return bySystolic;
}

export function isOutOfRange(level: BandLevel): boolean {
  return level === 'atencao' || level === 'alto' || level === 'baixo';
}

function findBand(value: number, bands: ReadonlyArray<Band>): Band {
  for (const band of bands) {
    if (value >= band.from && value < band.to) return band;
  }
  const last = bands[bands.length - 1];
  const first = bands[0];
  if (last && value >= last.to) return last;
  return first ?? { level: 'normal', from: 0, to: 0, label: '—' };
}
