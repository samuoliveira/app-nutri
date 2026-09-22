import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/core/designsystem/ThemeProvider';
import { Divider, RangeBar, Text } from '@/core/designsystem/native';
import type { IndicatorRowProps } from './types';

export function IndicatorRow({ indicator, last = false }: IndicatorRowProps) {
  const theme = useTheme();
  const deltaColor =
    indicator.deltaTone === 'danger'
      ? theme.palette.danger
      : indicator.deltaTone === 'success'
        ? theme.palette.success
        : theme.palette.textMuted;

  return (
    <View style={styles.root}>
      <View style={styles.headline}>
        <Text token="subhead" tone="muted" style={styles.label}>
          {indicator.label}
        </Text>
        <Text token="body" weight="500" style={styles.value}>
          {indicator.displayValue}
          {indicator.unit ? (
            <Text token="footnote" tone="muted">
              {` ${indicator.unit}`}
            </Text>
          ) : null}
        </Text>
        <Text token="subhead" weight="500" color={deltaColor}>
          {indicator.deltaLabel}
        </Text>
      </View>

      <RangeBar
        value={indicator.value}
        bands={indicator.scale.bands}
        ticks={indicator.scale.ticks}
        min={indicator.scale.min}
        max={indicator.scale.max}
        accessibilityLabel={`${indicator.label}: ${indicator.displayValue} ${indicator.unit}, ${indicator.levelLabel}`}
      />

      {last ? null : <View style={styles.divider}><Divider /></View>}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { paddingTop: 16, paddingBottom: 12 },
  headline: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 },
  label: { width: 110 },
  value: { flex: 1 },
  divider: { marginTop: 12 },
});
