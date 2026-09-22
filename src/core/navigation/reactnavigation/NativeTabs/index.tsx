import {
  createNativeBottomTabNavigator,
  type NativeBottomTabIcon,
  type NativeBottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs/unstable';

import { useTheme } from '@/core/designsystem/ThemeProvider';
import type { IconName } from '@/core/designsystem/native';
import { useFlags } from '@/core/flags/use-flag';
import { tabs } from '@/core/navigation/tabs';
import type { TabsProps } from '../Tabs/types';
import type { TabParamList } from '../param-list';

type SfSymbolName = Extract<NativeBottomTabIcon, { type: 'sfSymbol' }>['name'];

const Tab = createNativeBottomTabNavigator<TabParamList>();

/** Ícone do design system → SF Symbol. A tradução fica aqui, junto da biblioteca. */
const SF_SYMBOLS: Partial<Record<IconName, { idle: SfSymbolName; focused: SfSymbolName }>> = {
  home: { idle: 'house', focused: 'house.fill' },
  users: { idle: 'person.2', focused: 'person.2.fill' },
  calendar: { idle: 'calendar', focused: 'calendar' },
  more: { idle: 'ellipsis', focused: 'ellipsis' },
};

/**
 * UITabBarController de verdade: no iOS 26 o sistema entrega o Liquid Glass,
 * a pílula que desliza entre abas e a barra que encolhe ao rolar.
 */
export function NativeTabs({ screens }: TabsProps) {
  const theme = useTheme();
  const flags = useFlags();

  const screenOptions = ({ route }: { route: { name: string } }): NativeBottomTabNavigationOptions => {
    const definition = tabs.find((tab) => tab.route === route.name);
    const symbol = definition ? SF_SYMBOLS[definition.icon] : undefined;

    return {
      headerShown: false,
      title: definition?.label ?? route.name,
      tabBarIcon: symbol
        ? ({ focused }) => ({ type: 'sfSymbol', name: focused ? symbol.focused : symbol.idle })
        : undefined,
      tabBarActiveTintColor: theme.palette.accent,
      tabBarLabelStyle: { fontFamily: theme.typography.familyMedium },
      // Encolher a barra muda a altura da tela no meio da rolagem, e a FlashList abre um vão acima da lista.
      tabBarMinimizeBehavior: 'none',
      // <Screen> já aplica a área segura e as listas já reservam o fundo; o ajuste automático somaria de novo.
      overrideScrollViewContentInsetAdjustmentBehavior: false,
    };
  };

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="home" component={screens.home} />
      <Tab.Screen name="patients" component={screens.patients} />
      {flags.agenda_tab ? <Tab.Screen name="schedule" component={screens.schedule} /> : null}
      <Tab.Screen name="settings" component={screens.settings} />
    </Tab.Navigator>
  );
}
