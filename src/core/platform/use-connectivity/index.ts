import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

import { getNetworkConfig, setNetworkConfig } from '@/core/network/network-config';

/**
 * Conectividade real do aparelho alimenta o transporte: offline de verdade
 * e offline simulado passam pelo mesmo caminho de erro.
 */
export function useConnectivity(): boolean {
  const [online, setOnline] = useState(!getNetworkConfig().forcedOffline);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = Boolean(state.isConnected);
      setOnline(connected);
      if (!getNetworkConfig().forcedOffline) setNetworkConfig({ forcedOffline: !connected });
    });

    return unsubscribe;
  }, []);

  return online;
}
