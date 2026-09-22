import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { Appointment } from './appointment.entity';
import type { DayWindow } from './day-window';

@Injectable()
export class ScheduleRepository {
  constructor(@InjectRepository(Appointment) private readonly appointments: Repository<Appointment>) {}

  findInWindow(window: DayWindow): Promise<Appointment[]> {
    return this.appointments.find({
      where: { startsAt: Between(window.start, window.end) },
      order: { startsAt: 'ASC' },
    });
  }

  findById(id: string): Promise<Appointment | null> {
    return this.appointments.findOne({ where: { id } });
  }

  create(appointment: Partial<Appointment>): Promise<Appointment> {
    return this.appointments.save(this.appointments.create(appointment));
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.appointments.delete({ id });
    return (result.affected ?? 0) > 0;
  }

  countAt(startsAt: Date): Promise<number> {
    return this.appointments.countBy({ startsAt });
  }
}
