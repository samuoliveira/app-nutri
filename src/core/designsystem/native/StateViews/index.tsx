import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { useTheme } from '../../ThemeProvider';
import { spacing } from '../../tokens';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Text } from '../Text';
import type { EmptyViewProps, ErrorViewProps, SkeletonListProps, SkeletonRowProps } from './types';

/** Skeleton: mesma silhueta da lista real, sem "Carregando…" solto na tela. */
export function SkeletonRow({ height = 66 }: SkeletonRowProps) {
  const theme = useTheme();
  const pulse = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  return (
    <View style={[styles.skeletonRow, { height }]}>
      <Animated.View
        style={[styles.skeletonAvatar, { backgroundColor: theme.palette.surfaceMuted, opacity: pulse }]}
      />
      <View style={styles.skeletonTextColumn}>
        <Animated.View
          style={[styles.skeletonLine, { width: '55%', backgroundColor: theme.palette.surfaceMuted, opacity: pulse }]}
        />
        <Animated.View
          style={[styles.skeletonLine, { width: '35%', backgroundColor: theme.palette.surfaceMuted, opacity: pulse }]}
        />
      </View>
    </View>
  );
}

export function SkeletonList({ rows = 8 }: SkeletonListProps) {
  return (
    <View accessibilityLabel="Carregando" accessibilityRole="progressbar">
      {Array.from({ length: rows }, (_, index) => (
        <SkeletonRow key={index} />
      ))}
    </View>
  );
}

export function ErrorView({ error, onRetry }: ErrorViewProps) {
  const offline = error.code === 'offline';

  return (
    <View style={styles.centered}>
      <Icon name={offline ? 'cloud-off' : 'alert'} size={28} />
      <Text token="headline" style={styles.centeredTitle}>
        {offline ? 'Você está sem conexão' : 'Não foi possível carregar'}
      </Text>
      <Text token="subhead" tone="muted" style={styles.centeredBody}>
        {offline ? 'Mostramos o que já estava salvo no aparelho.' : error.message}
      </Text>
      {error.retryable ? <Button label="Tentar de novo" onPress={onRetry} variant="secondary" style={styles.action} /> : null}
    </View>
  );
}

export function EmptyView({ title, body, action }: EmptyViewProps) {
  return (
    <View style={styles.centered}>
      <Text token="headline" style={styles.centeredTitle}>
        {title}
      </Text>
      <Text token="subhead" tone="muted" style={styles.centeredBody}>
        {body}
      </Text>
      {action ? <Button label={action.label} onPress={action.onPress} variant="secondary" style={styles.action} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.screenX },
  skeletonAvatar: { width: 40, height: 40, borderRadius: 20 },
  skeletonTextColumn: { flex: 1, gap: 6 },
  skeletonLine: { height: 10, borderRadius: 5 },
  centered: { paddingHorizontal: 44, paddingTop: 90, alignItems: 'center', gap: spacing.sm },
  centeredTitle: { textAlign: 'center' },
  centeredBody: { textAlign: 'center' },
  action: { marginTop: spacing.sm, alignSelf: 'stretch' },
});
