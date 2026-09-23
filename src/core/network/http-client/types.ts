export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export interface HttpRequest {
  readonly method: HttpMethod;
  readonly path: string;
  readonly body?: unknown;
  /** Geração de IA é lenta por natureza; o resto do app usa o timeout padrão. */
  readonly timeoutMs?: number;
}
