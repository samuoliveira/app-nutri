import type { DomainError } from '@/core/domain/domain-error';

/**
 * Result é o contrato de saída de todo use case e de todo repositório.
 * A fronteira nunca deixa passar exceção: falha vira valor.
 */
export type Result<T> = { ok: true; value: T } | { ok: false; error: DomainError };
