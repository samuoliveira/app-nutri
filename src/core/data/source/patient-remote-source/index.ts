import { catalogAppointments, catalogMeasurements, catalogPatients } from '@/core/network/fixtures/catalog';
import { readServerFlags } from '@/core/network/fixtures/flag-config';
import { request } from '@/core/network/transport';
import type { Appointment, Measurement, Patient } from '@/core/domain/model';

/** Único lugar que fala com o "servidor". Nada acima daqui conhece o transporte. */
export class PatientRemoteSource {
  async listAll(): Promise<ReadonlyArray<Patient>> {
    return request('GET /patients', () => catalogPatients());
  }

  async byId(id: string): Promise<Patient | undefined> {
    return request('GET /patients/:id', () => catalogPatients().find((patient) => patient.id === id), { id });
  }

  async setPinned(id: string, pinned: boolean): Promise<void> {
    await request('PATCH /patients/:id/pin', () => undefined, { id, pinned: String(pinned) });
  }

  async measurements(patientId: string): Promise<ReadonlyArray<Measurement>> {
    return request('GET /patients/:id/measurements', () => catalogMeasurements(patientId), { patientId });
  }

  async appointmentsToday(): Promise<ReadonlyArray<Appointment>> {
    return request('GET /schedule/today', () => catalogAppointments());
  }

  async flags(): Promise<Record<string, boolean>> {
    return request('GET /flags', () => readServerFlags());
  }
}
