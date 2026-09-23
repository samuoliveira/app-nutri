import Anthropic from '@anthropic-ai/sdk';
import { Injectable, Logger } from '@nestjs/common';

import type { AnonymousProfile } from './anonymous-profile';
import type { LlmClient, LlmResult } from './llm.client';
import { parseLlmJson, SYSTEM_PROMPT, userPrompt } from './prompt';
import { RuleBasedLlm } from './rule-based.llm';

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
        messages: [{ role: 'user', content: userPrompt(profile) }],
      });

      const text = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map((block) => block.text)
        .join('');

      return { ...parseLlmJson(text), source: 'llm' };
    } catch (cause) {
      this.logger.warn(`LLM indisponível, usando fallback determinístico: ${String(cause)}`);
      return this.fallback.generate(profile);
    }
  }
}
