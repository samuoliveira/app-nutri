import { QueryClient } from '@tanstack/react-query';

import { DomainError } from '@/core/domain/domain-error';
import type { Patient } from '@/core/domain/model';
import type { PatientPage, PatientQuery, PatientRepository } from '@/core/domain/repository';
import { fail, ok, type Result } from '@/core/domain/result';
import { PatientsViewModel } from './index';

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
    ...overrides,
  };
}

class FakePatientRepository implements PatientRepository {
  constructor(
    private readonly items: ReadonlyArray<Patient>,
    private readonly pinResult: Result<Patient> = ok(patient({ pinned: true })),
    private readonly listResult?: Result<PatientPage>,
  ) {}

  async list(_query: PatientQuery, _cursor: string | null): Promise<Result<PatientPage>> {
    return this.listResult ?? ok({ items: this.items, total: this.items.length, nextCursor: null });
  }

  async byId(id: string): Promise<Result<Patient>> {
    const found = this.items.find((item) => item.id === id);
    return found ? ok(found) : fail(DomainError.notFound('Paciente'));
  }

  async setPinned(): Promise<Result<Patient>> {
    return this.pinResult;
  }

  async countByStatus(): Promise<Result<Record<'em_dia' | 'atencao' | 'novo', number>>> {
    return ok({ em_dia: this.items.length, atencao: 0, novo: 0 });
  }
}

const queryClient = new QueryClient();

describe('PatientsViewModel', () => {
  it('sai de carregando para dados, sem renderizar tela', async () => {
    const viewModel = new PatientsViewModel(new FakePatientRepository([patient()]), queryClient, {
      filter: 'all',
      search: '',
    });

    expect(viewModel.getSnapshot().ui.kind).toBe('loading');
    await viewModel.load();

    const state = viewModel.getSnapshot();
    expect(state.ui.kind).toBe('data');
    expect(state.ui.kind === 'data' && state.ui.data.total).toBe(1);
  });

  it('mostra vazio quando o filtro não devolve ninguém', async () => {
    const viewModel = new PatientsViewModel(new FakePatientRepository([]), queryClient, {
      filter: 'atencao',
      search: '',
    });

    await viewModel.load();
    expect(viewModel.getSnapshot().ui.kind).toBe('empty');
  });

  it('traduz falha de rede em erro com retry', async () => {
    const repository = new FakePatientRepository([], ok(patient()), fail(DomainError.offline()));
    const viewModel = new PatientsViewModel(repository, queryClient, { filter: 'all', search: '' });

    await viewModel.load();
    const state = viewModel.getSnapshot();

    expect(state.ui.kind).toBe('error');
    expect(state.ui.kind === 'error' && state.ui.error.code).toBe('offline');
    expect(state.ui.kind === 'error' && state.ui.error.retryable).toBe(true);
  });

  it('fixa na hora e desfaz quando o servidor recusa', async () => {
    const target = patient();
    const repository = new FakePatientRepository([target], fail(DomainError.network()));
    const viewModel = new PatientsViewModel(repository, queryClient, { filter: 'all', search: '' });

    await viewModel.load();
    await viewModel.togglePinned(target);

    const state = viewModel.getSnapshot();
    expect(state.ui.kind === 'data' && state.ui.data.items[0]?.pinned).toBe(false);
  });

  it('mantém o fixado quando o servidor confirma', async () => {
    const target = patient();
    const repository = new FakePatientRepository([target], ok(patient({ pinned: true })));
    const viewModel = new PatientsViewModel(repository, queryClient, { filter: 'all', search: '' });

    await viewModel.load();
    await viewModel.togglePinned(target);

    const state = viewModel.getSnapshot();
    expect(state.ui.kind === 'data' && state.ui.data.items[0]?.pinned).toBe(true);
  });
});
