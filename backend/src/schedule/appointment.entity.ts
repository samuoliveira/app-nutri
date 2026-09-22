import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Patient } from '../patients/patient.entity';

export type AppointmentKind = 'first' | 'return' | 'consultation';

@Entity('appointment')
@Index(['startsAt'])
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'patient_id' })
  patientId!: string;

  @ManyToOne(() => Patient, { onDelete: 'CASCADE', eager: true })
  patient!: Patient;

  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt!: Date;

  @Column({ name: 'duration_minutes', type: 'int', default: 40 })
  durationMinutes!: number;

  @Column({ type: 'varchar' })
  kind!: AppointmentKind;
}
