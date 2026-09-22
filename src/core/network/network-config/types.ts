/**
 * Transporte simulado: latência, falha e timeout ficam num lugar só,
 * para reproduzir erro e lentidão sem depender de servidor.
 */
export interface NetworkConfig {
  latencyMs: number;
  jitterMs: number;
  failureRate: number;
  timeoutRate: number;
  timeoutMs: number;
  /** Modo avião simulado pela tela "Mais". */
  forcedOffline: boolean;
}
