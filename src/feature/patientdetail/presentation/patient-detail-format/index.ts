import type { Patient } from '@/core/domain/model';

export function patientHeadline(patient: Patient): string {
  const weight = patient.weightKg.toFixed(1).replace('.', ',');
  const height = patient.heightM.toFixed(2).replace('.', ',');
  return `${patient.ageYears} anos · ${weight} kg · ${height} m`;
}

export function weightDeltaLabel(values: ReadonlyArray<number>): string | null {
  const first = values[0];
  const last = values[values.length - 1];
  if (first === undefined || last === undefined || values.length < 2) return null;

  const delta = Number((last - first).toFixed(1));
  if (delta === 0) return 'sem variação em 30 dias';
  const arrow = delta < 0 ? '↓' : '↑';
  return `${arrow} ${Math.abs(delta).toFixed(1).replace('.', ',')} kg em 30 dias`;
}
