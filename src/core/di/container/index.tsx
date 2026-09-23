import { createContext, useContext, type ReactNode } from 'react';

import { FlagRepositoryImpl } from '@/core/data/flag-repository';
import { MeasurementRepositoryImpl } from '@/core/data/measurement-repository';
import { ScheduleRepositoryImpl } from '@/core/data/schedule-repository';
import { PatientLocalSource } from '@/core/data/source/patient-local-source';
import { PatientRemoteSource } from '@/core/data/source/patient-remote-source';
import type { Database } from '@/core/database/database';
import { InsightRepositoryImpl } from '@/feature/insight/data/insight-repository';
import { PatientRepositoryImpl } from '@/feature/patients/data/patient-repository';
import type { Container } from './types';

export type { Container } from './types';

/**
 * Monta tudo uma vez, na subida do app, e injeta por contexto.
 * Importa a implementação pelo caminho direto, não pela porta pública: o
 * barrel da feature carrega as telas, e tela depende deste container — o
 * atalho evitaria um require cycle.
 */
export function createContainer(database: Database): Container {
  const remote = new PatientRemoteSource();
  const local = new PatientLocalSource(database);

  return {
    database,
    patients: new PatientRepositoryImpl(remote, local),
    measurements: new MeasurementRepositoryImpl(remote, local),
    schedule: new ScheduleRepositoryImpl(remote),
    insights: new InsightRepositoryImpl(remote),
    flags: new FlagRepositoryImpl(remote),
  };
}

const ContainerContext = createContext<Container | null>(null);

export function ContainerProvider({ container, children }: { container: Container; children: ReactNode }) {
  return <ContainerContext.Provider value={container}>{children}</ContainerContext.Provider>;
}

export function useContainer(): Container {
  const container = useContext(ContainerContext);
  if (!container) throw new Error('useContainer chamado fora do ContainerProvider');
  return container;
}
