import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { brandById } from '@/core/designsystem/brands';
import { ThemeProvider } from '@/core/designsystem/ThemeProvider';
import { ContainerProvider, createContainer, type Container } from '@/core/di/container';
import { openDatabase } from '@/core/database/database';
import { useFlag } from '@/core/flags/use-flag';
import { BiometricGate } from '@/core/platform/biometric-gate';
import { useConnectivity } from '@/core/platform/use-connectivity';
import { usePendingSync } from '@/core/platform/use-pending-sync';
import { RootNavigator } from '@/core/navigation/reactnavigation/RootNavigator';
import { createQueryClient, createQueryPersister, OFFLINE_CACHE_MAX_AGE_MS } from '@/core/query/query-client';
import { useBrandStore } from '@/core/state/brand-store';

const queryClient = createQueryClient();
const persister = createQueryPersister();

/** Abre o banco, migra, monta o container e sobe o navigator. */
export function App() {
  const [container, setContainer] = useState<Container | null>(null);
  const brandId = useBrandStore((state) => state.brandId);
  const hydrateBrand = useBrandStore((state) => state.hydrate);
  const [fontsLoaded] = useFonts({ ...brandById('tecsa').fontsToLoad, ...brandById('vitta').fontsToLoad });

  useEffect(() => {
    void hydrateBrand();
  }, [hydrateBrand]);

  useEffect(() => {
    void openDatabase().then((database) => setContainer(createContainer(database)));
  }, []);

  if (!container || !fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: brandById(brandId).palette.background }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister, maxAge: OFFLINE_CACHE_MAX_AGE_MS }}
        >
          <ContainerProvider container={container}>
            <ThemeProvider>
              <StatusBar style="dark" />
              <AppShell />
            </ThemeProvider>
          </ContainerProvider>
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppShell() {
  const biometricLock = useFlag('biometric_lock');
  useConnectivity();
  usePendingSync();

  return (
    <BiometricGate enabled={biometricLock}>
      <RootNavigator />
    </BiometricGate>
  );
}
