import { useQueries, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { useContainer } from '@/core/di/container';
import { DomainError } from '@/core/domain/domain-error';
import { toUiState } from '@/core/presentation/ui-state';
import { queryKeys } from '@/core/query/query-keys';
import { greetingFor, longDate } from '../../domain/greeting';
import { buildTodayItems } from '../../domain/today-schedule';
import type { HomeData, HomeModel } from './types';

export type { HomeData, HomeModel } from './types';

/**
 * Tela de leitura pura: quem guarda o dado do servidor é o TanStack Query,
 * e o modelo só monta o que a tela desenha.
 */
export function useHomeModel(now: Date = new Date()): HomeModel {
  const container = useContainer();
  const queryClient = useQueryClient();
  const dayISO = now.toISOString();

  const [schedule, counts] = useQueries({
    queries: [
      {
        queryKey: queryKeys.schedule.today(dayISO.slice(0, 10)),
        queryFn: async () => {
          const result = await container.schedule.today(dayISO);
          if (!result.ok) throw result.error;
          return result.value;
        },
      },
      {
        queryKey: queryKeys.patients.counts(),
        queryFn: async () => {
          const result = await container.patients.countByStatus();
          if (!result.ok) throw result.error;
          return result.value;
        },
      },
    ],
  });

  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.schedule.today(dayISO.slice(0, 10)) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.patients.counts() });
  }, [dayISO, queryClient]);

  const data: HomeData | undefined = useMemo(() => {
    if (!schedule?.data || !counts?.data) return undefined;
    const total = counts.data.em_dia + counts.data.atencao + counts.data.novo;

    return {
      greeting: greetingFor(now),
      dateLabel: longDate(now),
      today: buildTodayItems(schedule.data, now.getTime()),
      attentionCount: counts.data.atencao,
      totalPatients: total,
    };
  }, [counts?.data, now, schedule?.data]);

  const error = schedule?.error ?? counts?.error ?? null;

  return {
    ui: toUiState<HomeData>({
      isPending: Boolean(schedule?.isPending || counts?.isPending),
      error: error ? DomainError.from(error) : null,
      data,
    }),
    refresh,
  };
}
