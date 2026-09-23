import { DomainError } from '@/core/domain/domain-error';
import type { Insight } from '@/core/domain/model';
import type { InsightRepository } from '@/core/domain/repository';
import { fail, ok, type Result } from '@/core/domain/result';
import { InsightViewModel } from './index';

const RASCUNHO: Insight = {
  id: 'insight-1',
  patientId: 'p-1',
  status: 'rascunho',
  headline: 'Resumo',
  body: 'Conduta',
  consideredData: [{ label: 'IMC', detail: '32' }],
  source: 'llm',
  createdAt: '2026-09-23T12:00:00.000Z',
};

function build(approveResult: Result<Insight> = ok({ ...RASCUNHO, status: 'aprovado' })) {
  const insights: InsightRepository = {
    latestFor: jest.fn().mockResolvedValue(ok(null)),
    create: jest.fn().mockResolvedValue(ok(RASCUNHO)),
    approve: jest.fn().mockResolvedValue(approveResult),
  };

  return { viewModel: new InsightViewModel(insights, 'p-1'), insights };
}

describe('InsightViewModel', () => {
  it('registra a aprovação no servidor', async () => {
    const { viewModel, insights } = build();
    await viewModel.create(true);

    await viewModel.approve();

    expect(insights.approve).toHaveBeenCalledWith('insight-1');
    expect(viewModel.getSnapshot().approved).toBe(true);
    expect(viewModel.getSnapshot().ui.kind === 'data' && viewModel.getSnapshot().ui).toMatchObject({
      data: { status: 'aprovado' },
    });
  });

  it('volta atrás quando o servidor recusa a aprovação', async () => {
    const { viewModel } = build(fail(DomainError.offline()));
    await viewModel.create(true);

    await viewModel.approve();

    const state = viewModel.getSnapshot();
    expect(state.approved).toBe(false);
    expect(state.approveError?.code).toBe('offline');
    expect(state.ui.kind === 'data' && state.ui.data.status).toBe('rascunho');
  });

  it('não aprova duas vezes', async () => {
    const { viewModel, insights } = build();
    await viewModel.create(true);

    await viewModel.approve();
    await viewModel.approve();

    expect(insights.approve).toHaveBeenCalledTimes(1);
  });

  it('ignora aprovação sem rascunho na tela', async () => {
    const { viewModel, insights } = build();

    await viewModel.approve();

    expect(insights.approve).not.toHaveBeenCalled();
  });

  it('já abre aprovado quando o servidor devolve rascunho aprovado', async () => {
    const insights: InsightRepository = {
      latestFor: jest.fn().mockResolvedValue(ok(null)),
      create: jest.fn().mockResolvedValue(ok({ ...RASCUNHO, status: 'aprovado' })),
      approve: jest.fn(),
    };

    const viewModel = new InsightViewModel(insights, 'p-1');
    await viewModel.create(true);

    expect(viewModel.getSnapshot().approved).toBe(true);
  });
});
