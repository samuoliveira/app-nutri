import type { ApiConfig } from './types';

export type { ApiConfig } from './types';

/**
 * A URL vem do ambiente (EXPO_PUBLIC_API_URL), nunca de literal em tela.
 * Sem URL configurada o app roda no catálogo simulado — é o mesmo binário.
 */
const DEFAULT_TIMEOUT_MS = 8000;

let current: ApiConfig = {
  baseUrl: (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, ''),
  timeoutMs: DEFAULT_TIMEOUT_MS,
};

export function getApiConfig(): ApiConfig {
  return current;
}

export function setApiConfig(patch: Partial<ApiConfig>): void {
  current = { ...current, ...patch, baseUrl: (patch.baseUrl ?? current.baseUrl).replace(/\/$/, '') };
}

export function isRemoteApiEnabled(): boolean {
  return current.baseUrl.length > 0;
}
