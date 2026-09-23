import { DomainError } from '@/core/domain/domain-error';
import type { Patient } from '@/core/domain/model';
import type { PatientLocalSource } from '@/core/data/source/patient-local-source';
import type { PatientRemoteSource } from '@/core/data/source/patient-remote-source';
import { PatientRepositoryImpl } from './index';

function patient(overrides: Partial<Patient> = {}): Patient {
  return {
    id: 'p-1',
    name: 'Ana Silva',
    ageYears: 32,
    sex: 'F',
    heightM: 1.62,
    weightKg: 68.4,
    pinned: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    lastVisitAt: '2026-09-10T00:00:00.000Z',
    status: 'em_dia',
    ...overrides,
  };
}

class FakeLocal {
  queue: Array<{ id: number; kind: string; payload: unknown }> = [];
  private nextId = 1;
  private readonly rows = new Map<string, Patient>();

  constructor(patients: ReadonlyArray<Patient>) {
    for (const item of patients) this.rows.set(item.id, item);
  }

  async save(): Promise<void> {}
  async all(): Promise<ReadonlyArray<Patient>> {
    return [...this.rows.values()];
  }
  async byId(id: string): Promise<Patient | null> {
    return this.rows.get(id) ?? null;
  }
  async setPinned(id: string, pinned: boolean): Promise<void> {
    const row = this.rows.get(id);
    if (row) this.rows.set(id, { ...row, pinned });
  }
  async enqueue(kind: string, payload: unknown): Promise<void> {
    this.queue.push({ id: this.nextId++, kind, payload });
  }
  async pending() {
    return [...this.queue];
  }
  async removePending(id: number): Promise<void> {
    this.queue = this.queue.filter((item) => item.id !== id);
  }
}

/** Servidor falso: cada chamada de setPinned consome o próximo erro da lista (undefined = sucesso). */
function build(patients: ReadonlyArray<Patient>, ...pinErrors: Array<DomainError | undefined>) {
  const local = new FakeLocal(patients);
  const remote = {
    calls: [] as Array<{ id: string; pinned: boolean }>,
    listAll: async () => patients,
    setPinned: async (id: string, pinned: boolean) => {
      const error = pinErrors.shift();
      if (error) throw error;
      remote.calls.push({ id, pinned });
    },
  };
  const repository = new PatientRepositoryImpl(
    remote as unknown as PatientRemoteSource,
    local as unknown as PatientLocalSource,
  );
  return { repository, local, remote };
}

describe('PatientRepositoryImpl', () => {
  it('conta pelo status que o servidor calculou, não por regra local', async () => {
    // Visita recente, mas o servidor viu glicemia alterada: é atenção.
    const { repository } = build([
      patient({ id: 'p-1', status: 'atencao' }),
      patient({ id: 'p-2', status: 'em_dia' }),
      patient({ id: 'p-3', status: 'novo', lastVisitAt: null }),
    ]);

    const result = await repository.countByStatus();

    expect(result.ok && result.value).toEqual({ atencao: 1, em_dia: 1, novo: 1 });
  });

  it('filtra a lista pelo status do servidor', async () => {
    const { repository } = build([patient({ id: 'p-1', status: 'atencao' }), patient({ id: 'p-2' })]);

    const result = await repository.list({ status: 'atencao', search: '' }, null);

    expect(result.ok && result.value.items.map((item) => item.id)).toEqual(['p-1']);
  });

  it('sem rede: mantém a mudança local e enfileira para reenviar', async () => {
    const { repository, local } = build([patient()], DomainError.offline());

    const result = await repository.setPinned('p-1', true);

    expect(result.ok && result.value.pinned).toBe(true);
    expect(local.queue).toEqual([{ id: 1, kind: 'set-pinned', payload: { id: 'p-1', pinned: true } }]);
  });

  it('servidor recusou: desfaz a mudança local, não enfileira e devolve o erro', async () => {
    const { repository, local } = build([patient()], DomainError.notFound('Paciente'));

    const result = await repository.setPinned('p-1', true);

    expect(result.ok).toBe(false);
    expect(!result.ok && result.error.code).toBe('not-found');
    expect((await local.byId('p-1'))?.pinned).toBe(false);
    expect(local.queue).toEqual([]);
  });

  describe('fila offline', () => {
    it('reenvia na ordem, confirma e esvazia a fila', async () => {
      const { repository, local, remote } = build([patient()], DomainError.offline());
      await repository.setPinned('p-1', true);

      const result = await repository.syncPending();

      expect(result.ok && result.value).toEqual({ sent: 1, dropped: 0, remaining: 0 });
      expect(remote.calls).toEqual([{ id: 'p-1', pinned: true }]);
      expect(local.queue).toEqual([]);
    });

    it('rede caiu de novo: para a rodada e mantém a fila intacta', async () => {
      const { repository, local } = build([patient()], DomainError.offline(), DomainError.timeout());
      await repository.setPinned('p-1', true);

      const result = await repository.syncPending();

      expect(result.ok && result.value).toEqual({ sent: 0, dropped: 0, remaining: 1 });
      expect(local.queue).toHaveLength(1);
    });

    it('servidor recusou no reenvio: desfaz o local e tira da fila', async () => {
      const { repository, local } = build([patient()], DomainError.offline(), DomainError.notFound('Paciente'));
      await repository.setPinned('p-1', true);

      const result = await repository.syncPending();

      expect(result.ok && result.value).toEqual({ sent: 0, dropped: 1, remaining: 0 });
      expect((await local.byId('p-1'))?.pinned).toBe(false);
      expect(local.queue).toEqual([]);
    });

    it('toque novo online espera a fila antiga chegar antes, para não ser sobrescrito', async () => {
      const { repository, remote } = build([patient()], DomainError.offline());
      await repository.setPinned('p-1', true);

      await repository.setPinned('p-1', false);

      expect(remote.calls).toEqual([
        { id: 'p-1', pinned: true },
        { id: 'p-1', pinned: false },
      ]);
    });

    it('toque novo com fila travada entra atrás dela, sem ir ao servidor', async () => {
      const { repository, local, remote } = build([patient()], DomainError.offline(), DomainError.offline());
      await repository.setPinned('p-1', true);

      const result = await repository.setPinned('p-1', false);

      expect(result.ok && result.value.pinned).toBe(false);
      expect(remote.calls).toEqual([]);
      expect(local.queue.map((item) => item.payload)).toEqual([
        { id: 'p-1', pinned: true },
        { id: 'p-1', pinned: false },
      ]);
    });
  });
});
