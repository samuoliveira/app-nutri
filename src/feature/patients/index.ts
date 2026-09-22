/** Porta pública da feature: domínio + telas. */
export * from './domain';
export { PatientRepositoryImpl } from './data/patient-repository';
export { countLabel, patientSubtitle, statusLabel } from './presentation/patient-format';
export { PatientsScreen } from './presentation/PatientsScreen';
export { PatientsViewModel } from './presentation/PatientsViewModel';
