import type { Measurement } from '@/core/domain/model';
import type { Trend } from './types';

export type { Trend } from './types';

/** Abaixo disso o produto trata como estável: ruído de medição não é tendência. */
export const TREND_THRESHOLD_PERCENT = 5;

export function measurementTrend(measurements: ReadonlyArray<Measurement>): Trend {
  const ordered = [...measurements].sort((a, b) => Date.parse(a.takenAt) - Date.parse(b.takenAt));
  const first = ordered[0];
  const last = ordered[ordered.length - 1];

  if (!first || !last || ordered.length < 2 || first.value === 0) {
    return { percent: 0, direction: 'estavel' };
  }

  const percent = Number((((last.value - first.value) / first.value) * 100).toFixed(1));
  if (Math.abs(percent) < TREND_THRESHOLD_PERCENT) return { percent, direction: 'estavel' };

  return { percent, direction: percent > 0 ? 'subindo' : 'descendo' };
}

/** Regra 1 do produto: glicemia subindo 5%+ nas últimas 3 medições vira Atenção. */
export function isGlycemiaRising(measurements: ReadonlyArray<Measurement>): boolean {
  const glycemia = measurements
    .filter((measurement) => measurement.kind === 'glicemia')
    .sort((a, b) => Date.parse(a.takenAt) - Date.parse(b.takenAt))
    .slice(-3);

  if (glycemia.length < 3) return false;
  return measurementTrend(glycemia).direction === 'subindo';
}
