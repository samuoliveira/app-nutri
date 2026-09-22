import { NativeTabs } from '../NativeTabs';
import type { TabsProps } from './types';

export type { TabScreens, TabsProps } from './types';

/** iOS: UITabBarController nativo. No 26+ o sistema aplica o Liquid Glass. */
export function Tabs({ screens }: TabsProps) {
  return <NativeTabs screens={screens} />;
}
