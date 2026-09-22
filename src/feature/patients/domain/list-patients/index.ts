import { DomainError } from '@/core/domain/domain-error';
import type { PatientRepository } from '@/core/domain/repository';
import { fail, ok, type Result } from '@/core/domain/result';
import { sortPatients } from '../filter-patients';
import type { ListPatientsInput, ListPatientsOutput } from './types';

export type { ListPatientsInput, ListPatientsOutput } from './types';

/**
 * Use case: nenhuma dependência de React, de navegação ou de banco.
 * O teste monta com um repositório falso e roda em milissegundos.
 */
export class ListPatients {
  constructor(private readonly patients: PatientRepository) {}

  async execute(input: ListPatientsInput): Promise<Result<ListPatientsOutput>> {
    const page = await this.patients.list(input.query, input.cursor);
    if (!page.ok) return fail(page.error);

    if (page.value.total < 0) return fail(DomainError.network('Carteira inconsistente'));

    return ok({
      items: sortPatients(page.value.items),
      total: page.value.total,
      nextCursor: page.value.nextCursor,
    });
  }
}
