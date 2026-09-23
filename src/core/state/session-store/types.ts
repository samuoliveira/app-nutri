import type { PatientStatusFilter } from '@/core/domain/repository';

/** Intenção do usuário agora: filtro, busca, faixa do histórico, marca escolhida. */
export interface SessionState {
  patientFilter: PatientStatusFilter;
  patientSearch: string;
  biomarkerRange: '7D' | '30D' | '3M' | '6M' | '1A';
  unlocked: boolean;
  /** Quem está usando o app. Nulo até existir login: a tela cumprimenta sem nome. */
  professionalName: string | null;
  setPatientFilter: (filter: PatientStatusFilter) => void;
  setPatientSearch: (search: string) => void;
  setBiomarkerRange: (range: SessionState['biomarkerRange']) => void;
  setUnlocked: (unlocked: boolean) => void;
  setProfessionalName: (name: string | null) => void;
}
