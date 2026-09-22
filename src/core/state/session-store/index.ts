import { create } from 'zustand';

import type { SessionState } from './types';

export type { SessionState } from './types';

export const useSessionStore = create<SessionState>((set) => ({
  patientFilter: 'all',
  patientSearch: '',
  biomarkerRange: '3M',
  unlocked: false,
  setPatientFilter: (patientFilter) => set({ patientFilter }),
  setPatientSearch: (patientSearch) => set({ patientSearch }),
  setBiomarkerRange: (biomarkerRange) => set({ biomarkerRange }),
  setUnlocked: (unlocked) => set({ unlocked }),
}));
