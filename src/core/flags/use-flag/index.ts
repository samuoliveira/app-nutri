import { useQuery } from '@tanstack/react-query';

import { useContainer } from '@/core/di/container';
import { DomainError } from '@/core/domain/domain-error';
import { queryKeys } from '@/core/query/query-keys';
import { defaultFlags, FLAG_REFRESH_MS, parseFlagSnapshot, type FlagKey, type FlagSnapshot } from '../flags';

export function useFlags(): FlagSnapshot {
  const { flags } = useContainer();

  const query = useQuery({
    queryKey: queryKeys.flags.snapshot(),
    queryFn: async () => {
      const result = await flags.snapshot();
      if (!result.ok) throw result.error;
      return parseFlagSnapshot(result.value);
    },
    refetchInterval: FLAG_REFRESH_MS,
    staleTime: FLAG_REFRESH_MS,
    retry: (count, error) => DomainError.from(error).retryable && count < 1,
  });

  return query.data ?? defaultFlags;
}

export function useFlag(key: FlagKey): boolean {
  return useFlags()[key];
}
