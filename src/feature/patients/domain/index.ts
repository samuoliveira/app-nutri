/** Porta pública do DOMÍNIO da feature. */
export { classifyPatientStatus, NEW_PATIENT_MAX_AGE_DAYS, STALE_VISIT_DAYS } from './classify-patient-status';
export { matchesQuery, MIN_SEARCH_LENGTH, sortPatients } from './filter-patients';
export { ListPatients } from './list-patients';
export type { ListPatientsInput, ListPatientsOutput } from './list-patients/types';
export { TogglePin } from './toggle-pin';
