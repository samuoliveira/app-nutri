import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, type Theme as NavigationTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useTheme } from '@/core/designsystem/ThemeProvider';
import { useFlags } from '@/core/flags/use-flag';
import { BiomarkersScreen } from '@/feature/biomarkers';
import { HomeScreen } from '@/feature/home';
import { InsightSheet } from '@/feature/insight';
import { PatientDetailScreen } from '@/feature/patientdetail';
import { PatientsScreen } from '@/feature/patients';
import { ScheduleScreen } from '@/feature/schedule';
import { SettingsScreen } from '@/feature/settings';
import { screenHeaderOptions } from '../screen-options';
import { TabBar } from '../TabBar';
import type { RootStackParamList, TabParamList } from '../param-list';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function Tabs() {
  const flags = useFlags();

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tab.Screen name="home" component={HomeScreen} />
      <Tab.Screen name="patients" component={PatientsScreen} />
      {flags.agenda_tab ? <Tab.Screen name="schedule" component={ScheduleScreen} /> : null}
      <Tab.Screen name="settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
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
        <Stack.Screen name="tabs" component={Tabs} options={{ headerShown: false }} />
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
