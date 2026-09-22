import type { PatientQuery } from '@/core/domain/repository';

/**
 * Chave de query é contrato compartilhado: mora aqui, nunca na porta pública
 * de uma feature. Quem invalida e quem registra leem o mesmo arquivo.
 */
export const queryKeys = {
  patients: {
    all: ['patients'] as const,
    list: (query: PatientQuery) => ['patients', 'list', query.status, query.search] as const,
    counts: () => ['patients', 'counts'] as const,
    detail: (id: string) => ['patients', 'detail', id] as const,
  },
  measurements: {
    history: (patientId: string, range: string) => ['measurements', patientId, range] as const,
    latest: (patientId: string) => ['measurements', patientId, 'latest'] as const,
  },
  schedule: {
    today: (dayISO: string) => ['schedule', 'today', dayISO] as const,
  },
  insight: {
    latest: (patientId: string) => ['insight', patientId] as const,
  },
  flags: {
    snapshot: () => ['flags'] as const,
  },
} as const;
