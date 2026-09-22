import { useLayoutEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

import { screenHeaderOptions } from '@/core/navigation/reactnavigation/screen-options';
import { useTheme } from '@/core/designsystem/ThemeProvider';
import type { ScreenHeaderSpec } from './types';

export type { ScreenHeaderSpec } from './types';

/** A tela declara o header; nunca monta opções da biblioteca à mão. */
export function useScreenHeader(spec: ScreenHeaderSpec): void {
  const navigation = useNavigation();
  const theme = useTheme();

  useLayoutEffect(() => {
    navigation.setOptions(screenHeaderOptions(spec, theme));
  }, [navigation, spec, theme]);
}
