import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/core/designsystem/ThemeProvider';
import { Card, Icon, Text } from '@/core/designsystem/native';
import type { AttentionCardProps } from './types';

export function AttentionCard({ count, onPress }: AttentionCardProps) {
  const theme = useTheme();

  return (
    <Card onPress={onPress} accessibilityLabel={`${count} pacientes precisam de atenção`} style={styles.card}>
      <View style={styles.text}>
        <Text token="headline" weight="500">
          {count} precisam de atenção
        </Text>
        <Text token="footnote" tone="muted">
          Glicemia e pressão fora da faixa
        </Text>
      </View>
      <Icon name="chevron-right" size={16} color={theme.palette.chevron} strokeWidth={2} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  text: { flex: 1 },
});
