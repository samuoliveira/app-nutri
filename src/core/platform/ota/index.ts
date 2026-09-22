import * as Updates from 'expo-updates';
import { useCallback, useState } from 'react';

import type { OtaStatus } from './types';

export type { OtaStatus } from './types';

/**
 * OTA por expo-updates: o mesmo runtime que o Expo já usa para build e canal,
 * sem servidor próprio de bundle. Mudança de código nativo continua exigindo loja.
 */
export function useOta(): OtaStatus & { check: () => void } {
  const [status, setStatus] = useState<OtaStatus>({
    channel: Updates.channel ?? 'development',
    runtimeVersion: Updates.runtimeVersion ?? 'dev',
    updateId: Updates.updateId,
    checking: false,
    message: null,
  });

  const check = useCallback(() => {
    setStatus((current) => ({ ...current, checking: true, message: null }));

    void (async () => {
      try {
        if (__DEV__ || !Updates.isEnabled) {
          setStatus((current) => ({ ...current, checking: false, message: 'OTA desligado em desenvolvimento' }));
          return;
        }

        const result = await Updates.checkForUpdateAsync();
        if (!result.isAvailable) {
          setStatus((current) => ({ ...current, checking: false, message: 'Você já está na última versão' }));
          return;
        }

        await Updates.fetchUpdateAsync();
        setStatus((current) => ({ ...current, checking: false, message: 'Atualização baixada · reiniciando' }));
        await Updates.reloadAsync();
      } catch (cause) {
        setStatus((current) => ({
          ...current,
          checking: false,
          message: cause instanceof Error ? cause.message : 'Falha ao buscar atualização',
        }));
      }
    })();
  }, []);

  return { ...status, check };
}
