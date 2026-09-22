import type { AppRoute } from '@/core/navigation/app-route';

/** Tradução do destino de domínio para a lista de parâmetros da biblioteca. */
export type RootStackParamList = {
  tabs: undefined;
  'patient-detail': { patientId: string };
  biomarkers: { patientId: string };
  insight: { patientId: string };
};

export type TabParamList = {
  home: undefined;
  patients: undefined;
  schedule: undefined;
  settings: undefined;
};

export function routeToNavigation(route: AppRoute):
  | { stack: keyof RootStackParamList; params?: object }
  | { tab: keyof TabParamList } {
  switch (route.name) {
    case 'home':
    case 'patients':
    case 'schedule':
    case 'settings':
      return { tab: route.name };
    case 'patient-detail':
      return { stack: 'patient-detail', params: { patientId: route.patientId } };
    case 'biomarkers':
      return { stack: 'biomarkers', params: { patientId: route.patientId } };
    case 'insight':
      return { stack: 'insight', params: { patientId: route.patientId } };
  }
}
