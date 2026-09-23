import { NotFoundException } from '@nestjs/common';

import type { ListPatientsQuery } from './dto/list-patients.query';
import type { Measurement } from './measurement.entity';
import type { Patient } from './patient.entity';
import { PatientsService } from './patients.service';
import type { PatientsRepository } from './patients.repository';

const NOW = new Date();
const daysAgo = (days: number): Date => new Date(NOW.getTime() - days * 86_400_000);

function patient(overrides: Partial<Patient> = {}): Patient {
  return {
    id: 'p-1',
    name: 'Maria Souza',
    ageYears: 54,
    sex: 'F',
    heightM: 1.6,
    weightKg: 82,
    pinned: false,
    createdAt: daysAgo(300),
    lastVisitAt: daysAgo(10),
    measurements: [],
    ...overrides,
  } as Patient;
}

function query(overrides: Partial<ListPatientsQuery> = {}): ListPatientsQuery {
  return { status: 'all', search: '', limit: 40, offset: 0, ...overrides } as ListPatientsQuery;
}

function build(patients: Patient[], measurements: Map<string, Measurement[]> = new Map()) {
  const repository = {
    findAll: jest.fn().mockResolvedValue(patients),
    findById: jest.fn().mockImplementation((id: string) => Promise.resolve(patients.find((p) => p.id === id) ?? null)),
    create: jest.fn().mockImplementation((data) => Promise.resolve(patient(data))),
    setPinned: jest.fn().mockImplementation((id: string, pinned: boolean) => {
      const found = patients.find((p) => p.id === id);
      return Promise.resolve(found ? { ...found, pinned } : null);
    }),
    measurementsOf: jest.fn().mockResolvedValue([]),
    measurementsOfMany: jest.fn().mockResolvedValue(measurements),
  } as unknown as PatientsRepository;

  return { service: new PatientsService(repository), repository };
}

describe('PatientsService', () => {
  it('calcula o IMC e o status de cada paciente na listagem', async () => {
    const { service } = build([patient()]);

    const page = await service.list(query());

    expect(page.items[0]).toMatchObject({ bmi: 32, status: 'em_dia' });
    expect(page.total).toBe(1);
  });

  it('filtra por status depois de classificar', async () => {
    const { service } = build([
      patient({ id: 'novo', createdAt: daysAgo(3) }),
      patient({ id: 'antigo', createdAt: daysAgo(300) }),
    ]);

    const page = await service.list(query({ status: 'novo' }));

    expect(page.items.map((item) => item.id)).toEqual(['novo']);
    expect(page.total).toBe(1);
  });

  it('pagina e aponta o próximo offset enquanto sobra página', async () => {
    const many = Array.from({ length: 5 }, (_, index) => patient({ id: `p-${index}` }));
    const { service } = build(many);

    const first = await service.list(query({ limit: 2 }));
    expect(first.items).toHaveLength(2);
    expect(first.nextOffset).toBe(2);

    const last = await service.list(query({ limit: 2, offset: 4 }));
    expect(last.nextOffset).toBeNull();
  });

  it('repassa a busca para o repositório', async () => {
    const { service, repository } = build([patient()]);

    await service.list(query({ search: 'maria' }));

    expect(repository.findAll).toHaveBeenCalledWith('maria');
  });

  it('devolve 404 para paciente inexistente', async () => {
    const { service } = build([]);

    await expect(service.byId('sumiu')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('converte lastVisitAt para ISO e aceita ausência de visita', async () => {
    const { service } = build([patient({ lastVisitAt: null })]);

    const view = await service.byId('p-1');

    expect(view.lastVisitAt).toBeNull();
    expect(view.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('fixa o paciente e devolve o estado novo', async () => {
    const { service } = build([patient()]);

    const view = await service.setPinned('p-1', true);

    expect(view.pinned).toBe(true);
  });

  it('devolve 404 ao fixar paciente inexistente', async () => {
    const { service } = build([]);

    await expect(service.setPinned('sumiu', true)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('cria paciente convertendo a data de visita', async () => {
    const { service, repository } = build([]);

    const view = await service.create({
      name: 'João Lima',
      ageYears: 30,
      sex: 'M',
      heightM: 1.8,
      weightKg: 81,
      lastVisitAt: '2026-09-01T12:00:00.000Z',
    });

    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ lastVisitAt: new Date('2026-09-01T12:00:00.000Z') }));
    expect(view.bmi).toBe(25);
  });
});
