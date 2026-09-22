import { DomainError } from '@/core/domain/domain-error';
import type { Insight } from '@/core/domain/model';
import type { InsightRepository } from '@/core/domain/repository';
import { fail, type Result } from '@/core/domain/result';

/**
 * Use case da IA. O kill switch é decidido aqui, não na tela:
 * flag desligada nunca chega a bater no serviço.
 */
export class RequestInsight {
  constructor(private readonly insights: InsightRepository) {}

  execute(patientId: string, aiEnabled: boolean): Promise<Result<Insight>> {
    if (!aiEnabled) return Promise.resolve(fail(DomainError.featureDisabled('ai_insights')));
    return this.insights.create(patientId);
  }
}
