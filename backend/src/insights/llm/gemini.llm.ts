import { Injectable, Logger } from '@nestjs/common';

import type { AnonymousProfile } from './anonymous-profile';
import type { LlmClient, LlmResult } from './llm.client';
import { parseLlmJson, SYSTEM_PROMPT, userPrompt } from './prompt';
import { RuleBasedLlm } from './rule-based.llm';

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
/** Free tier responde em ~30s quando está congestionado; 15s abortava cedo demais. */
const TIMEOUT_MS = 45_000;
const RETRY_DELAY_MS = 1_500;

/**
 * Segunda implementação da porta LlmClient. Existe porque o free tier do
 * Google AI Studio permite exercitar a IA sem custo — e porque depender de um
 * único provedor é risco de produto, não detalhe de infraestrutura.
 */
@Injectable()
export class GeminiLlm implements LlmClient {
  private readonly logger = new Logger(GeminiLlm.name);

  constructor(
    private readonly fallback: RuleBasedLlm,
    private readonly apiKey: string,
    private readonly model: string,
  ) {}

  async generate(profile: AnonymousProfile): Promise<LlmResult> {
    try {
      return { ...parseLlmJson(await this.ask(profile)), source: 'llm' };
    } catch (cause) {
      this.logger.warn(`Gemini indisponível, usando fallback determinístico: ${String(cause)}`);
      return this.fallback.generate(profile);
    }
  }

  /** 5xx do provedor é congestionamento passageiro: vale uma segunda tentativa. */
  private async ask(profile: AnonymousProfile, attempt = 0): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(`${ENDPOINT}/${this.model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': this.apiKey },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt(profile) }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            maxOutputTokens: 800,
            thinkingConfig: { thinkingLevel: 'low' },
          },
        }),
      });

      if (response.status >= 500 && attempt === 0) {
        this.logger.warn(`Gemini respondeu ${response.status}; tentando de novo`);
        await delay(RETRY_DELAY_MS);
        return this.ask(profile, attempt + 1);
      }

      if (!response.ok) throw new Error(`Gemini respondeu ${response.status}`);

      return extractText(await response.json());
    } finally {
      clearTimeout(timeout);
    }
  }
}

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function extractText(payload: unknown): string {
  const parts = (payload as GeminiResponse).candidates?.[0]?.content?.parts ?? [];
  const text = parts.map((part) => part.text ?? '').join('');

  if (!text) throw new Error('Resposta do Gemini sem texto');
  return text;
}
