import { NavigationContainer, type Theme as NavigationTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useTheme } from '@/core/designsystem/ThemeProvider';
import { BiomarkersScreen } from '@/feature/biomarkers';
import { HomeScreen } from '@/feature/home';
import { InsightSheet } from '@/feature/insight';
import { PatientDetailScreen } from '@/feature/patientdetail';
import { PatientsScreen } from '@/feature/patients';
import { ScheduleScreen } from '@/feature/schedule';
import { SettingsScreen } from '@/feature/settings';
import { screenHeaderOptions } from '../screen-options';
import { Tabs, type TabScreens } from '../Tabs';
import type { RootStackParamList } from '../param-list';

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Raiz de composição: é aqui que a tela de cada aba é escolhida. */
const TAB_SCREENS: TabScreens = {
  home: HomeScreen,
  patients: PatientsScreen,
  schedule: ScheduleScreen,
  settings: SettingsScreen,
};

function TabsRoute() {
  return <Tabs screens={TAB_SCREENS} />;
}

/** Pilha nativa por cima das abas: detalhe, histórico e o sheet do assistente. */
export function RootNavigator() {
  const theme = useTheme();

  const navigationTheme: NavigationTheme = {
    dark: false,
    colors: {
      primary: theme.palette.accent,
      background: theme.palette.background,
      card: theme.palette.surface,
      text: theme.palette.text,
      border: theme.palette.border,
      notification: theme.palette.danger,
    },
    fonts: {
      regular: { fontFamily: theme.typography.family, fontWeight: '400' },
      medium: { fontFamily: theme.typography.familyMedium, fontWeight: '500' },
      bold: { fontFamily: theme.typography.familySemibold, fontWeight: '600' },
      heavy: { fontFamily: theme.typography.familySemibold, fontWeight: '700' },
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator>
        <Stack.Screen name="tabs" component={TabsRoute} options={{ headerShown: false }} />
        <Stack.Screen
          name="patient-detail"
          options={{ headerShown: false }}
          getComponent={() => PatientDetailRoute}
        />
        <Stack.Screen
          name="biomarkers"
          options={screenHeaderOptions({ title: 'Biomarcadores', showBack: true }, theme)}
          getComponent={() => BiomarkersRoute}
        />
        <Stack.Screen
          name="insight"
          options={{ presentation: 'modal', ...screenHeaderOptions({ title: 'Assistente', showBack: true }, theme) }}
          getComponent={() => InsightRoute}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function PatientDetailRoute({ route }: { route: { params: RootStackParamList['patient-detail'] } }) {
  return <PatientDetailScreen patientId={route.params.patientId} />;
}

function BiomarkersRoute({ route }: { route: { params: RootStackParamList['biomarkers'] } }) {
  return <BiomarkersScreen patientId={route.params.patientId} />;
}

function InsightRoute({ route }: { route: { params: RootStackParamList['insight'] } }) {
  return <InsightSheet patientId={route.params.patientId} />;
}
