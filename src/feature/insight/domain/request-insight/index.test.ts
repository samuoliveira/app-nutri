import { DomainError } from '@/core/domain/domain-error';
import type { Insight } from '@/core/domain/model';
import type { InsightRepository } from '@/core/domain/repository';
import { fail, ok, type Result } from '@/core/domain/result';
import { RequestInsight } from './index';

const insight: Insight = {
  id: 'i-1',
  patientId: 'p-1',
  status: 'rascunho',
  headline: 'Leitura',
  body: 'corpo',
  consideredData: [],
  source: 'regras',
  createdAt: '2026-09-21T00:00:00.000Z',
};

class FakeInsightRepository implements InsightRepository {
  calls = 0;

  async latestFor(): Promise<Result<Insight | null>> {
    return ok(null);
  }

  async approve(insightId: string): Promise<Result<Insight>> {
    return fail(DomainError.notFound(insightId));
  }

  async create(): Promise<Result<Insight>> {
    this.calls += 1;
    return ok(insight);
  }
}

describe('kill switch da IA', () => {
  it('com a flag desligada, nem chega a bater no serviço', async () => {
    const repository = new FakeInsightRepository();
    const result = await new RequestInsight(repository).execute('p-1', false);

    expect(repository.calls).toBe(0);
    expect(result.ok).toBe(false);
    expect(!result.ok && result.error.code).toBe('feature-disabled');
  });

  it('com a flag ligada, devolve rascunho para revisão', async () => {
    const repository = new FakeInsightRepository();
    const result = await new RequestInsight(repository).execute('p-1', true);

    expect(repository.calls).toBe(1);
    expect(result.ok && result.value.status).toBe('rascunho');
  });
});
