export interface Trend {
  /** Variação percentual entre a primeira e a última medição da janela. */
  readonly percent: number;
  readonly direction: 'subindo' | 'descendo' | 'estavel';
}
