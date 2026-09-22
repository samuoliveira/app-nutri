import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Measurement } from './measurement.entity';

export type Sex = 'F' | 'M';

@Entity('patient')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ name: 'age_years', type: 'int' })
  ageYears!: number;

  @Column({ type: 'varchar', length: 1 })
  sex!: Sex;

  @Column({ name: 'height_m', type: 'float' })
  heightM!: number;

  @Column({ name: 'weight_kg', type: 'float' })
  weightKg!: number;

  @Column({ type: 'boolean', default: false })
  pinned!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ name: 'last_visit_at', type: 'timestamptz', nullable: true })
  lastVisitAt!: Date | null;

  @OneToMany(() => Measurement, (measurement) => measurement.patient)
  measurements!: Measurement[];
}
