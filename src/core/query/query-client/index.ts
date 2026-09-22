import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';

import { DomainError } from '@/core/domain/domain-error';

/** Carteira e fichas abertas ficam no aparelho por 7 dias (regra 5 do produto). */
export const OFFLINE_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: OFFLINE_CACHE_MAX_AGE_MS,
        staleTime: 30_000,
        retry: (failureCount, error) => {
          const domainError = DomainError.from(error);
          return domainError.retryable && failureCount < 2;
        },
      },
      mutations: { retry: 0 },
    },
  });
}

export function createQueryPersister() {
  return createAsyncStoragePersister({ storage: AsyncStorage, key: 'tecsa.query-cache.v1' });
}
