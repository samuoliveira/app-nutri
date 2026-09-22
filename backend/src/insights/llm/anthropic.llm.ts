import Anthropic from '@anthropic-ai/sdk';
import { Injectable, Logger } from '@nestjs/common';

import type { AnonymousProfile } from './anonymous-profile';
import type { LlmClient, LlmResult } from './llm.client';
import { RuleBasedLlm } from './rule-based.llm';

const SYSTEM_PROMPT = [
  'Você apoia nutricionistas analisando dados clínicos anonimizados.',
  'Responda SOMENTE com JSON no formato {"summary": string, "recommendations": string[]}.',
  'Máximo de 3 recomendações, cada uma com no máximo 140 caracteres.',
  'Nunca diagnostique: sugira condutas nutricionais e, quando houver risco, indique encaminhamento clínico.',
].join(' ');

/** Implementação real da porta. A chave só existe aqui, no servidor. */
@Injectable()
export class AnthropicLlm implements LlmClient {
  private readonly logger = new Logger(AnthropicLlm.name);
  private readonly client: Anthropic;

  constructor(
    private readonly fallback: RuleBasedLlm,
    apiKey: string,
    private readonly model: string,
  ) {
    this.client = new Anthropic({ apiKey });
  }

  async generate(profile: AnonymousProfile): Promise<LlmResult> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: JSON.stringify(profile) }],
      });

      const text = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map((block) => block.text)
        .join('');

      return { ...parse(text), source: 'llm' };
    } catch (cause) {
      this.logger.warn(`LLM indisponível, usando fallback determinístico: ${String(cause)}`);
      return this.fallback.generate(profile);
    }
  }
}

function parse(text: string): { summary: string; recommendations: string[] } {
  const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
  const parsed = JSON.parse(json) as { summary?: unknown; recommendations?: unknown };

  if (typeof parsed.summary !== 'string') throw new Error('Resposta do LLM sem summary');

  return {
    summary: parsed.summary,
    recommendations: Array.isArray(parsed.recommendations)
      ? parsed.recommendations.filter((item): item is string => typeof item === 'string').slice(0, 3)
      : [],
  };
}
