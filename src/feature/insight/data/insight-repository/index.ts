import { DomainError } from '@/core/domain/domain-error';
import type { Insight } from '@/core/domain/model';
import type { InsightRepository } from '@/core/domain/repository';
import { fail, ok, type Result } from '@/core/domain/result';
import type { PatientRemoteSource } from '@/core/data/source/patient-remote-source';
import { isRemoteApiEnabled } from '@/core/network/api-config';
import { readServerFlags } from '@/core/network/fixtures/flag-config';
import { anonymizePatient, profileFingerprint } from '../../domain/anonymize-patient';
import { buildRuleInsight } from '../../domain/build-rule-insight';

/**
 * A chamada de LLM acontece no backend: o app manda o paciente e recebe o
 * rascunho já anonimizado na origem. Nenhuma chave de provedor existe no bundle.
 * Sem backend configurado, o rascunho vem das regras clínicas locais.
 */
export class InsightRepositoryImpl implements InsightRepository {
  private readonly cache = new Map<string, Insight>();

  constructor(private readonly remote: PatientRemoteSource) {}

  async latestFor(patientId: string): Promise<Result<Insight | null>> {
    const cached = [...this.cache.values()].find((insight) => insight.patientId === patientId);
    return ok(cached ?? null);
  }

  /**
   * Aprovação é decisão clínica: precisa ficar no servidor, não só na tela.
   * Sem backend configurado, marca o rascunho em memória.
   */
  async approve(insightId: string): Promise<Result<Insight>> {
    const cached = this.cache.get(insightId);

    try {
      if (isRemoteApiEnabled()) {
        if (!cached) return fail(DomainError.notFound('Rascunho'));

        const approved = await this.remote.approveInsight(cached.patientId, insightId);
        this.cache.set(insightId, approved);
        return ok(approved);
      }

      if (!cached) return fail(DomainError.notFound('Rascunho'));

      const approved: Insight = { ...cached, status: 'aprovado' };
      this.cache.set(insightId, approved);
      return ok(approved);
    } catch (cause) {
      return fail(DomainError.from(cause));
    }
  }

  async create(patientId: string): Promise<Result<Insight>> {
    if (!isRemoteApiEnabled() && !readServerFlags().ai_insights) {
      return fail(DomainError.featureDisabled('ai_insights'));
    }

    try {
      if (isRemoteApiEnabled()) {
        /** O 503 do backend (flag desligada) já chega como feature-disabled. */
        const insight = await this.remote.createInsight(patientId);
        this.cache.set(insight.id, insight);
        return ok(insight);
      }

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
