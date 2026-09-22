import type { IconName } from '@/core/designsystem/native';
import type { TabRouteName } from '@/core/navigation/app-route';

export interface TabDefinition {
  readonly route: TabRouteName;
  readonly label: string;
  readonly icon: IconName;
  /** Flag que pode esconder a aba em runtime. */
  readonly flag?: 'agenda_tab';
}
