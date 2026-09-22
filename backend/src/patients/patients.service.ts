import { Injectable, NotFoundException } from '@nestjs/common';

import type { CreatePatientDto } from './dto/create-patient.dto';
import type { ListPatientsQuery } from './dto/list-patients.query';
import type { Measurement } from './measurement.entity';
import type { Patient } from './patient.entity';
import { PatientsRepository } from './patients.repository';
import { classifyPatientStatus, computeBmi, type PatientStatus } from './patient-status';

export interface PatientView {
  id: string;
  name: string;
  ageYears: number;
  sex: 'F' | 'M';
  heightM: number;
  weightKg: number;
  bmi: number | null;
  pinned: boolean;
  status: PatientStatus;
  createdAt: string;
  lastVisitAt: string | null;
}

export interface PatientPage {
  items: PatientView[];
  total: number;
  nextOffset: number | null;
}

/** Regras de negócio. Não conhece HTTP nem ORM. */
@Injectable()
export class PatientsService {
  constructor(private readonly repository: PatientsRepository) {}

  async list(query: ListPatientsQuery): Promise<PatientPage> {
    const patients = await this.repository.findAll(query.search);
    const byPatient = await this.repository.measurementsOfMany(patients.map((patient) => patient.id));

    const views = patients
      .map((patient) => this.toView(patient, byPatient.get(patient.id) ?? []))
      .filter((view) => query.status === 'all' || view.status === query.status);

    const items = views.slice(query.offset, query.offset + query.limit);
    const nextOffset = query.offset + items.length;

    return { items, total: views.length, nextOffset: nextOffset < views.length ? nextOffset : null };
  }

  async byId(id: string): Promise<PatientView> {
    const patient = await this.repository.findById(id);
    if (!patient) throw new NotFoundException(`Paciente ${id} não encontrado`);

    return this.toView(patient, await this.repository.measurementsOf(id));
  }

  async create(dto: CreatePatientDto): Promise<PatientView> {
    const patient = await this.repository.create({
      ...dto,
      lastVisitAt: dto.lastVisitAt ? new Date(dto.lastVisitAt) : null,
    });

    return this.toView(patient, []);
  }

  async setPinned(id: string, pinned: boolean): Promise<PatientView> {
    const patient = await this.repository.setPinned(id, pinned);
    if (!patient) throw new NotFoundException(`Paciente ${id} não encontrado`);

    return this.toView(patient, await this.repository.measurementsOf(id));
  }

  measurements(patientId: string): Promise<Measurement[]> {
    return this.repository.measurementsOf(patientId);
  }

  private toView(patient: Patient, measurements: Measurement[]): PatientView {
    return {
      id: patient.id,
      name: patient.name,
      ageYears: patient.ageYears,
      sex: patient.sex,
      heightM: patient.heightM,
      weightKg: patient.weightKg,
      bmi: computeBmi(patient.weightKg, patient.heightM),
      pinned: patient.pinned,
      status: classifyPatientStatus(patient, measurements),
      createdAt: new Date(patient.createdAt).toISOString(),
      lastVisitAt: patient.lastVisitAt ? new Date(patient.lastVisitAt).toISOString() : null,
    };
  }
}
