/** Destinos do app em linguagem de domínio. A tela não conhece a biblioteca. */
export type AppRoute =
  | { name: 'home' }
  | { name: 'patients' }
  | { name: 'schedule' }
  | { name: 'settings' }
  | { name: 'patient-detail'; patientId: string }
  | { name: 'biomarkers'; patientId: string }
  | { name: 'insight'; patientId: string };

export type AppRouteName = AppRoute['name'];

export type TabRouteName = Extract<AppRouteName, 'home' | 'patients' | 'schedule' | 'settings'>;
