import type { Measurement } from './measurement.entity';
import type { Patient } from './patient.entity';

export type PatientStatus = 'novo' | 'atencao' | 'em_dia';

const NEW_PATIENT_DAYS = 14;
const STALE_VISIT_DAYS = 45;
const GLUCOSE_ALERT = 126;
const SYSTOLIC_ALERT = 140;

/**
 * Regra de negócio pura: fica fora do controller e fora do ORM,
 * então é testável sem banco e reaproveitável pelo módulo de insights.
 */
export function classifyPatientStatus(
  patient: Pick<Patient, 'createdAt' | 'lastVisitAt'>,
  measurements: ReadonlyArray<Pick<Measurement, 'kind' | 'value'>>,
  now: Date = new Date(),
): PatientStatus {
  if (daysBetween(patient.createdAt, now) <= NEW_PATIENT_DAYS) return 'novo';

  const alerted = measurements.some(
    (measurement) =>
      (measurement.kind === 'glucose' && measurement.value >= GLUCOSE_ALERT) ||
      (measurement.kind === 'pressure' && measurement.value >= SYSTOLIC_ALERT),
  );
  if (alerted) return 'atencao';

  if (!patient.lastVisitAt || daysBetween(patient.lastVisitAt, now) > STALE_VISIT_DAYS) return 'atencao';

  return 'em_dia';
}

export function computeBmi(weightKg: number, heightM: number): number | null {
  if (heightM <= 0 || weightKg <= 0) return null;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

function daysBetween(from: Date, to: Date): number {
  return Math.floor((to.getTime() - new Date(from).getTime()) / 86_400_000);
}
