import { DomainError } from '@/core/domain/domain-error';
import type { FlagRepository } from '@/core/domain/repository';
import { fail, ok, type Result } from '@/core/domain/result';
import type { PatientRemoteSource } from '../source/patient-remote-source';

export class FlagRepositoryImpl implements FlagRepository {
  constructor(private readonly remote: PatientRemoteSource) {}

  async snapshot(): Promise<Result<Record<string, boolean>>> {
    try {
      return ok(await this.remote.flags());
    } catch (cause) {
      return fail(DomainError.from(cause));
    }
  }
}
