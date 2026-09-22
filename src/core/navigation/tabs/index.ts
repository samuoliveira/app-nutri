import type { TabDefinition } from './types';

export type { TabDefinition } from './types';

/** Nome e ícone de aba moram aqui; nenhuma tela escreve isso. */
export const tabs: ReadonlyArray<TabDefinition> = [
  { route: 'home', label: 'Início', icon: 'home' },
  { route: 'patients', label: 'Pacientes', icon: 'users' },
  { route: 'schedule', label: 'Agenda', icon: 'calendar', flag: 'agenda_tab' },
  { route: 'settings', label: 'Mais', icon: 'more' },
];
