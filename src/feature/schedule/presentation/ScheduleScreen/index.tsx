import { ScrollView, StyleSheet, View } from 'react-native';

import { EmptyView, ErrorView, Screen, SkeletonList, Text } from '@/core/designsystem/native';
import { spacing } from '@/core/designsystem/tokens';
import { useCoordinator } from '@/core/navigation/coordinator';
import { useHomeModel } from '@/feature/home';

/** Agenda do dia: mesma fonte do Início, outra leitura. */
export function ScheduleScreen() {
  const model = useHomeModel();
  const coordinator = useCoordinator();

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

  if (model.ui.kind === 'empty' || model.ui.data.today.length === 0) {
    return (
      <Screen>
        <EmptyView title="Agenda livre" body="Nenhuma consulta marcada para hoje." />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text token="title1">Agenda</Text>
        <Text token="footnote" tone="muted" style={styles.date}>
          {model.ui.data.dateLabel}
        </Text>

        {model.ui.data.today.map((item) => (
          <View key={item.appointment.id} style={styles.row}>
            <Text token="subhead" tone="muted" style={styles.time}>
              {item.timeLabel}
            </Text>
            <View style={styles.body}>
              <Text
                token="body"
                weight="500"
                accessibilityRole="button"
                onPress={() => coordinator.showPatientDetail(item.appointment.patientId)}
              >
                {item.appointment.patientName}
              </Text>
              <Text token="footnote" tone="muted">
                {item.kindLabel}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.screenX, paddingTop: spacing.lg, paddingBottom: 150 },
  date: { marginTop: 4 },
  row: { flexDirection: 'row', gap: spacing.lg, paddingVertical: spacing.md },
  time: { width: 52 },
  body: { flex: 1, gap: 2 },
});
