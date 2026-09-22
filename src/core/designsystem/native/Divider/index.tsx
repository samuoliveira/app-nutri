import { View } from 'react-native';

import { useTheme } from '../../ThemeProvider';
import type { DividerProps } from './types';

export function Divider({ inset = 0 }: DividerProps) {
  const theme = useTheme();
  // style-ok: cor da marca + inset por prop
  return <View style={{ height: 1, marginLeft: inset, backgroundColor: theme.palette.border }} />;
}
