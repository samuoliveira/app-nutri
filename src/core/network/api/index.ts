import type { Appointment, Insight, Measurement, MeasurementKind, Patient } from '@/core/domain/model';
import { httpRequest } from '../http-client';
import type { AppointmentDto, InsightDto, MeasurementDto, PatientDto, PatientPageDto } from './types';

export type { AppointmentDto, InsightDto, MeasurementDto, PatientDto, PatientPageDto } from './types';

const PAGE_SIZE = 100;
const MAX_PAGES = 30;
/** O provedor de LLM pode levar dezenas de segundos; o padrão de 8s abortaria. */
const INSIGHT_TIMEOUT_MS = 60_000;

/**
 * Camada de API tipada: fala HTTP de um lado e devolve modelo de domínio do
 * outro. Mudou o contrato do backend? O ajuste morre aqui.
 */
export const api = {
  async listPatients(): Promise<ReadonlyArray<Patient>> {
    const patients: Patient[] = [];
    let offset: number | null = 0;

    for (let page = 0; page < MAX_PAGES && offset !== null; page += 1) {
      const dto: PatientPageDto = await httpRequest<PatientPageDto>({
        method: 'GET',
        path: `/patients?limit=${PAGE_SIZE}&offset=${offset}`,
      });

      patients.push(...dto.items.map(toPatient));
      offset = dto.nextOffset;
    }

    return patients;
  },

  async patientById(id: string): Promise<Patient> {
    return toPatient(await httpRequest<PatientDto>({ method: 'GET', path: `/patients/${id}` }));
  },

  async setPinned(id: string, pinned: boolean): Promise<Patient> {
    return toPatient(
      await httpRequest<PatientDto>({ method: 'PATCH', path: `/patients/${id}/pin`, body: { pinned } }),
    );
  },

  async measurements(patientId: string): Promise<ReadonlyArray<Measurement>> {
    const dtos = await httpRequest<ReadonlyArray<MeasurementDto>>({
      method: 'GET',
      path: `/patients/${patientId}/measurements`,
    });

    return dtos.map(toMeasurement);
  },

  async appointmentsToday(dayIso: string): Promise<ReadonlyArray<Appointment>> {
    const dtos = await httpRequest<ReadonlyArray<AppointmentDto>>({
      method: 'GET',
      path: `/schedule/today?date=${encodeURIComponent(dayIso)}`,
    });

    return dtos.map(toAppointment);
  },

  async flags(): Promise<Record<string, boolean>> {
    return httpRequest<Record<string, boolean>>({ method: 'GET', path: '/flags' });
  },

  async setFlag(key: string, enabled: boolean): Promise<Record<string, boolean>> {
    return httpRequest<Record<string, boolean>>({ method: 'PUT', path: `/flags/${key}`, body: { enabled } });
  },

  async createInsight(patientId: string): Promise<Insight> {
    return toInsight(
      await httpRequest<InsightDto>({
        method: 'POST',
        path: `/patients/${patientId}/insights`,
        timeoutMs: INSIGHT_TIMEOUT_MS,
      }),
    );
  },

  async approveInsight(patientId: string, insightId: string): Promise<Insight> {
    return toInsight(
      await httpRequest<InsightDto>({
        method: 'PATCH',
        path: `/patients/${patientId}/insights/${insightId}/approve`,
      }),
    );
  },

  async latestInsight(patientId: string): Promise<Insight> {
    return toInsight(
      await httpRequest<InsightDto>({ method: 'GET', path: `/patients/${patientId}/insights/latest` }),
    );
  },
};

const KIND_BY_DTO: Record<MeasurementDto['kind'], MeasurementKind> = {
  weight: 'peso',
  glucose: 'glicemia',
  pressure: 'pressao',
};

function toPatient(dto: PatientDto): Patient {
  return {
    id: dto.id,
    name: dto.name,
    ageYears: dto.ageYears,
    sex: dto.sex,
    heightM: dto.heightM,
    weightKg: dto.weightKg,
    pinned: dto.pinned,
    createdAt: dto.createdAt,
    lastVisitAt: dto.lastVisitAt,
    status: dto.status,
  };
}

function toMeasurement(dto: MeasurementDto): Measurement {
  return {
    id: dto.id,
    patientId: dto.patientId,
    kind: KIND_BY_DTO[dto.kind],
    takenAt: dto.takenAt,
    value: dto.value,
    secondaryValue: dto.secondaryValue,
  };
}

const APPOINTMENT_KIND_BY_DTO: Record<AppointmentDto['kind'], Appointment['kind']> = {
  first: 'primeira',
  return: 'retorno',
  consultation: 'consulta',
};

function toAppointment(dto: AppointmentDto): Appointment {
  return {
    id: dto.id,
    patientId: dto.patientId,
    patientName: dto.patientName,
    startsAt: dto.startsAt,
    kind: APPOINTMENT_KIND_BY_DTO[dto.kind],
  };
}

function toInsight(dto: InsightDto): Insight {
  return {
    id: dto.id,
    patientId: dto.patientId,
    status: dto.status === 'approved' ? 'aprovado' : 'rascunho',
    headline: dto.summary,
    body: dto.recommendations.join('\n\n'),
    /** Auditoria é o que a IA recebeu, não o que ela respondeu. */
    consideredData: (dto.considered ?? []).map((item) => ({ label: item.label, detail: item.detail })),
    source: dto.source === 'llm' ? 'llm' : 'regras',
    createdAt: dto.createdAt,
  };
}
