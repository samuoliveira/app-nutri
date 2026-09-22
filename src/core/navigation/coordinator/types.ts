export interface AppCoordinator {
  showPatients(): void;
  showPatientDetail(patientId: string): void;
  showBiomarkers(patientId: string): void;
  showInsight(patientId: string): void;
  back(): void;
}
