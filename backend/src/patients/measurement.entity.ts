import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Patient } from './patient.entity';

export type MeasurementKind = 'weight' | 'glucose' | 'pressure';

@Entity('measurement')
@Index(['patientId', 'kind', 'takenAt'])
export class Measurement {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'patient_id' })
  patientId!: string;

  @ManyToOne(() => Patient, (patient) => patient.measurements, { onDelete: 'CASCADE' })
  patient!: Patient;

  @Column({ type: 'varchar' })
  kind!: MeasurementKind;

  @Column({ name: 'taken_at', type: 'timestamptz' })
  takenAt!: Date;

  @Column({ type: 'float' })
  value!: number;

  @Column({ name: 'secondary_value', type: 'float', nullable: true })
  secondaryValue!: number | null;
}
