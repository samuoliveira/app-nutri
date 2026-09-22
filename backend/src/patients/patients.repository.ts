import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { Measurement } from './measurement.entity';
import { Patient } from './patient.entity';

/**
 * Camada de acesso a dados: só fala SQL/ORM. Nenhuma regra de negócio aqui —
 * quem decide é o service.
 */
@Injectable()
export class PatientsRepository {
  constructor(
    @InjectRepository(Patient) private readonly patients: Repository<Patient>,
    @InjectRepository(Measurement) private readonly measurements: Repository<Measurement>,
  ) {}

  findAll(search: string): Promise<Patient[]> {
    return this.patients.find({
      where: search ? { name: ILike(`%${search}%`) } : {},
      order: { pinned: 'DESC', name: 'ASC' },
    });
  }

  findById(id: string): Promise<Patient | null> {
    return this.patients.findOne({ where: { id } });
  }

  create(patient: Partial<Patient>): Promise<Patient> {
    return this.patients.save(this.patients.create(patient));
  }

  async setPinned(id: string, pinned: boolean): Promise<Patient | null> {
    await this.patients.update({ id }, { pinned });
    return this.findById(id);
  }

  measurementsOf(patientId: string): Promise<Measurement[]> {
    return this.measurements.find({ where: { patientId }, order: { takenAt: 'DESC' } });
  }

  async measurementsOfMany(patientIds: string[]): Promise<Map<string, Measurement[]>> {
    if (patientIds.length === 0) return new Map();

    const rows = await this.measurements
      .createQueryBuilder('measurement')
      .where('measurement.patient_id IN (:...patientIds)', { patientIds })
      .orderBy('measurement.taken_at', 'DESC')
      .getMany();

    return rows.reduce((map, row) => {
      const current = map.get(row.patientId) ?? [];
      current.push(row);
      return map.set(row.patientId, current);
    }, new Map<string, Measurement[]>());
  }
}
