import { DomainError } from '@/core/domain/domain-error';
import type { Patient } from '@/core/domain/model';
import type { PatientPage, PatientQuery, PatientRepository } from '@/core/domain/repository';
import { fail, ok, type Result } from '@/core/domain/result';
import type { PatientLocalSource } from '@/core/data/source/patient-local-source';
import type { PatientRemoteSource } from '@/core/data/source/patient-remote-source';
import { matchesQuery } from '../../domain/filter-patients';

const PAGE_SIZE = 40;

/**
 * Implementa a porta declarada no domínio. Traduz falha de rede e de SQL
 * em DomainError antes de cruzar a fronteira, e cai para o banco local
 * quando o servidor não responde.
 */
export class PatientRepositoryImpl implements PatientRepository {
  constructor(
    private readonly remote: PatientRemoteSource,
    private readonly local: PatientLocalSource,
  ) {}

  async list(query: PatientQuery, cursor: string | null): Promise<Result<PatientPage>> {
    try {
      const patients = await this.remote.listAll();
      void this.local.save(patients.slice(0, 200));
      return ok(this.paginate(patients, query, cursor));
    } catch (cause) {
      const cached = await this.readLocal();
      if (cached.length > 0) return ok(this.paginate(cached, query, cursor));
      return fail(DomainError.from(cause));
    }
  }

  async byId(id: string): Promise<Result<Patient>> {
    try {
      const patient = await this.remote.byId(id);
      if (!patient) return fail(DomainError.notFound('Paciente'));
      const local = await this.local.byId(id);
      return ok({ ...patient, pinned: local?.pinned ?? patient.pinned });
    } catch (cause) {
      const cached = await this.local.byId(id);
      if (cached) return ok(cached);
      return fail(DomainError.from(cause));
    }
  }

  /**
   * Update otimista: o banco local muda na hora; o servidor confirma depois.
   * Falha transitória (sem rede, timeout, 5xx) vai para a fila e a mudança
   * fica. Recusa do servidor (404, 400) desfaz a mudança local e sobe o erro,
   * para o ViewModel fazer rollback da tela.
   */
  async setPinned(id: string, pinned: boolean): Promise<Result<Patient>> {
    try {
      await this.local.setPinned(id, pinned);
    } catch (cause) {
      return fail(DomainError.storage(cause instanceof Error ? cause.message : undefined));
    }

    try {
      await this.remote.setPinned(id, pinned);
      const patient = await this.local.byId(id);
      return patient ? ok(patient) : fail(DomainError.notFound('Paciente'));
    } catch (cause) {
      const error = DomainError.from(cause);
      if (!isTransient(error)) {
        await this.local.setPinned(id, !pinned);
        return fail(error);
      }

      await this.local.enqueue('set-pinned', { id, pinned });
      const patient = await this.local.byId(id);
      return patient ? ok(patient) : fail(error);
    }
  }

  async countByStatus(): Promise<Result<Record<'em_dia' | 'atencao' | 'novo', number>>> {
    const patients = await this.allKnown();
    if (patients.length === 0) return fail(DomainError.network('Carteira indisponível'));

    const counts = { em_dia: 0, atencao: 0, novo: 0 };
    for (const patient of patients) {
      counts[patient.status] += 1;
    }
    return ok(counts);
  }

  private async allKnown(): Promise<ReadonlyArray<Patient>> {
    try {
      return await this.remote.listAll();
    } catch {
      return this.readLocal();
    }
  }

  private async readLocal(): Promise<ReadonlyArray<Patient>> {
    try {
      return await this.local.all();
    } catch {
      return [];
    }
  }

  private paginate(
    patients: ReadonlyArray<Patient>,
    query: PatientQuery,
    cursor: string | null,
  ): PatientPage {
    const filtered = patients.filter((patient) => matchesQuery(patient, query));
    const start = cursor ? Number(cursor) : 0;
    const items = filtered.slice(start, start + PAGE_SIZE);
    const nextIndex = start + items.length;

    return {
      items,
      total: filtered.length,
      nextCursor: nextIndex < filtered.length ? String(nextIndex) : null,
    };
  }
}

const TRANSIENT_CODES: ReadonlyArray<DomainError['code']> = ['offline', 'timeout', 'network'];

/** Só vale reenviar depois o que pode dar certo depois. */
function isTransient(error: DomainError): boolean {
  return TRANSIENT_CODES.includes(error.code);
}
