import { DomainError } from '@/core/domain/domain-error';
import type { Insight } from '@/core/domain/model';
import type { InsightRepository } from '@/core/domain/repository';
import { fail, ok, type Result } from '@/core/domain/result';
import type { PatientRemoteSource } from '@/core/data/source/patient-remote-source';
import { readServerFlags } from '@/core/network/fixtures/flag-config';
import { anonymizePatient, profileFingerprint } from '../../domain/anonymize-patient';
import { buildRuleInsight } from '../../domain/build-rule-insight';

/**
 * A chamada de LLM acontece no backend: o app manda o perfil anonimizado e
 * recebe o rascunho. Nenhuma chave de provedor existe no bundle.
 * Enquanto o backend não sobe, o rascunho vem das regras clínicas.
 */
export class InsightRepositoryImpl implements InsightRepository {
  private readonly cache = new Map<string, Insight>();

  constructor(private readonly remote: PatientRemoteSource) {}

  async latestFor(patientId: string): Promise<Result<Insight | null>> {
    const cached = [...this.cache.values()].find((insight) => insight.patientId === patientId);
    return ok(cached ?? null);
  }

  async create(patientId: string): Promise<Result<Insight>> {
    if (!readServerFlags().ai_insights) return fail(DomainError.featureDisabled('ai_insights'));

    try {
      const patient = await this.remote.byId(patientId);
      if (!patient) return fail(DomainError.notFound('Paciente'));

      const measurements = await this.remote.measurements(patientId);
      const fingerprint = profileFingerprint(anonymizePatient(patient, measurements));

      const cached = this.cache.get(fingerprint);
      if (cached) return ok(cached);

      const insight = buildRuleInsight(patient, measurements);
      this.cache.set(fingerprint, insight);
      return ok(insight);
    } catch (cause) {
      return fail(DomainError.from(cause));
    }
  }
}
