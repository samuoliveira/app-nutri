import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo } from 'react';

import type { RootStackParamList } from '@/core/navigation/reactnavigation/param-list';
import type { AppCoordinator } from './types';

export type { AppCoordinator } from './types';

/**
 * A tela pede destino ao coordinator; quem conhece @react-navigation
 * é só esta pasta. Trocar de biblioteca não toca em feature nenhuma.
 */
export function useCoordinator(): AppCoordinator {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return useMemo<AppCoordinator>(
    () => ({
      showPatients: () => navigation.navigate('tabs', { screen: 'patients' }),
      showPatientDetail: (patientId) => navigation.navigate('patient-detail', { patientId }),
      showBiomarkers: (patientId) => navigation.navigate('biomarkers', { patientId }),
      showInsight: (patientId) => navigation.navigate('insight', { patientId }),
      back: () => navigation.goBack(),
    }),
    [navigation],
  );
}
