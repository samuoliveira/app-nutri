import { FlashList } from '@shopify/flash-list';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { useTheme } from '@/core/designsystem/ThemeProvider';
import {
  EmptyView,
  ErrorView,
  Icon,
  Screen,
  SegmentedControl,
  SkeletonList,
  Text,
  type Segment,
} from '@/core/designsystem/native';
import { spacing } from '@/core/designsystem/tokens';
import { useContainer } from '@/core/di/container';
import type { Patient } from '@/core/domain/model';
import type { PatientStatusFilter } from '@/core/domain/repository';
import { useCoordinator } from '@/core/navigation/coordinator';
import { useViewModel } from '@/core/presentation/use-view-model';
import { useSessionStore } from '@/core/state/session-store';
import { countLabel } from '../patient-format';
import { PatientListRow } from '../PatientListRow';
import { PatientsViewModel } from '../PatientsViewModel';

const FILTERS: ReadonlyArray<Segment<PatientStatusFilter>> = [
  { value: 'all', label: 'Todos' },
  { value: 'em_dia', label: 'Em dia' },
  { value: 'atencao', label: 'Atenção' },
];

export function PatientsScreen() {
  const theme = useTheme();
  const container = useContainer();
  const queryClient = useQueryClient();
  const coordinator = useCoordinator();
  const filter = useSessionStore((state) => state.patientFilter);
  const search = useSessionStore((state) => state.patientSearch);
  const setPatientFilter = useSessionStore((state) => state.setPatientFilter);
  const setPatientSearch = useSessionStore((state) => state.setPatientSearch);

  const [state, viewModel] = useViewModel(
    () => new PatientsViewModel(container.patients, queryClient, { filter, search }),
    [container, queryClient],
  );

  useEffect(() => {
    void viewModel.load();
  }, [viewModel]);

  useEffect(() => {
    viewModel.setFilter(filter);
  }, [filter, viewModel]);

  const openPatient = useCallback(
    (patient: Patient) => coordinator.showPatientDetail(patient.id),
    [coordinator],
  );

  const pinPatient = useCallback(
    (patient: Patient) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      void viewModel.togglePinned(patient);
    },
    [viewModel],
  );

  return (
    <Screen>
      <View style={styles.header}>
        <Text token="title1">Pacientes</Text>
        <View style={[styles.searchBox, { backgroundColor: theme.palette.surfaceMuted, borderRadius: theme.shape.control }]}>
          <Icon name="search" size={17} color={theme.palette.textSubtle} strokeWidth={2} />
          <TextInput
            accessibilityLabel="Buscar paciente"
            placeholder="Buscar paciente"
            placeholderTextColor={theme.palette.textSubtle}
            value={search}
            onChangeText={(text) => {
              setPatientSearch(text);
              viewModel.setSearch(text);
            }}
            style={[styles.searchInput, { color: theme.palette.text, fontFamily: theme.typography.family }]}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
        <SegmentedControl
          segments={FILTERS}
          selected={state.filter}
          onSelect={setPatientFilter}
          accessibilityLabel="Filtrar carteira"
        />
      </View>

      {state.ui.kind === 'loading' ? <SkeletonList rows={9} /> : null}

      {state.ui.kind === 'error' ? <ErrorView error={state.ui.error} onRetry={() => void viewModel.load()} /> : null}

      {state.ui.kind === 'empty' ? (
        <EmptyView
          title="Nenhum paciente encontrado"
          body="Troque o filtro ou limpe a busca."
          action={{
            label: 'Limpar busca',
            onPress: () => {
              setPatientSearch('');
              viewModel.setSearch('');
            },
          }}
        />
      ) : null}

      {state.ui.kind === 'data' ? (
        <>
          <Text token="caption" tone="subtle" style={styles.count}>
            {countLabel(state.ui.data.items.length, state.ui.data.total)}
          </Text>
          <FlashList
            data={state.ui.data.items}
            keyExtractor={(patient) => patient.id}
            renderItem={({ item }) => (
              <PatientListRow
                patient={item}
                status={item.status}
                onPress={openPatient}
                onLongPress={pinPatient}
              />
            )}
            onEndReachedThreshold={0.4}
            onEndReached={() => void viewModel.loadMore()}
            contentContainerStyle={styles.listContent}
            keyboardDismissMode="on-drag"
          />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.screenX, paddingTop: spacing.sm, paddingBottom: spacing.sm, gap: spacing.md },
  searchBox: { height: 40, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: 12 },
  searchInput: { flex: 1, fontSize: 16, padding: 0 },
  count: { paddingHorizontal: spacing.screenX, paddingTop: spacing.md, paddingBottom: spacing.xs },
  listContent: { paddingBottom: 140 },
});
