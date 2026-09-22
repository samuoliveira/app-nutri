import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';

import { CreatePatientDto } from './dto/create-patient.dto';
import { ListPatientsQuery } from './dto/list-patients.query';
import { SetPinnedDto } from './dto/set-pinned.dto';
import { PatientsService, type PatientPage, type PatientView } from './patients.service';
import type { Measurement } from './measurement.entity';

/** Controller só valida entrada e traduz para HTTP. Regra nenhuma aqui. */
@Controller('patients')
export class PatientsController {
  constructor(private readonly service: PatientsService) {}

  @Get()
  list(@Query() query: ListPatientsQuery): Promise<PatientPage> {
    return this.service.list(query);
  }

  @Get(':id')
  byId(@Param('id', ParseUUIDPipe) id: string): Promise<PatientView> {
    return this.service.byId(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreatePatientDto): Promise<PatientView> {
    return this.service.create(dto);
  }

  @Patch(':id/pin')
  setPinned(@Param('id', ParseUUIDPipe) id: string, @Body() dto: SetPinnedDto): Promise<PatientView> {
    return this.service.setPinned(id, dto.pinned);
  }

  @Get(':id/measurements')
  measurements(@Param('id', ParseUUIDPipe) id: string): Promise<Measurement[]> {
    return this.service.measurements(id);
  }
}
