import * as LocalAuthentication from 'expo-local-authentication';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, StyleSheet, View, type AppStateStatus } from 'react-native';

import { Button, Icon, Screen, Text } from '@/core/designsystem/native';
import { spacing } from '@/core/designsystem/tokens';
import { useSessionStore } from '@/core/state/session-store';
import type { BiometricGateProps } from './types';

export type { BiometricGateProps } from './types';

/** Trava depois de 1 minuto em segundo plano. */
export const BACKGROUND_LOCK_MS = 60_000;

export function BiometricGate({ children, enabled }: BiometricGateProps) {
  const unlocked = useSessionStore((state) => state.unlocked);
  const setUnlocked = useSessionStore((state) => state.setUnlocked);
  const [message, setMessage] = useState<string | null>(null);
  const backgroundedAt = useRef<number | null>(null);

  const authenticate = useCallback(async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !enrolled) {
      /** Sem biometria cadastrada o app não fica inacessível: cai no código do aparelho. */
      const fallback = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Desbloquear',
        disableDeviceFallback: false,
      });
      setUnlocked(fallback.success);
      setMessage(fallback.success ? null : 'Não foi possível desbloquear');
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Desbloquear dados dos pacientes',
      disableDeviceFallback: false,
    });
    setUnlocked(result.success);
    setMessage(result.success ? null : 'Não foi possível desbloquear');
  }, [setUnlocked]);

  useEffect(() => {
    if (!enabled) {
      setUnlocked(true);
      return;
    }
    if (!unlocked) void authenticate();
  }, [authenticate, enabled, setUnlocked, unlocked]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'background') {
        backgroundedAt.current = Date.now();
        return;
      }
      if (next === 'active' && backgroundedAt.current !== null) {
        const away = Date.now() - backgroundedAt.current;
        backgroundedAt.current = null;
        if (enabled && away >= BACKGROUND_LOCK_MS) setUnlocked(false);
      }
    });

    return () => subscription.remove();
  }, [enabled, setUnlocked]);

  if (!enabled || unlocked) return <>{children}</>;

  return (
    <Screen>
      <View style={styles.root}>
        <Icon name="lock" size={30} />
        <Text token="headline">Dados protegidos</Text>
        <Text token="subhead" tone="muted" style={styles.body}>
          Use a biometria do aparelho para abrir a carteira de pacientes.
        </Text>
        {message ? (
          <Text token="footnote" tone="danger">
            {message}
          </Text>
        ) : null}
        <Button label="Desbloquear" onPress={() => void authenticate()} style={styles.action} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingHorizontal: 44 },
  body: { textAlign: 'center' },
  action: { alignSelf: 'stretch', marginTop: spacing.md },
});
