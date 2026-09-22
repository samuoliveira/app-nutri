import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { useContainer } from '@/core/di/container';
import { DomainError } from '@/core/domain/domain-error';
import type { Patient } from '@/core/domain/model';
import { toUiState } from '@/core/presentation/ui-state';
import { queryKeys } from '@/core/query/query-keys';
import { buildIndicators } from '@/feature/biomarkers/domain';
import type { PatientDetailData, PatientDetailModel } from './types';

export type { PatientDetailData, PatientDetailModel } from './types';

const HISTORY_DAYS = 30;

export function usePatientModel(patientId: string): PatientDetailModel {
  const container = useContainer();
  const queryClient = useQueryClient();
  const since = new Date(Date.now() - HISTORY_DAYS * 24 * 60 * 60 * 1000).toISOString();

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
        queryKey: queryKeys.measurements.history(patientId, `${HISTORY_DAYS}d`),
        queryFn: async () => {
          const result = await container.measurements.history(patientId, since);
          if (!result.ok) throw result.error;
          return result.value;
        },
      },
    ],
  });

  /** Fixar é otimista: o cache muda antes da resposta e volta atrás se falhar. */
  const pinMutation = useMutation({
    mutationFn: async (patient: Patient) => {
      const result = await container.patients.setPinned(patient.id, !patient.pinned);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onMutate: async (patient: Patient) => {
      const key = queryKeys.patients.detail(patient.id);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Patient>(key);
      queryClient.setQueryData<Patient>(key, { ...patient, pinned: !patient.pinned });
      return { previous, key };
    },
    onError: (_error, _patient, context) => {
      if (context?.previous) queryClient.setQueryData(context.key, context.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });
    },
  });

  const data: PatientDetailData | undefined = useMemo(() => {
    const patient = patientQuery?.data;
    const measurements = measurementsQuery?.data;
    if (!patient || !measurements) return undefined;

    return {
      patient,
      measurements,
      indicators: buildIndicators(patient, measurements),
      weightSeries: measurements
        .filter((measurement) => measurement.kind === 'peso')
        .sort((a, b) => Date.parse(a.takenAt) - Date.parse(b.takenAt))
        .map((measurement) => measurement.value),
    };
  }, [measurementsQuery?.data, patientQuery?.data]);

  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.patients.detail(patientId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.measurements.latest(patientId) });
  }, [patientId, queryClient]);

  const error = patientQuery?.error ?? measurementsQuery?.error ?? null;

  return {
    ui: toUiState<PatientDetailData>({
      isPending: Boolean(patientQuery?.isPending || measurementsQuery?.isPending),
      error: error ? DomainError.from(error) : null,
      data,
    }),
    refresh,
    togglePin: () => {
      if (data) pinMutation.mutate(data.patient);
    },
  };
}
