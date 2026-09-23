import * as LocalAuthentication from 'expo-local-authentication';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, StyleSheet, View, type AppStateStatus } from 'react-native';

import { Button, Icon, Screen, Text } from '@/core/designsystem/native';
import { spacing } from '@/core/designsystem/tokens';
import { runUnlock, type DeviceAuth, type UnlockOutcome } from '@/core/platform/unlock-policy';
import { useSessionStore } from '@/core/state/session-store';
import type { BiometricGateProps } from './types';

export type { BiometricGateProps } from './types';

/** Trava depois de 1 minuto em segundo plano. */
export const BACKGROUND_LOCK_MS = 60_000;

/** Adaptador do módulo nativo para a porta que o policy declara. */
const deviceAuth: DeviceAuth = {
  hasHardware: () => LocalAuthentication.hasHardwareAsync(),
  isEnrolled: () => LocalAuthentication.isEnrolledAsync(),
  authenticate: async (options) => {
    const result = await LocalAuthentication.authenticateAsync(options);
    return { success: result.success, error: 'error' in result ? result.error : undefined };
  },
};

export function BiometricGate({ children, enabled }: BiometricGateProps) {
  const unlocked = useSessionStore((state) => state.unlocked);
  const setUnlocked = useSessionStore((state) => state.setUnlocked);
  const [checking, setChecking] = useState(false);
  const [outcome, setOutcome] = useState<UnlockOutcome | null>(null);
  const backgroundedAt = useRef<number | null>(null);

  const authenticate = useCallback(async () => {
    setChecking(true);
    const result = await runUnlock(deviceAuth);
    setOutcome(result);
    setUnlocked(result.status === 'unlocked');
    setChecking(false);
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

  /** Enquanto o SO responde, a tela de trava não aparece: evita piscar na abertura. */
  if (checking || outcome === null) {
    return (
      <Screen>
        <View style={styles.root}>
          <ActivityIndicator />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.root}>
        <Icon name="lock" size={30} />
        <Text token="headline">Dados protegidos</Text>
        <Text token="subhead" tone="muted" style={styles.body}>
          Use a biometria do aparelho para abrir a carteira de pacientes.
        </Text>
        {outcome.status === 'locked' ? (
          <Text token="footnote" tone="danger">
            {outcome.message}
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
