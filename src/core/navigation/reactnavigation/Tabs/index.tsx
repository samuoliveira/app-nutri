import { JsTabs } from '../JsTabs';
import type { TabsProps } from './types';

export type { TabScreens, TabsProps } from './types';

/** Android: barra desenhada em JS. O iOS resolve em index.ios.tsx. */
export function Tabs({ screens }: TabsProps) {
  return <JsTabs screens={screens} />;
}
