import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FeatureFlag } from './feature-flag.entity';

export const FLAG_KEYS = ['ai_insights', 'agenda_tab', 'biometric_lock'] as const;
export type FlagKey = (typeof FLAG_KEYS)[number];

export const DEFAULT_FLAGS: Record<FlagKey, boolean> = {
  ai_insights: true,
  agenda_tab: true,
  biometric_lock: true,
};

/**
 * Fonte da verdade das flags remotas. O app faz polling de 1 min,
 * então desligar ai_insights aqui é o kill switch da IA.
 */
@Injectable()
export class FlagsService {
  constructor(@InjectRepository(FeatureFlag) private readonly flags: Repository<FeatureFlag>) {}

  async snapshot(): Promise<Record<FlagKey, boolean>> {
    const rows = await this.flags.find();
    const snapshot = { ...DEFAULT_FLAGS };

    for (const row of rows) {
      if (this.isKnown(row.key)) snapshot[row.key] = row.enabled;
    }

    return snapshot;
  }

  async isEnabled(key: FlagKey): Promise<boolean> {
    const snapshot = await this.snapshot();
    return snapshot[key];
  }

  async set(key: string, enabled: boolean): Promise<Record<FlagKey, boolean>> {
    if (!this.isKnown(key)) throw new NotFoundException(`Flag ${key} não existe`);

    await this.flags.save({ key, enabled });
    return this.snapshot();
  }

  private isKnown(key: string): key is FlagKey {
    return (FLAG_KEYS as ReadonlyArray<string>).includes(key);
  }
}
