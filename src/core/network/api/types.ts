import type { Sex } from '@/core/domain/model';

/** Formato que o backend devolve. Só existe aqui — acima daqui é modelo de domínio. */
export interface PatientDto {
  readonly id: string;
  readonly name: string;
  readonly ageYears: number;
  readonly sex: Sex;
  readonly heightM: number;
  readonly weightKg: number;
  readonly bmi: number | null;
  readonly pinned: boolean;
  readonly status: 'novo' | 'atencao' | 'em_dia';
  readonly createdAt: string;
  readonly lastVisitAt: string | null;
}

export interface PatientPageDto {
  readonly items: ReadonlyArray<PatientDto>;
  readonly total: number;
  readonly nextOffset: number | null;
}

export interface MeasurementDto {
  readonly id: string;
  readonly patientId: string;
  readonly kind: 'weight' | 'glucose' | 'pressure';
  readonly takenAt: string;
  readonly value: number;
  readonly secondaryValue: number | null;
}

export interface InsightDto {
  readonly id: string;
  readonly patientId: string;
  readonly summary: string;
  readonly recommendations: ReadonlyArray<string>;
  readonly source: 'llm' | 'rules';
  readonly considered?: ReadonlyArray<{ label: string; detail: string }>;
  readonly createdAt: string;
}

export interface AppointmentDto {
  readonly id: string;
  readonly patientId: string;
  readonly patientName: string;
  readonly startsAt: string;
  readonly durationMinutes: number;
  readonly kind: 'first' | 'return' | 'consultation';
}
