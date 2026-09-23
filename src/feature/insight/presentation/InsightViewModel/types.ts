import type { Insight } from '@/core/domain/model';
import type { UiState } from '@/core/presentation/ui-state';

import type { DomainError } from '@/core/domain/domain-error';

export interface InsightState {
  readonly ui: UiState<Insight>;
  readonly creating: boolean;
  readonly approving: boolean;
  readonly approved: boolean;
  /** Falha da aprovação não derruba o rascunho: vira aviso ao lado do botão. */
  readonly approveError: DomainError | null;
}
