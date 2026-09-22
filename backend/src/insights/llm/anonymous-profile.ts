import type { Measurement } from '../../patients/measurement.entity';
import type { PatientView } from '../../patients/patients.service';

export interface AnonymousProfile {
  ageYears: number;
  sex: 'F' | 'M';
  bmi: number | null;
  measurements: Array<{ kind: string; takenAt: string; value: number; secondaryValue: number | null }>;
}

/**
 * Único caminho de saída de dado de paciente para o LLM.
 * Nome e id nunca atravessam esta função.
 */
export function anonymizePatient(patient: PatientView, measurements: ReadonlyArray<Measurement>): AnonymousProfile {
  return {
    ageYears: patient.ageYears,
    sex: patient.sex,
    bmi: patient.bmi,
    measurements: measurements.map((measurement) => ({
      kind: measurement.kind,
      takenAt: new Date(measurement.takenAt).toISOString(),
      value: measurement.value,
      secondaryValue: measurement.secondaryValue,
    })),
  };
}
