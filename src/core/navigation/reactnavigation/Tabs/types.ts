import type { ComponentType } from 'react';

import type { TabParamList } from '../param-list';

/** Tela de cada aba. Quem conhece as features é o RootNavigator, que injeta isto. */
export type TabScreens = Record<keyof TabParamList, ComponentType>;

export interface TabsProps {
  readonly screens: TabScreens;
}
