import type { Measurement, Patient, PatientStatus } from '@/core/domain/model';
import { classify, classifyBloodPressure, glycemiaScale, isGlycemiaRising, isOutOfRange } from '@/feature/biomarkers/domain';

/** Regra 1 do produto. Muda aqui, e a lista, o card e a ficha mudam junto. */
export const NEW_PATIENT_MAX_AGE_DAYS = 30;
export const STALE_VISIT_DAYS = 60;

const DAY_MS = 24 * 60 * 60 * 1000;

export function classifyPatientStatus(
  patient: Patient,
  measurements: ReadonlyArray<Measurement>,
  nowMs: number = Date.now(),
): PatientStatus {
  if (isNew(patient, nowMs)) return 'novo';
  if (hasOutOfRangeMarker(measurements)) return 'atencao';
  if (isGlycemiaRising(measurements)) return 'atencao';
  if (visitIsStale(patient, nowMs)) return 'atencao';
  return 'em_dia';
}

function isNew(patient: Patient, nowMs: number): boolean {
  if (patient.lastVisitAt !== null) return false;
  return daysSince(patient.createdAt, nowMs) <= NEW_PATIENT_MAX_AGE_DAYS;
}

function visitIsStale(patient: Patient, nowMs: number): boolean {
  if (patient.lastVisitAt === null) return true;
  return daysSince(patient.lastVisitAt, nowMs) > STALE_VISIT_DAYS;
}

function hasOutOfRangeMarker(measurements: ReadonlyArray<Measurement>): boolean {
  return measurements.some((measurement) => {
    if (measurement.kind === 'glicemia') return isOutOfRange(classify(measurement.value, glycemiaScale).level);
    if (measurement.kind === 'pressao') {
      return isOutOfRange(classifyBloodPressure(measurement.value, measurement.secondaryValue ?? 0).level);
    }
    return false;
  });
}

function daysSince(iso: string, nowMs: number): number {
  return (nowMs - Date.parse(iso)) / DAY_MS;
}
