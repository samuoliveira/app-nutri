/**
 * ViewModel não é React: é uma classe observável com subscribe/getSnapshot,
 * o mesmo papel do ViewModel do Android e do ObservableObject do iOS.
 * Testa sem renderizar tela.
 */
export abstract class ViewModel<S> {
  private listeners = new Set<() => void>();
  private snapshot: S;

  constructor(initialState: S) {
    this.snapshot = initialState;
  }

  getSnapshot = (): S => this.snapshot;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  protected setState(patch: Partial<S> | ((current: S) => S)): void {
    const next =
      typeof patch === 'function'
        ? (patch as (current: S) => S)(this.snapshot)
        : { ...this.snapshot, ...patch };
    if (Object.is(next, this.snapshot)) return;
    this.snapshot = next;
    this.listeners.forEach((listener) => listener());
  }

  /** Chamado quando a última tela ligada ao ViewModel desmonta. */
  dispose(): void {
    this.listeners.clear();
  }
}
