import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('feature_flag')
export class FeatureFlag {
  @PrimaryColumn()
  key!: string;

  @Column({ type: 'boolean', default: true })
  enabled!: boolean;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
