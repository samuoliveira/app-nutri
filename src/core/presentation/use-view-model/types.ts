/** Contrato mínimo que a ponte precisa: o ViewModel concreto satisfaz isso. */
export interface Observable<S> {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => S;
  dispose: () => void;
}

export type StateOf<VM> = VM extends { getSnapshot: () => infer S } ? S : never;
