import { Controller, Get, HttpCode, HttpStatus, NotFoundException, Param, ParseUUIDPipe, Post } from '@nestjs/common';

import type { Insight } from './insight.entity';
import { InsightsService } from './insights.service';

@Controller('patients/:patientId/insights')
export class InsightsController {
  constructor(private readonly service: InsightsService) {}

  @Get('latest')
  async latest(@Param('patientId', ParseUUIDPipe) patientId: string): Promise<Insight> {
    const insight = await this.service.latestFor(patientId);
    if (!insight) throw new NotFoundException('Nenhum insight gerado para este paciente');

    return insight;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Param('patientId', ParseUUIDPipe) patientId: string): Promise<Insight> {
    return this.service.create(patientId);
  }
}
