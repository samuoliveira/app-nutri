import type { Measurement, Patient } from '@/core/domain/model';
import type { AnonymousProfile } from './types';

export type { AnonymousProfile } from './types';

/**
 * Regra 3 do produto: a IA nunca recebe nome. Esta função é o único caminho
 * de saída de dado de paciente para o serviço de IA.
 */
export function anonymizePatient(patient: Patient, measurements: ReadonlyArray<Measurement>): AnonymousProfile {
  return {
    ageYears: patient.ageYears,
    sex: patient.sex,
    measurements: measurements.map((measurement) => ({
      kind: measurement.kind,
      takenAt: measurement.takenAt,
      value: measurement.value,
      secondaryValue: measurement.secondaryValue,
    })),
  };
}

/** Mesmos dados geram a mesma chave: insight repetido não gera nova cobrança. */
export function profileFingerprint(profile: AnonymousProfile): string {
  const measurements = profile.measurements
    .map((measurement) => `${measurement.kind}:${measurement.takenAt}:${measurement.value}:${measurement.secondaryValue ?? ''}`)
    .sort()
    .join('|');

  return `${profile.ageYears}:${profile.sex}:${measurements}`;
}
