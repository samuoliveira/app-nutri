import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('insight')
@Index(['patientId', 'createdAt'])
@Index(['fingerprint'])
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

  /** Rascunho vira aprovado só por ação do nutricionista. */
  @Column({ type: 'varchar', default: 'draft' })
  status!: 'draft' | 'approved';

  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approvedAt!: Date | null;

  /** Mesmo quadro clínico gera a mesma chave: evita repetir chamada e cobrança. */
  @Column({ type: 'varchar', default: '' })
  fingerprint!: string;

  /** O que foi enviado ao provedor, para o nutricionista auditar o rascunho. */
  @Column({ type: 'jsonb', default: () => "'[]'" })
  considered!: Array<{ label: string; detail: string }>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
