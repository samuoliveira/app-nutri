import { api } from '@/core/network/api';
import { isRemoteApiEnabled } from '@/core/network/api-config';
import { catalogAppointments, catalogMeasurements, catalogPatients } from '@/core/network/fixtures/catalog';
import { readServerFlags } from '@/core/network/fixtures/flag-config';
import { request } from '@/core/network/transport';
import type { Appointment, Insight, Measurement, Patient } from '@/core/domain/model';

/**
 * Único lugar que fala com o "servidor". Nada acima daqui conhece o transporte.
 * Com EXPO_PUBLIC_API_URL configurada, vai no backend NestJS; sem ela, no
 * catálogo simulado — mesmo binário, mesma fronteira.
 */
export class PatientRemoteSource {
  async listAll(): Promise<ReadonlyArray<Patient>> {
    if (isRemoteApiEnabled()) return api.listPatients();
    return request('GET /patients', () => catalogPatients());
  }

  async byId(id: string): Promise<Patient | undefined> {
    if (isRemoteApiEnabled()) return api.patientById(id);
    return request('GET /patients/:id', () => catalogPatients().find((patient) => patient.id === id), { id });
  }

  async setPinned(id: string, pinned: boolean): Promise<void> {
    if (isRemoteApiEnabled()) {
      await api.setPinned(id, pinned);
      return;
    }

    await request('PATCH /patients/:id/pin', () => undefined, { id, pinned: String(pinned) });
  }

  async measurements(patientId: string): Promise<ReadonlyArray<Measurement>> {
    if (isRemoteApiEnabled()) return api.measurements(patientId);
    return request('GET /patients/:id/measurements', () => catalogMeasurements(patientId), { patientId });
  }

  async appointmentsToday(nowISO: string = new Date().toISOString()): Promise<ReadonlyArray<Appointment>> {
    if (isRemoteApiEnabled()) return api.appointmentsToday(nowISO);
    return request('GET /schedule/today', () => catalogAppointments());
  }

  async flags(): Promise<Record<string, boolean>> {
    if (isRemoteApiEnabled()) return api.flags();
    return request('GET /flags', () => readServerFlags());
  }

  async createInsight(patientId: string): Promise<Insight> {
    return api.createInsight(patientId);
  }

  async approveInsight(patientId: string, insightId: string): Promise<Insight> {
    return api.approveInsight(patientId, insightId);
  }
}
