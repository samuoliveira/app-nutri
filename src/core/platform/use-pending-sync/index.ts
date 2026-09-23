import NetInfo from '@react-native-community/netinfo';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useContainer } from '@/core/di/container';
import { queryKeys } from '@/core/query/query-keys';

/**
 * Esvazia a fila offline quando há chance de ter rede: ao abrir o app, ao
 * reconectar e ao voltar do background. Se algo mudou no servidor, a
 * carteira recarrega.
 */
export function usePendingSync(): void {
  const { patients } = useContainer();
  const queryClient = useQueryClient();

  // useEffect-ok: escuta rede e ciclo de vida do app, que são eventos de fora do React
  useEffect(() => {
    const sync = async () => {
      const result = await patients.syncPending();
      if (result.ok && result.value.sent + result.value.dropped > 0) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });
      }
    };

    // NetInfo emite o estado atual ao se inscrever: isso já cobre a abertura do app.
    const offNet = NetInfo.addEventListener((state) => {
      if (state.isConnected) void sync();
    });
    const appState = AppState.addEventListener('change', (next) => {
      if (next === 'active') void sync();
    });

    return () => {
      offNet();
      appState.remove();
    };
  }, [patients, queryClient]);
}
