import type { DomainError } from '@/core/domain/domain-error';

/** Os quatro estados que toda tela trata: carregando, erro, vazio, sucesso. */
export type UiState<T> =
  | { kind: 'loading' }
  | { kind: 'error'; error: DomainError }
  | { kind: 'empty' }
  | { kind: 'data'; data: T };

export interface ToUiStateInput<T> {
  isPending: boolean;
  error: DomainError | null;
  data: T | undefined;
  isEmpty?: (data: T) => boolean;
}
