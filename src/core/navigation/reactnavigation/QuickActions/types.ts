import type { IconName } from '@/core/designsystem/native';

export interface QuickAction {
  readonly icon: IconName;
  readonly label: string;
  readonly run: () => void;
}
