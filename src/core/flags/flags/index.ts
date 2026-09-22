import { FLAG_KEYS, type FlagSnapshot } from './types';

export { FLAG_KEYS } from './types';
export type { FlagKey, FlagSnapshot } from './types';

export const defaultFlags: FlagSnapshot = {
  ai_insights: true,
  agenda_tab: true,
  biometric_lock: true,
};

/** Propagação máxima do kill switch: 1 minuto (regra 6 do produto). */
export const FLAG_REFRESH_MS = 60_000;

export function parseFlagSnapshot(raw: Record<string, boolean>): FlagSnapshot {
  const snapshot = { ...defaultFlags };
  for (const key of FLAG_KEYS) {
    const value = raw[key];
    if (typeof value === 'boolean') snapshot[key] = value;
  }
  return snapshot;
}
