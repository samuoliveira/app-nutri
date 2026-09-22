/** Modelo do domínio: sem marca, sem React, sem biblioteca. */

export type PatientStatus = 'em_dia' | 'atencao' | 'novo';

export type Sex = 'F' | 'M' | 'O';

export interface Patient {
  readonly id: string;
  readonly name: string;
  readonly ageYears: number;
  readonly sex: Sex;
  readonly heightM: number;
  readonly weightKg: number;
  readonly pinned: boolean;
  readonly createdAt: string;
  readonly lastVisitAt: string | null;
}

export type MeasurementKind = 'glicemia' | 'pressao' | 'peso';

export interface Measurement {
  readonly id: string;
  readonly patientId: string;
  readonly kind: MeasurementKind;
  readonly takenAt: string;
  /** glicemia: mg/dL · peso: kg · pressão: sistólica */
  readonly value: number;
  /** pressão: diastólica; os outros não usam */
  readonly secondaryValue: number | null;
}

export type BandLevel = 'baixo' | 'normal' | 'atencao' | 'alto';

export interface Band {
  readonly level: BandLevel;
  readonly from: number;
  readonly to: number;
  readonly label: string;
}

export interface Appointment {
  readonly id: string;
  readonly patientId: string;
  readonly patientName: string;
  readonly startsAt: string;
  readonly kind: 'primeira' | 'retorno' | 'consulta';
}

export type InsightStatus = 'rascunho' | 'aprovado';

export interface Insight {
  readonly id: string;
  readonly patientId: string;
  readonly status: InsightStatus;
  readonly headline: string;
  readonly body: string;
  readonly consideredData: ReadonlyArray<{ label: string; detail: string }>;
  readonly source: 'llm' | 'regras';
  readonly createdAt: string;
}
