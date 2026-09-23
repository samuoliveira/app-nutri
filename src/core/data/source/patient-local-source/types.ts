export interface PatientRow {
  id: string;
  name: string;
  age_years: number;
  sex: string;
  height_m: number;
  weight_kg: number;
  pinned: number;
  created_at: string;
  last_visit_at: string | null;
  status: string;
}

export interface PendingMutation {
  readonly id: number;
  readonly kind: string;
  readonly payload: unknown;
}
