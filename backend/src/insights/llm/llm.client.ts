import type { AnonymousProfile } from './anonymous-profile';

export interface LlmResult {
  summary: string;
  recommendations: string[];
  source: 'llm' | 'rules';
}

/**
 * Porta do LLM (DIP): o service depende desta interface, não do SDK.
 * Trocar de provedor é trocar a implementação registrada no módulo.
 */
export interface LlmClient {
  generate(profile: AnonymousProfile): Promise<LlmResult>;
}

export const LLM_CLIENT = Symbol('LLM_CLIENT');
