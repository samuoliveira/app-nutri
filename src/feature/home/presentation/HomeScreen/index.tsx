import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { useTheme } from '@/core/designsystem/ThemeProvider';
import { Avatar, Divider, EmptyView, ErrorView, Screen, SkeletonList, StatusDot, Text } from '@/core/designsystem/native';
import { spacing } from '@/core/designsystem/tokens';
import { useCoordinator } from '@/core/navigation/coordinator';
import { useSessionStore } from '@/core/state/session-store';
import { AttentionCard } from '../AttentionCard';
import { useHomeModel } from '../use-home-model';

export function HomeScreen() {
  const theme = useTheme();
  const coordinator = useCoordinator();
  const model = useHomeModel();
  const setPatientFilter = useSessionStore((state) => state.setPatientFilter);
  const setLastPatientId = useSessionStore((state) => state.setLastPatientId);

  if (model.ui.kind === 'loading') {
    return (
      <Screen>
        <View style={styles.content}>
          <SkeletonList rows={6} />
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

  if (model.ui.kind === 'empty') {
    return (
      <Screen>
        <EmptyView title="Nada por aqui hoje" body="Sem consultas agendadas." />
      </Screen>
    );
  }

  const data = model.ui.data;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={false} onRefresh={model.refresh} tintColor={theme.palette.textMuted} />}
      >
        <View style={styles.headerRow}>
          <View style={styles.greeting}>
            <Text token="footnote" tone="muted" weight="500">
              {data.dateLabel}
            </Text>
            <Text token="title1">{data.greeting}, Samuel</Text>
          </View>
          <Avatar name="Samuel Nutri" size={36} />
        </View>

        <View style={styles.cardSlot}>
          <AttentionCard
            count={data.attentionCount}
            onPress={() => {
              setPatientFilter('atencao');
              coordinator.showPatients();
            }}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text token="headline">Hoje</Text>
            <Text token="footnote" tone="muted">
              {data.today.length} consultas
            </Text>
          </View>

          {data.today.map((item) => (
            <View key={item.appointment.id} style={styles.appointment}>
              <Text token="subhead" tone="muted" style={styles.time}>
                {item.timeLabel}
              </Text>
              <View style={styles.appointmentBody}>
                <Text
                  token="body"
                  weight="500"
                  onPress={() => {
                    setLastPatientId(item.appointment.patientId);
                    coordinator.showPatientDetail(item.appointment.patientId);
                  }}
                >
                  {item.appointment.patientName}
                </Text>
                <Text token="footnote" tone="muted">
                  {item.kindLabel}
                </Text>
              </View>
              {item.minutesUntil !== null ? (
                <View style={styles.badge}>
                  <StatusDot color={theme.palette.success} size={6} />
                  <Text token="caption" color={theme.palette.success}>
                    Em {item.minutesUntil} min
                  </Text>
                </View>
              ) : null}
            </View>
          ))}
        </View>

        <Divider />

        <View style={styles.totalRow}>
          <View>
            <Text token="number">{data.totalPatients.toLocaleString('pt-BR')}</Text>
            <Text token="subhead" tone="muted">
              pacientes acompanhados
            </Text>
          </View>
          <Text token="subhead" weight="500" tone="accent" onPress={coordinator.showPatients}>
            Carteira ›
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.screenX, paddingTop: spacing.lg, paddingBottom: 150 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { gap: 6, flex: 1 },
  cardSlot: { marginTop: spacing.xxl },
  section: { paddingTop: spacing.xxl, paddingBottom: spacing.lg },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  appointment: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.lg, paddingVertical: spacing.md },
  time: { width: 52 },
  appointmentBody: { flex: 1, gap: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  totalRow: { paddingTop: 26, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
});
