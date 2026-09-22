import type { AppRouteName, TabRouteName } from './types';

export type { AppRoute, AppRouteName, TabRouteName } from './types';

export const TAB_ROUTES: ReadonlyArray<TabRouteName> = ['home', 'patients', 'schedule', 'settings'];

export function isTabRoute(name: AppRouteName): name is TabRouteName {
  return (TAB_ROUTES as ReadonlyArray<string>).includes(name);
}
