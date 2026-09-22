import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FlagsModule } from '../flags/flags.module';
import { PatientsModule } from '../patients/patients.module';
import { Insight } from './insight.entity';
import { InsightsController } from './insights.controller';
import { InsightsRepository } from './insights.repository';
import { InsightsService } from './insights.service';
import { AnthropicLlm } from './llm/anthropic.llm';
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
      /** Sem chave configurada, a porta do LLM recebe o gerador por regras. */
      provide: LLM_CLIENT,
      inject: [RuleBasedLlm],
      useFactory: (fallback: RuleBasedLlm) => {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) return fallback;

        return new AnthropicLlm(fallback, apiKey, process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-5');
      },
    },
  ],
})
export class InsightsModule {}
