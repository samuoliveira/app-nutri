import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useFlags } from '@/core/flags/use-flag';
import { TabBar } from '../TabBar';
import type { TabsProps } from '../Tabs/types';
import type { TabParamList } from '../param-list';

const Tab = createBottomTabNavigator<TabParamList>();

/** Barra desenhada em JS, usada no Android. */
export function JsTabs({ screens }: TabsProps) {
  const flags = useFlags();

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tab.Screen name="home" component={screens.home} />
      <Tab.Screen name="patients" component={screens.patients} />
      {flags.agenda_tab ? <Tab.Screen name="schedule" component={screens.schedule} /> : null}
      <Tab.Screen name="settings" component={screens.settings} />
    </Tab.Navigator>
  );
}
