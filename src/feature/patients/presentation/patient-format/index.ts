import type { Patient, PatientStatus } from '@/core/domain/model';

/** Formatação de texto da feature: fora do componente, testável sem render. */
export function patientSubtitle(patient: Patient): string {
  return `${patient.ageYears} anos · ${patient.weightKg.toFixed(1).replace('.', ',')} kg`;
}

export function statusLabel(status: PatientStatus): string {
  if (status === 'atencao') return 'Atenção';
  if (status === 'novo') return 'Novo';
  return 'Em dia';
}

export function countLabel(shown: number, total: number): string {
  if (shown === total) return `${total.toLocaleString('pt-BR')} pacientes`;
  return `${shown} de ${total.toLocaleString('pt-BR')} · exibindo amostra`;
}
