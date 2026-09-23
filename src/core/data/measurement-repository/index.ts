import { DomainError } from '@/core/domain/domain-error';
import type { Measurement } from '@/core/domain/model';
import type { MeasurementRepository } from '@/core/domain/repository';
import { fail, ok, type Result } from '@/core/domain/result';
import type { PatientLocalSource } from '../source/patient-local-source';
import type { PatientRemoteSource } from '../source/patient-remote-source';

/**
 * Servidor primeiro, banco local como rede de segurança. A ficha aberta uma
 * vez continua abrindo offline: sem isso, a carteira abria e a ficha quebrava.
 */
export class MeasurementRepositoryImpl implements MeasurementRepository {
  constructor(
    private readonly remote: PatientRemoteSource,
    private readonly local: PatientLocalSource,
  ) {}

  async history(patientId: string, sinceISO: string): Promise<Result<ReadonlyArray<Measurement>>> {
    const result = await this.load(patientId);
    if (!result.ok) return result;

    const since = Date.parse(sinceISO);
    return ok(result.value.filter((measurement) => Date.parse(measurement.takenAt) >= since));
  }

  async latest(patientId: string): Promise<Result<ReadonlyArray<Measurement>>> {
    const result = await this.load(patientId);
    if (!result.ok) return result;

    const byKind = new Map<string, Measurement>();
    for (const measurement of result.value) {
      const current = byKind.get(measurement.kind);
      if (!current || Date.parse(measurement.takenAt) > Date.parse(current.takenAt)) {
        byKind.set(measurement.kind, measurement);
      }
    }

    return ok([...byKind.values()]);
  }

  private async load(patientId: string): Promise<Result<ReadonlyArray<Measurement>>> {
    try {
      const measurements = await this.remote.measurements(patientId);
      /** Grava em segundo plano: a tela não espera o cache para renderizar. */
      void this.local.saveMeasurements(measurements);
      return ok(measurements);
    } catch (cause) {
      const cached = await this.readLocal(patientId);
      if (cached.length > 0) return ok(cached);
      return fail(DomainError.from(cause));
    }
  }

  private async readLocal(patientId: string): Promise<ReadonlyArray<Measurement>> {
    try {
      return await this.local.measurementsOf(patientId);
    } catch {
      return [];
    }
  }
}
