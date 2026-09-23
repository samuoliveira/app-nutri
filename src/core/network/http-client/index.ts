import { DomainError } from '@/core/domain/domain-error';
import { getApiConfig } from '../api-config';
import { getNetworkConfig } from '../network-config';
import type { HttpRequest } from './types';

export type { HttpMethod, HttpRequest } from './types';

/**
 * Único ponto de saída HTTP do app. Traduz status e falha de rede em
 * DomainError, então nenhuma camada acima lida com Response nem com exceção crua.
 */
export async function httpRequest<T>({ method, path, body, timeoutMs }: HttpRequest): Promise<T> {
  /**
   * Offline vale para as duas fontes: o modo simulado da tela Mais e a queda
   * real de rede (useConnectivity escreve no mesmo lugar). Sem isto, o toggle
   * só afetaria o catálogo simulado.
   */
  if (getNetworkConfig().forcedOffline) throw DomainError.offline();

  const config = getApiConfig();
  const baseUrl = config.baseUrl;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs ?? config.timeoutMs);

  try {
    // fetch-ok: este é o transporte; quem chama passa por core/network/api
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!response.ok) throw errorForStatus(response.status, path);

    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  } catch (cause) {
    throw toDomainError(cause);
  } finally {
    clearTimeout(timeout);
  }
}

function errorForStatus(status: number, path: string): DomainError {
  if (status === 404) return DomainError.notFound('Recurso');
  if (status === 400 || status === 422) return DomainError.invalidInput(`Requisição inválida em ${path}`);
  if (status === 503) return DomainError.featureDisabled('ai_insights');
  return DomainError.network(`Servidor respondeu ${status} em ${path}`);
}

function toDomainError(cause: unknown): DomainError {
  if (cause instanceof DomainError) return cause;
  if (cause instanceof Error && cause.name === 'AbortError') return DomainError.timeout();
  if (cause instanceof TypeError) return DomainError.offline();
  return DomainError.from(cause);
}
