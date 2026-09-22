import type { Patient } from '@/core/domain/model';
import type { PatientRepository } from '@/core/domain/repository';
import type { Result } from '@/core/domain/result';

/** Fixar é update otimista: a regra só diz o que fixar significa, quem desfaz é o ViewModel. */
export class TogglePin {
  constructor(private readonly patients: PatientRepository) {}

  execute(patient: Patient): Promise<Result<Patient>> {
    return this.patients.setPinned(patient.id, !patient.pinned);
  }
}
