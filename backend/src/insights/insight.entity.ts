import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('insight')
@Index(['patientId', 'createdAt'])
export class Insight {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'patient_id' })
  patientId!: string;

  @Column({ type: 'text' })
  summary!: string;

  @Column({ type: 'text', array: true, default: '{}' })
  recommendations!: string[];

  @Column({ type: 'varchar' })
  source!: 'llm' | 'rules';

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
