import type { Patient } from '@/core/domain/model';
import type { PatientQuery } from '@/core/domain/repository';

/** Busca só começa a filtrar com 2 caracteres: antes disso a lista inteira é a resposta. */
export const MIN_SEARCH_LENGTH = 2;

export function matchesQuery(patient: Patient, query: PatientQuery): boolean {
  if (query.status !== 'all' && query.status !== patient.status) return false;

  const search = query.search.trim().toLowerCase();
  if (search.length < MIN_SEARCH_LENGTH) return true;

  return patient.name.toLowerCase().includes(search);
}

/** Fixados sobem para o topo; o resto sai por nome. */
export function sortPatients(patients: ReadonlyArray<Patient>): ReadonlyArray<Patient> {
  return [...patients].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return a.name.localeCompare(b.name, 'pt-BR');
  });
}
