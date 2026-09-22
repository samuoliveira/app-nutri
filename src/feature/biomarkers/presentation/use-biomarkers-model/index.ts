import { useQueries, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { useContainer } from '@/core/di/container';
import { DomainError } from '@/core/domain/domain-error';
import { toUiState } from '@/core/presentation/ui-state';
import { queryKeys } from '@/core/query/query-keys';
import { useSessionStore } from '@/core/state/session-store';
import { buildIndicators } from '../../domain/build-indicators';
import type { BiomarkerRange, BiomarkersData, BiomarkersModel } from './types';

export type { BiomarkerRange, BiomarkersData, BiomarkersModel } from './types';

const RANGE_DAYS: Record<BiomarkerRange, number> = { '7D': 7, '30D': 30, '3M': 90, '6M': 180, '1A': 365 };

export function useBiomarkersModel(patientId: string): BiomarkersModel {
  const container = useContainer();
  const queryClient = useQueryClient();
  const range = useSessionStore((state) => state.biomarkerRange);
  const setRange = useSessionStore((state) => state.setBiomarkerRange);
  const since = new Date(Date.now() - RANGE_DAYS[range] * 24 * 60 * 60 * 1000).toISOString();

  const [patientQuery, measurementsQuery] = useQueries({
    queries: [
      {
        queryKey: queryKeys.patients.detail(patientId),
        queryFn: async () => {
          const result = await container.patients.byId(patientId);
          if (!result.ok) throw result.error;
          return result.value;
        },
      },
      {
        queryKey: queryKeys.measurements.history(patientId, range),
        queryFn: async () => {
          const result = await container.measurements.history(patientId, since);
          if (!result.ok) throw result.error;
          return result.value;
        },
      },
    ],
  });

  const data: BiomarkersData | undefined = useMemo(() => {
    const patient = patientQuery?.data;
    const measurements = measurementsQuery?.data;
    if (!patient || !measurements) return undefined;

    const glycemia = measurements
      .filter((measurement) => measurement.kind === 'glicemia')
      .sort((a, b) => Date.parse(a.takenAt) - Date.parse(b.takenAt))
      .slice(-3);

    return {
      patientName: patient.name,
      indicators: buildIndicators(patient, measurements),
      measurements,
      readings: glycemia.map((measurement) => ({
        id: measurement.id,
        label: new Date(measurement.takenAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        value: String(Math.round(measurement.value)),
      })),
    };
  }, [measurementsQuery?.data, patientQuery?.data]);

  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.measurements.history(patientId, range) });
  }, [patientId, queryClient, range]);

  const error = patientQuery?.error ?? measurementsQuery?.error ?? null;

  return {
    ui: toUiState<BiomarkersData>({
      isPending: Boolean(patientQuery?.isPending || measurementsQuery?.isPending),
      error: error ? DomainError.from(error) : null,
      data,
      isEmpty: (value) => value.measurements.length === 0,
    }),
    range,
    setRange,
    refresh,
  };
}
