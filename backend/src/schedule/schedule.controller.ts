import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';

import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { ListScheduleQuery } from './dto/list-schedule.query';
import { ScheduleService, type AppointmentView } from './schedule.service';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly service: ScheduleService) {}

  @Get('today')
  today(@Query() query: ListScheduleQuery): Promise<AppointmentView[]> {
    return this.service.today(query.date);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateAppointmentDto): Promise<AppointmentView> {
    return this.service.create(dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.service.remove(id);
  }
}
