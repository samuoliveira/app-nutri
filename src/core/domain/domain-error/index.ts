/** Código que a camada de apresentação usa para decidir o que mostrar. */
export type DomainErrorCode =
  | 'offline'
  | 'timeout'
  | 'network'
  | 'not-found'
  | 'invalid-input'
  | 'feature-disabled'
  | 'storage'
  | 'unknown';

export class DomainError extends Error {
  readonly code: DomainErrorCode;
  readonly retryable: boolean;

  constructor(code: DomainErrorCode, message: string, retryable = false) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.retryable = retryable;
  }

  static offline(): DomainError {
    return new DomainError('offline', 'Sem conexão', true);
  }

  static timeout(): DomainError {
    return new DomainError('timeout', 'O servidor demorou para responder', true);
  }

  static network(message = 'Falha de rede'): DomainError {
    return new DomainError('network', message, true);
  }

  static notFound(what: string): DomainError {
    return new DomainError('not-found', `${what} não encontrado`);
  }

  static invalidInput(message: string): DomainError {
    return new DomainError('invalid-input', message);
  }

  static featureDisabled(flag: string): DomainError {
    return new DomainError('feature-disabled', `Recurso indisponível: ${flag}`);
  }

  static storage(message = 'Falha ao ler dados do aparelho'): DomainError {
    return new DomainError('storage', message, true);
  }

  static from(cause: unknown): DomainError {
    if (cause instanceof DomainError) return cause;
    const message = cause instanceof Error ? cause.message : 'Erro inesperado';
    return new DomainError('unknown', message, true);
  }
}
