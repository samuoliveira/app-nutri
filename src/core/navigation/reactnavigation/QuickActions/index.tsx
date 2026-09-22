import * as Haptics from 'expo-haptics';
import { useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/core/designsystem/ThemeProvider';
import { GlassSurface, Icon, Text } from '@/core/designsystem/native';
import { durations } from '@/core/designsystem/tokens';
import { useCoordinator } from '@/core/navigation/coordinator';
import { useSessionStore } from '@/core/state/session-store';
import type { QuickAction } from './types';

/** Atalhos só para o que já existe no app: busca, atenção, agenda, última ficha. */
export function QuickActions() {
  const theme = useTheme();
  const coordinator = useCoordinator();
  const setPatientFilter = useSessionStore((state) => state.setPatientFilter);
  const lastPatientId = useSessionStore((state) => state.lastPatientId);
  const [open, setOpen] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  const animate = (next: boolean) => {
    setOpen(next);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(progress, {
      toValue: next ? 1 : 0,
      duration: next ? durations.spring : durations.base,
      easing: Easing.bezier(0.2, 0.9, 0.25, 1),
      useNativeDriver: true,
    }).start();
  };

  const actions: ReadonlyArray<QuickAction> = [
    {
      icon: 'search',
      label: 'Buscar paciente',
      run: () => {
        setPatientFilter('all');
        coordinator.showPatients();
      },
    },
    {
      icon: 'alert',
      label: 'Precisam de atenção',
      run: () => {
        setPatientFilter('atencao');
        coordinator.showPatients();
      },
    },
    {
      icon: 'file',
      label: 'Última ficha aberta',
      run: () => {
        if (lastPatientId) coordinator.showPatientDetail(lastPatientId);
      },
    },
  ];

  return (
    <>
      {open ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar ações rápidas"
          onPress={() => animate(false)}
          style={[styles.scrim, { backgroundColor: theme.palette.scrim }]}
        />
      ) : null}

      <Animated.View
        pointerEvents={open ? 'auto' : 'none'}
        style={[
          styles.menuWrapper,
          {
            opacity: progress,
            transform: [
              { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
              { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
            ],
          },
        ]}
      >
        {/* style-ok: raio do menu acompanha a forma da marca */}
        <GlassSurface style={{ ...styles.menu, borderRadius: theme.shape.glass - 6 }}>
          {actions.map((action) => (
            <Pressable
              key={action.label}
              accessibilityRole="menuitem"
              accessibilityLabel={action.label}
              onPress={() => {
                animate(false);
                action.run();
              }}
              style={[styles.menuItem, { borderRadius: theme.shape.pill }]}
            >
              <Icon name={action.icon} size={20} />
              <Text token="body" weight="500">
                {action.label}
              </Text>
            </Pressable>
          ))}
        </GlassSurface>
      </Animated.View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ações rápidas"
        accessibilityState={{ expanded: open }}
        onPress={() => animate(!open)}
      >
        <GlassSurface style={styles.fab}>
          <Animated.View
            // style-ok: transform interpolado por Animated não existe em StyleSheet
            style={{
              transform: [
                { rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] }) },
              ],
            }}
          >
            <Icon name="plus" size={24} color={theme.palette.accent} strokeWidth={2} />
          </Animated.View>
        </GlassSurface>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  scrim: { position: 'absolute', left: -16, right: -16, bottom: -120, top: -900 },
  menuWrapper: { position: 'absolute', right: 0, bottom: 76, width: 270 },
  menu: { padding: 8, gap: 2 },
  menuItem: { height: 50, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16 },
  fab: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
});
