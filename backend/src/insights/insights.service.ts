import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';

import { FlagsService } from '../flags/flags.service';
import { PatientsService } from '../patients/patients.service';
import { anonymizePatient } from './llm/anonymous-profile';
import { LLM_CLIENT, type LlmClient } from './llm/llm.client';
import type { Insight } from './insight.entity';
import { InsightsRepository } from './insights.repository';

/**
 * Orquestra flag → anonimização → LLM → persistência.
 * O kill switch é decidido aqui: flag desligada nunca chega no provedor.
 */
@Injectable()
export class InsightsService {
  constructor(
    private readonly patients: PatientsService,
    private readonly flags: FlagsService,
    private readonly repository: InsightsRepository,
    @Inject(LLM_CLIENT) private readonly llm: LlmClient,
  ) {}

  latestFor(patientId: string): Promise<Insight | null> {
    return this.repository.latestFor(patientId);
  }

  async create(patientId: string): Promise<Insight> {
    if (!(await this.flags.isEnabled('ai_insights'))) {
      throw new ServiceUnavailableException('Geração de insights desativada pela flag ai_insights');
    }

    const patient = await this.patients.byId(patientId);
    const measurements = await this.patients.measurements(patientId);
    const profile = anonymizePatient(patient, measurements);
    const result = await this.llm.generate(profile);

    return this.repository.save({
      patientId,
      summary: result.summary,
      recommendations: result.recommendations,
      source: result.source,
    });
  }
}
