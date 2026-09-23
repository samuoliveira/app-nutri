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

/** Mesmos dados geram a mesma chave, em qualquer ordem de medição. */
export function profileFingerprint(profile: AnonymousProfile): string {
  const measurements = profile.measurements
    .map((m) => `${m.kind}:${m.takenAt}:${m.value}:${m.secondaryValue ?? ''}`)
    .sort()
    .join('|');

  return `${profile.ageYears}:${profile.sex}:${profile.bmi ?? ''}:${measurements}`;
}

const KIND_LABEL: Record<string, { label: string; unit: string }> = {
  glucose: { label: 'Glicemia', unit: 'mg/dL' },
  pressure: { label: 'Pressão', unit: 'mmHg' },
  weight: { label: 'Peso', unit: 'kg' },
};

/** Lista curta do que o provedor recebeu: é o que a tela mostra como auditoria. */
export function consideredData(profile: AnonymousProfile): Array<{ label: string; detail: string }> {
  const rows = [
    { label: 'Idade', detail: `${profile.ageYears} anos` },
    { label: 'Sexo', detail: profile.sex === 'F' ? 'Feminino' : 'Masculino' },
  ];

  if (profile.bmi !== null) rows.push({ label: 'IMC', detail: String(profile.bmi) });

  const seen = new Set<string>();
  for (const measurement of [...profile.measurements].sort((a, b) => b.takenAt.localeCompare(a.takenAt))) {
    if (seen.has(measurement.kind)) continue;
    seen.add(measurement.kind);

    const meta = KIND_LABEL[measurement.kind] ?? { label: measurement.kind, unit: '' };
    const value = measurement.secondaryValue
      ? `${measurement.value}/${measurement.secondaryValue}`
      : String(measurement.value);

    rows.push({ label: meta.label, detail: `${value} ${meta.unit}`.trim() });
  }

  return rows;
}
