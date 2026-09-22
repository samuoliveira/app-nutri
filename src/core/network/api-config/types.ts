export interface ApiConfig {
  /** Vazio desliga o backend e devolve o app ao catálogo simulado. */
  readonly baseUrl: string;
  readonly timeoutMs: number;
}
