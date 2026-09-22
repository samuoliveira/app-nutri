import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { PatientsService } from '../patients/patients.service';
import type { Appointment, AppointmentKind } from './appointment.entity';
import { dayWindow, isWithin } from './day-window';
import type { CreateAppointmentDto } from './dto/create-appointment.dto';
import { ScheduleRepository } from './schedule.repository';

export interface AppointmentView {
  id: string;
  patientId: string;
  patientName: string;
  startsAt: string;
  durationMinutes: number;
  kind: AppointmentKind;
}

/** Regras da agenda: janela do dia, ordenação e conflito de horário. */
@Injectable()
export class ScheduleService {
  constructor(
    private readonly repository: ScheduleRepository,
    private readonly patients: PatientsService,
  ) {}

  async today(dayIso?: string): Promise<AppointmentView[]> {
    const window = dayWindow(dayIso ?? new Date().toISOString());
    const appointments = await this.repository.findInWindow(window);

    return appointments
      .filter((appointment) => isWithin(window, new Date(appointment.startsAt)))
      .map((appointment) => this.toView(appointment));
  }

  async create(dto: CreateAppointmentDto): Promise<AppointmentView> {
    /** Falha cedo se o paciente não existe: 404 em vez de FK quebrada. */
    await this.patients.byId(dto.patientId);

    const startsAt = new Date(dto.startsAt);
    if ((await this.repository.countAt(startsAt)) > 0) {
      throw new ConflictException('Já existe consulta marcada nesse horário');
    }

    const appointment = await this.repository.create({
      patientId: dto.patientId,
      startsAt,
      kind: dto.kind,
      durationMinutes: dto.durationMinutes,
    });

    const saved = await this.repository.findById(appointment.id);
    return this.toView(saved ?? appointment);
  }

  async remove(id: string): Promise<void> {
    const removed = await this.repository.delete(id);
    if (!removed) throw new NotFoundException(`Consulta ${id} não encontrada`);
  }

  private toView(appointment: Appointment): AppointmentView {
    return {
      id: appointment.id,
      patientId: appointment.patientId,
      patientName: appointment.patient?.name ?? '',
      startsAt: new Date(appointment.startsAt).toISOString(),
      durationMinutes: appointment.durationMinutes,
      kind: appointment.kind,
    };
  }
}
