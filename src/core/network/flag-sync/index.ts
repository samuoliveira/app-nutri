import type { FlagKey } from '@/core/flags/flags';
import { api } from '@/core/network/api';
import { isRemoteApiEnabled } from '@/core/network/api-config';
import { writeServerFlag } from '@/core/network/fixtures/flag-config';

/**
 * Kill switch da tela Mais: com backend ligado, escreve no servidor;
 * sem backend, no catálogo simulado. A tela não sabe a diferença.
 */
export async function publishFlag(key: FlagKey, enabled: boolean): Promise<void> {
  if (isRemoteApiEnabled()) {
    await api.setFlag(key, enabled);
    return;
  }

  writeServerFlag(key, enabled);
}
