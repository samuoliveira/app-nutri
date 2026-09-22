/** Catálogo de flags remotas. Chave nova entra aqui, nunca como string solta na tela. */
export const FLAG_KEYS = ['ai_insights', 'agenda_tab', 'biometric_lock'] as const;

export type FlagKey = (typeof FLAG_KEYS)[number];

export type FlagSnapshot = Record<FlagKey, boolean>;
