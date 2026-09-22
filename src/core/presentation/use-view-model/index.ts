import { useEffect, useMemo, useSyncExternalStore } from 'react';

import type { Observable, StateOf } from './types';

export type { Observable, StateOf } from './types';

/** Única ponte entre ViewModel e React. Nenhuma tela usa useSyncExternalStore direto. */
export function useViewModel<VM extends Observable<unknown>>(
  factory: () => VM,
  deps: unknown[],
): [StateOf<VM>, VM] {
  // eslint-disable-next-line react-hooks/exhaustive-deps -- deps é a identidade do ViewModel, declarada pela tela
  const viewModel = useMemo(factory, deps);
  const state = useSyncExternalStore(viewModel.subscribe, viewModel.getSnapshot, viewModel.getSnapshot);

  useEffect(() => () => viewModel.dispose(), [viewModel]);

  return [state as StateOf<VM>, viewModel];
}
