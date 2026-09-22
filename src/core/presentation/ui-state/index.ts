import type { DomainError } from '@/core/domain/domain-error';
import type { ToUiStateInput, UiState } from './types';

export type { ToUiStateInput, UiState } from './types';

export const uiLoading = <T,>(): UiState<T> => ({ kind: 'loading' });
export const uiError = <T,>(error: DomainError): UiState<T> => ({ kind: 'error', error });
export const uiEmpty = <T,>(): UiState<T> => ({ kind: 'empty' });
export const uiData = <T,>(data: T): UiState<T> => ({ kind: 'data', data });

/** Traduz o retorno cru de uma query para UiState, com a regra de vazio da tela. */
export function toUiState<T>(input: ToUiStateInput<T>): UiState<T> {
  if (input.error) return uiError(input.error);
  if (input.isPending || input.data === undefined) return uiLoading();
  if (input.isEmpty?.(input.data)) return uiEmpty();
  return uiData(input.data);
}
