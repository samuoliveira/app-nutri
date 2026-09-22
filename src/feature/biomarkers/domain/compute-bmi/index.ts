import { DomainError } from '@/core/domain/domain-error';
import { fail, ok, type Result } from '@/core/domain/result';

/** IMC = peso / altura². Recusa entrada inválida antes de qualquer tela desenhar. */
export function computeBmi(weightKg: number, heightM: number): Result<number> {
  if (weightKg <= 0) return fail(DomainError.invalidInput('Peso precisa ser maior que zero'));
  if (heightM <= 0) return fail(DomainError.invalidInput('Altura precisa ser maior que zero'));

  return ok(Number((weightKg / (heightM * heightM)).toFixed(1)));
}
