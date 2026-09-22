import { DomainError } from '@/core/domain/domain-error';
import type { Appointment } from '@/core/domain/model';
import type { ScheduleRepository } from '@/core/domain/repository';
import { fail, ok, type Result } from '@/core/domain/result';
import type { PatientRemoteSource } from '../source/patient-remote-source';

export class ScheduleRepositoryImpl implements ScheduleRepository {
  constructor(private readonly remote: PatientRemoteSource) {}

  async today(nowISO: string): Promise<Result<ReadonlyArray<Appointment>>> {
    try {
      const appointments = await this.remote.appointmentsToday();
      const day = nowISO.slice(0, 10);
      return ok(appointments.filter((appointment) => appointment.startsAt.slice(0, 10) === day));
    } catch (cause) {
      return fail(DomainError.from(cause));
    }
  }
}
