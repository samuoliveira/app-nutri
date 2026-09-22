import { DomainError } from '@/core/domain/domain-error';
import { getNetworkConfig } from '../network-config';

export type Route = (params: Record<string, string>) => Promise<unknown>;

/**
 * Cliente tipado: a feature declara o formato que espera e recebe
 * DomainError em vez de exceção crua.
 */
export async function request<T>(
  name: string,
  handler: () => T | Promise<T>,
  params: Record<string, string> = {},
): Promise<T> {
  const config = getNetworkConfig();

  if (config.forcedOffline) throw DomainError.offline();

  const latency = config.latencyMs + Math.random() * config.jitterMs;
  await delay(latency);

  if (Math.random() < config.timeoutRate) throw DomainError.timeout();
  if (Math.random() < config.failureRate) {
    throw DomainError.network(`Falha ao consultar ${name}${formatParams(params)}`);
  }

  return handler();
}

function formatParams(params: Record<string, string>): string {
  const entries = Object.entries(params);
  return entries.length === 0 ? '' : ` (${entries.map(([key, value]) => `${key}=${value}`).join(', ')})`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
