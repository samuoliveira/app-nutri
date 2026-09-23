import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Insight } from './insight.entity';

@Injectable()
export class InsightsRepository {
  constructor(@InjectRepository(Insight) private readonly insights: Repository<Insight>) {}

  latestFor(patientId: string): Promise<Insight | null> {
    return this.insights.findOne({ where: { patientId }, order: { createdAt: 'DESC' } });
  }

  findByFingerprint(patientId: string, fingerprint: string): Promise<Insight | null> {
    return this.insights.findOne({ where: { patientId, fingerprint }, order: { createdAt: 'DESC' } });
  }

  findById(id: string): Promise<Insight | null> {
    return this.insights.findOne({ where: { id } });
  }

  async approve(id: string, approvedAt: Date): Promise<Insight | null> {
    await this.insights.update({ id }, { status: 'approved', approvedAt });
    return this.findById(id);
  }

  save(insight: Partial<Insight>): Promise<Insight> {
    return this.insights.save(this.insights.create(insight));
  }
}
