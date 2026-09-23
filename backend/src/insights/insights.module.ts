import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FlagsModule } from '../flags/flags.module';
import { PatientsModule } from '../patients/patients.module';
import { Insight } from './insight.entity';
import { InsightsController } from './insights.controller';
import { InsightsRepository } from './insights.repository';
import { InsightsService } from './insights.service';
import { AnthropicLlm } from './llm/anthropic.llm';
import { GeminiLlm } from './llm/gemini.llm';
import { LLM_CLIENT } from './llm/llm.client';
import { RuleBasedLlm } from './llm/rule-based.llm';

@Module({
  imports: [TypeOrmModule.forFeature([Insight]), PatientsModule, FlagsModule],
  controllers: [InsightsController],
  providers: [
    InsightsService,
    InsightsRepository,
    RuleBasedLlm,
    {
      /**
       * Provedor escolhido no boot, na ordem: Anthropic, Gemini, regras.
       * Qualquer um deles cai no gerador determinístico se a chamada falhar,
       * então a API responde mesmo com o provedor fora do ar.
       */
      provide: LLM_CLIENT,
      inject: [RuleBasedLlm],
      useFactory: (fallback: RuleBasedLlm) => {
        const anthropicKey = process.env.ANTHROPIC_API_KEY;
        if (anthropicKey) {
          return new AnthropicLlm(fallback, anthropicKey, process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-5');
        }

        const geminiKey = process.env.GEMINI_API_KEY;
        if (geminiKey) {
          return new GeminiLlm(fallback, geminiKey, process.env.GEMINI_MODEL ?? 'gemini-3.6-flash');
        }

        return fallback;
      },
    },
  ],
})
export class InsightsModule {}
