import { DomainError } from '@/core/domain/domain-error';
import type { Measurement } from '@/core/domain/model';
import type { MeasurementRepository } from '@/core/domain/repository';
import { fail, ok, type Result } from '@/core/domain/result';
import type { PatientRemoteSource } from '../source/patient-remote-source';

export class MeasurementRepositoryImpl implements MeasurementRepository {
  constructor(private readonly remote: PatientRemoteSource) {}

  async history(patientId: string, sinceISO: string): Promise<Result<ReadonlyArray<Measurement>>> {
    try {
      const measurements = await this.remote.measurements(patientId);
      const since = Date.parse(sinceISO);
      return ok(measurements.filter((measurement) => Date.parse(measurement.takenAt) >= since));
    } catch (cause) {
      return fail(DomainError.from(cause));
    }
  }

  async latest(patientId: string): Promise<Result<ReadonlyArray<Measurement>>> {
    try {
      const measurements = await this.remote.measurements(patientId);
      const byKind = new Map<string, Measurement>();
      for (const measurement of measurements) {
        const current = byKind.get(measurement.kind);
        if (!current || Date.parse(measurement.takenAt) > Date.parse(current.takenAt)) {
          byKind.set(measurement.kind, measurement);
        }
      }
      return ok([...byKind.values()]);
    } catch (cause) {
      return fail(DomainError.from(cause));
    }
  }
}
