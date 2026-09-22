import type { MeasurementKind, Sex } from '@/core/domain/model';

/** O que sai do aparelho rumo à IA: sem nome, sem id de paciente. */
export interface AnonymousProfile {
  readonly ageYears: number;
  readonly sex: Sex;
  readonly measurements: ReadonlyArray<{
    readonly kind: MeasurementKind;
    readonly takenAt: string;
    readonly value: number;
    readonly secondaryValue: number | null;
  }>;
}
