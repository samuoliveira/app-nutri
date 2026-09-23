import * as Haptics from 'expo-haptics';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useTheme } from '@/core/designsystem/ThemeProvider';
import {
  Card,
  Divider,
  ErrorView,
  Icon,
  Screen,
  SkeletonList,
  Sparkline,
  StatusDot,
  Text,
} from '@/core/designsystem/native';
import { spacing } from '@/core/designsystem/tokens';
import { useFlag } from '@/core/flags/use-flag';
import { useCoordinator } from '@/core/navigation/coordinator';
import { statusLabel } from '@/feature/patients';
import { IndicatorRow } from '../IndicatorRow';
import { patientHeadline, weightDeltaLabel } from '../patient-detail-format';
import { usePatientModel } from '../use-patient-model';
import type { PatientDetailScreenProps } from './types';

export function PatientDetailScreen({ patientId }: PatientDetailScreenProps) {
  const theme = useTheme();
  const coordinator = useCoordinator();
  const model = usePatientModel(patientId);
  const aiEnabled = useFlag('ai_insights');

  if (model.ui.kind === 'loading') {
    return (
      <Screen>
        <View style={styles.content}>
          <SkeletonList rows={5} />
        </View>
      </Screen>
    );
  }

  if (model.ui.kind === 'error') {
    return (
      <Screen>
        <ErrorView error={model.ui.error} onRetry={model.refresh} />
      </Screen>
    );
  }

  if (model.ui.kind === 'empty') return null;

  const { patient, indicators, weightSeries } = model.ui.data;
  const { status } = patient;
  const statusColor =
    status === 'atencao' ? theme.palette.danger : status === 'novo' ? theme.palette.info : theme.palette.success;
  const delta = weightDeltaLabel(weightSeries);

  return (
    <Screen edges="none">
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={coordinator.back} style={styles.iconButton}>
            <Icon name="chevron-left" size={22} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={patient.pinned ? 'Desafixar paciente' : 'Fixar paciente'}
            accessibilityState={{ selected: patient.pinned }}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              model.togglePin();
            }}
            style={styles.iconButton}
          >
            <Icon name="pin" size={20} color={patient.pinned ? theme.palette.accent : theme.palette.textMuted} strokeWidth={1.9} />
          </Pressable>
        </View>

        <View style={styles.identity}>
          <Text token="title1">{patient.name}</Text>
          <Text token="subhead" tone="muted">
            {patientHeadline(patient)}
          </Text>
          <View style={styles.statusRow}>
            <StatusDot color={statusColor} />
            <Text token="footnote" tone="muted">
              {statusLabel(status)}
            </Text>
          </View>
        </View>

        <View style={styles.weightRow}>
          <View>
            <Text token="footnote" tone="muted" weight="500">
              Peso
            </Text>
            <View style={styles.weightValue}>
              <Text token="display">{patient.weightKg.toFixed(1).replace('.', ',')}</Text>
              <Text token="title3" tone="muted" weight="400">
                kg
              </Text>
            </View>
            {delta ? (
              <Text token="subhead" tone="muted">
                {delta}
              </Text>
            ) : null}
          </View>
          <Sparkline values={weightSeries} />
        </View>

        <Divider />

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text token="headline">Indicadores</Text>
            <Text
              token="subhead"
              weight="500"
              tone="accent"
              accessibilityRole="button"
              onPress={() => coordinator.showBiomarkers(patient.id)}
            >
              Histórico ›
            </Text>
          </View>

          {indicators.map((indicator, index) => (
            <IndicatorRow key={indicator.key} indicator={indicator} last={index === indicators.length - 1} />
          ))}
        </View>

        {aiEnabled ? (
          <Card
            onPress={() => coordinator.showInsight(patient.id)}
            accessibilityLabel={`Abrir ${theme.assistantName}`}
            style={styles.insightCard}
          >
            <View style={styles.insightBody}>
              <View style={styles.insightLabel}>
                <Icon name="sparkle" size={14} color={theme.palette.textMuted} />
                <Text token="footnote" tone="muted" weight="500">
                  {theme.assistantName}
                </Text>
              </View>
              <Text token="body" weight="500">
                Ver leitura das últimas medições
              </Text>
            </View>
            <Icon name="chevron-right" size={16} color={theme.palette.chevron} strokeWidth={2} />
          </Card>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.screenX, paddingTop: 50, paddingBottom: 60 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: -16 },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  identity: { gap: 6, paddingTop: 4 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  weightRow: { paddingVertical: spacing.xl, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  weightValue: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  section: { paddingTop: spacing.lg, paddingBottom: spacing.md },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  insightCard: { marginTop: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: 12 },
  insightBody: { flex: 1, gap: 4 },
  insightLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
