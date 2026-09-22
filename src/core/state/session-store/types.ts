import type { PatientStatusFilter } from '@/core/domain/repository';

/** Intenção do usuário agora: filtro, busca, faixa do histórico, marca escolhida. */
export interface SessionState {
  patientFilter: PatientStatusFilter;
  patientSearch: string;
  biomarkerRange: '7D' | '30D' | '3M' | '6M' | '1A';
  unlocked: boolean;
  lastPatientId: string | null;
  setPatientFilter: (filter: PatientStatusFilter) => void;
  setPatientSearch: (search: string) => void;
  setBiomarkerRange: (range: SessionState['biomarkerRange']) => void;
  setUnlocked: (unlocked: boolean) => void;
  setLastPatientId: (patientId: string) => void;
}
