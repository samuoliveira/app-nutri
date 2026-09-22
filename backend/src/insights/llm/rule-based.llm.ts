import { Injectable } from '@nestjs/common';

import type { AnonymousProfile } from './anonymous-profile';
import type { LlmClient, LlmResult } from './llm.client';

/**
 * Fallback determinístico: mantém a API utilizável sem chave de LLM
 * e serve de rede de segurança quando o provedor falha.
 */
@Injectable()
export class RuleBasedLlm implements LlmClient {
  async generate(profile: AnonymousProfile): Promise<LlmResult> {
    const recommendations: string[] = [];
    const notes: string[] = [];

    if (profile.bmi !== null) {
      if (profile.bmi >= 30) {
        notes.push(`IMC ${profile.bmi} na faixa de obesidade`);
        recommendations.push('Priorizar déficit calórico moderado e acompanhamento quinzenal.');
      } else if (profile.bmi >= 25) {
        notes.push(`IMC ${profile.bmi} na faixa de sobrepeso`);
        recommendations.push('Ajustar densidade calórica e reforçar atividade física.');
      } else if (profile.bmi < 18.5) {
        notes.push(`IMC ${profile.bmi} abaixo do esperado`);
        recommendations.push('Aumentar aporte calórico com foco em proteína.');
      } else {
        notes.push(`IMC ${profile.bmi} dentro da faixa de referência`);
      }
    }

    const glucose = latest(profile, 'glucose');
    if (glucose !== null && glucose >= 126) {
      notes.push(`glicemia de jejum em ${glucose} mg/dL`);
      recommendations.push('Reduzir carboidrato simples e encaminhar para avaliação clínica.');
    }

    const pressure = latest(profile, 'pressure');
    if (pressure !== null && pressure >= 140) {
      notes.push(`pressão sistólica em ${pressure} mmHg`);
      recommendations.push('Reduzir sódio e monitorar pressão semanalmente.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Manter o plano atual e reavaliar na próxima consulta.');
    }

    const summary =
      notes.length > 0
        ? `Paciente de ${profile.ageYears} anos com ${notes.join(', ')}.`
        : `Paciente de ${profile.ageYears} anos sem alterações relevantes nas últimas medições.`;

    return { summary, recommendations, source: 'rules' };
  }
}

function latest(profile: AnonymousProfile, kind: string): number | null {
  const found = [...profile.measurements]
    .filter((measurement) => measurement.kind === kind)
    .sort((a, b) => b.takenAt.localeCompare(a.takenAt))[0];

  return found?.value ?? null;
}
