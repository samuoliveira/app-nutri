import { Controller, Get, HttpCode, HttpStatus, NotFoundException, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';

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

  @Patch(':id/approve')
  approve(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Insight> {
    return this.service.approve(patientId, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Param('patientId', ParseUUIDPipe) patientId: string): Promise<Insight> {
    return this.service.create(patientId);
  }
}
