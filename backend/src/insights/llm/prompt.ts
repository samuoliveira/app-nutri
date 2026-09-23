import type { AnonymousProfile } from './anonymous-profile';

/** Mesmo contrato para qualquer provedor: JSON, sem diagnóstico, no máximo 3 condutas. */
export const SYSTEM_PROMPT = [
  'Você apoia nutricionistas analisando dados clínicos anonimizados.',
  'Responda SOMENTE com JSON no formato {"summary": string, "recommendations": string[]}.',
  'Máximo de 3 recomendações, cada uma com no máximo 140 caracteres.',
  'Nunca diagnostique: sugira condutas nutricionais e, quando houver risco, indique encaminhamento clínico.',
].join(' ');

export function userPrompt(profile: AnonymousProfile): string {
  return JSON.stringify(profile);
}

/**
 * Modelo às vezes embrulha o JSON em texto ou cerca de código.
 * Recortar entre chaves é mais barato que exigir formatação perfeita.
 */
export function parseLlmJson(text: string): { summary: string; recommendations: string[] } {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('Resposta do LLM sem JSON');

  const parsed = JSON.parse(text.slice(start, end + 1)) as { summary?: unknown; recommendations?: unknown };
  if (typeof parsed.summary !== 'string') throw new Error('Resposta do LLM sem summary');

  return {
    summary: parsed.summary,
    recommendations: Array.isArray(parsed.recommendations)
      ? parsed.recommendations.filter((item): item is string => typeof item === 'string').slice(0, 3)
      : [],
  };
}
