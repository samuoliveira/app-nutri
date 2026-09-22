import { ConflictException, NotFoundException } from '@nestjs/common';

import type { PatientsService } from '../patients/patients.service';
import type { Appointment } from './appointment.entity';
import { ScheduleService } from './schedule.service';
import type { ScheduleRepository } from './schedule.repository';

const PATIENT_ID = '9f1c2a44-0a3d-4f2b-9d0f-2b0a1c3d4e5f';

function appointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: 'a-1',
    patientId: PATIENT_ID,
    patient: { name: 'Maria Souza' },
    startsAt: new Date('2026-09-22T11:00:00.000Z'),
    durationMinutes: 40,
    kind: 'return',
    ...overrides,
  } as Appointment;
}

function build(overrides: { inWindow?: Appointment[]; conflicts?: number } = {}) {
  const repository = {
    findInWindow: jest.fn().mockResolvedValue(overrides.inWindow ?? [appointment()]),
    findById: jest.fn().mockResolvedValue(appointment()),
    create: jest.fn().mockImplementation((data) => Promise.resolve(appointment(data))),
    delete: jest.fn().mockResolvedValue(true),
    countAt: jest.fn().mockResolvedValue(overrides.conflicts ?? 0),
  } as unknown as ScheduleRepository;

  const patients = { byId: jest.fn().mockResolvedValue({ id: PATIENT_ID }) } as unknown as PatientsService;

  return { service: new ScheduleService(repository, patients), repository, patients };
}

describe('ScheduleService', () => {
  it('devolve a agenda do dia com o nome do paciente', async () => {
    const { service } = build();

    const [first] = await service.today('2026-09-22T09:00:00.000Z');

    expect(first).toMatchObject({ patientName: 'Maria Souza', kind: 'return', durationMinutes: 40 });
  });

  it('descarta consulta fora da janela do dia pedido', async () => {
    const { service } = build({
      inWindow: [appointment(), appointment({ id: 'a-2', startsAt: new Date('2026-09-23T09:00:00.000Z') })],
    });

    const items = await service.today('2026-09-22T09:00:00.000Z');

    expect(items.map((item) => item.id)).toEqual(['a-1']);
  });

  it('recusa marcação em horário já ocupado', async () => {
    const { service } = build({ conflicts: 1 });

    await expect(
      service.create({ patientId: PATIENT_ID, startsAt: '2026-09-22T11:00:00.000Z', kind: 'return', durationMinutes: 40 }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('valida o paciente antes de marcar', async () => {
    const { service, patients, repository } = build();
    (patients.byId as jest.Mock).mockRejectedValueOnce(new NotFoundException());

    await expect(
      service.create({ patientId: 'sumiu', startsAt: '2026-09-22T11:00:00.000Z', kind: 'first', durationMinutes: 40 }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('devolve 404 ao cancelar consulta inexistente', async () => {
    const { service, repository } = build();
    (repository.delete as jest.Mock).mockResolvedValueOnce(false);

    await expect(service.remove('a-9')).rejects.toBeInstanceOf(NotFoundException);
  });
});
