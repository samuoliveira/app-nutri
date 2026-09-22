import { ScrollView, StyleSheet, View } from 'react-native';

import { useTheme } from '@/core/designsystem/ThemeProvider';
import {
  Divider,
  EmptyView,
  ErrorView,
  RangeBar,
  Screen,
  SegmentedControl,
  SkeletonList,
  Text,
  type Segment,
} from '@/core/designsystem/native';
import { spacing } from '@/core/designsystem/tokens';
import { useScreenHeader } from '@/core/navigation/use-screen-header';
import { useBiomarkersModel, type BiomarkerRange } from '../use-biomarkers-model';
import type { BiomarkersScreenProps } from './types';

const RANGES: ReadonlyArray<Segment<BiomarkerRange>> = [
  { value: '7D', label: '7D' },
  { value: '30D', label: '30D' },
  { value: '3M', label: '3M' },
  { value: '6M', label: '6M' },
  { value: '1A', label: '1A' },
];

export function BiomarkersScreen({ patientId }: BiomarkersScreenProps) {
  const theme = useTheme();
  const model = useBiomarkersModel(patientId);
  const name = model.ui.kind === 'data' ? model.ui.data.patientName : '';

  useScreenHeader({ title: 'Biomarcadores', subtitle: name, showBack: true });

  if (model.ui.kind === 'loading') {
    return (
      <Screen edges="none">
        <View style={styles.content}>
          <SkeletonList rows={4} />
        </View>
      </Screen>
    );
  }

  if (model.ui.kind === 'error') {
    return (
      <Screen edges="none">
        <ErrorView error={model.ui.error} onRetry={model.refresh} />
      </Screen>
    );
  }

  if (model.ui.kind === 'empty') {
    return (
      <Screen edges="none">
        <EmptyView title="Sem medições na janela" body="Escolha um período maior para ver o histórico." />
      </Screen>
    );
  }

  const data = model.ui.data;

  return (
    <Screen edges="none">
      <ScrollView contentContainerStyle={styles.content}>
        <SegmentedControl
          segments={RANGES}
          selected={model.range}
          onSelect={model.setRange}
          accessibilityLabel="Período do histórico"
        />

        {data.indicators.map((indicator) => (
          <View key={indicator.key} style={styles.section}>
            <Text token="footnote" tone="muted" weight="500">
              {indicator.label}
            </Text>
            <View style={styles.valueRow}>
              <Text token="number">{indicator.displayValue}</Text>
              {indicator.unit ? (
                <Text token="subhead" tone="muted">
                  {indicator.unit}
                </Text>
              ) : null}
            </View>
            <View style={styles.tagRow}>
              <Text
                token="subhead"
                weight="500"
                color={indicator.deltaTone === 'danger' ? theme.palette.danger : theme.palette.textMuted}
              >
                {indicator.deltaLabel}
              </Text>
              <Text token="subhead" tone="muted">
                {indicator.levelLabel}
              </Text>
            </View>

            <RangeBar
              value={indicator.value}
              bands={indicator.scale.bands}
              ticks={indicator.scale.ticks}
              min={indicator.scale.min}
              max={indicator.scale.max}
              accessibilityLabel={`${indicator.label}: ${indicator.displayValue}, ${indicator.levelLabel}`}
            />

            {indicator.key === 'glicemia' && data.readings.length > 0 ? (
              <View style={styles.readings}>
                {data.readings.map((reading) => (
                  <View
                    key={reading.id}
                    style={[styles.reading, { backgroundColor: theme.palette.surfaceMuted, borderRadius: theme.shape.pill - 2 }]}
                  >
                    <Text token="caption" tone="muted" weight="400">
                      {reading.label}
                    </Text>
                    <Text token="headline" weight="500">
                      {reading.value}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            <View style={styles.divider}>
              <Divider />
            </View>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.screenX, paddingTop: spacing.md, paddingBottom: 60 },
  section: { paddingTop: 26 },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 2 },
  tagRow: { flexDirection: 'row', gap: 10, marginTop: 2, marginBottom: 14 },
  readings: { flexDirection: 'row', gap: 8, marginTop: 16 },
  reading: { flex: 1, paddingVertical: 10, paddingHorizontal: 12 },
  divider: { marginTop: 26 },
});
