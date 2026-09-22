import type { Patient, PatientStatus } from '@/core/domain/model';

export interface PatientListRowProps {
  patient: Patient;
  status: PatientStatus;
  onPress: (patient: Patient) => void;
  onLongPress: (patient: Patient) => void;
}
