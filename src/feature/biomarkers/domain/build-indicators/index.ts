import type { Measurement, Patient } from '@/core/domain/model';
import { bmiScale, classify, classifyBloodPressure, glycemiaScale, systolicScale } from '../clinical-bands';
import { computeBmi } from '../compute-bmi';
import { measurementTrend } from '../measurement-trend';
import type { Indicator } from './types';

export type { Indicator } from './types';

/** Monta os três indicadores da ficha a partir das medições cruas. */
export function buildIndicators(
  patient: Patient,
  measurements: ReadonlyArray<Measurement>,
): ReadonlyArray<Indicator> {
  const indicators: Indicator[] = [];

  const glycemia = measurements.filter((measurement) => measurement.kind === 'glicemia');
  const latestGlycemia = glycemia[glycemia.length - 1];
  if (latestGlycemia) {
    const trend = measurementTrend(glycemia);
    indicators.push({
      key: 'glicemia',
      label: 'Glicemia',
      value: latestGlycemia.value,
      displayValue: String(Math.round(latestGlycemia.value)),
      unit: glycemiaScale.unit,
      scale: glycemiaScale,
      levelLabel: classify(latestGlycemia.value, glycemiaScale).label,
      deltaLabel: trend.direction === 'estavel' ? 'Estável' : `${trend.percent > 0 ? '↑' : '↓'} ${Math.abs(trend.percent)}%`,
      deltaTone: trend.direction === 'subindo' ? 'danger' : trend.direction === 'descendo' ? 'success' : 'muted',
    });
  }

  const pressure = measurements.filter((measurement) => measurement.kind === 'pressao');
  const latestPressure = pressure[pressure.length - 1];
  if (latestPressure) {
    const diastolic = latestPressure.secondaryValue ?? 0;
    const reading = classifyBloodPressure(latestPressure.value, diastolic);
    indicators.push({
      key: 'pressao',
      label: 'Pressão',
      value: latestPressure.value,
      displayValue: `${Math.round(latestPressure.value)}/${Math.round(diastolic)}`,
      unit: systolicScale.unit,
      scale: systolicScale,
      levelLabel: reading.label,
      deltaLabel: reading.label,
      deltaTone: reading.level === 'normal' ? 'muted' : 'danger',
    });
  }

  const bmi = computeBmi(patient.weightKg, patient.heightM);
  if (bmi.ok) {
    indicators.push({
      key: 'imc',
      label: 'IMC',
      value: bmi.value,
      displayValue: bmi.value.toFixed(1).replace('.', ','),
      unit: '',
      scale: bmiScale,
      levelLabel: classify(bmi.value, bmiScale).label,
      deltaLabel: classify(bmi.value, bmiScale).label,
      deltaTone: 'muted',
    });
  }

  return indicators;
}
