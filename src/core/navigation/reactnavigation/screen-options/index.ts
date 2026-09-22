import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import type { Theme } from '@/core/designsystem/theme';
import type { ScreenHeaderSpec } from '@/core/navigation/use-screen-header';

/**
 * Única tradução de header de domínio para opções da biblioteca.
 * A regressão visual do header é travada por screen-options.test.ts.
 */
export function screenHeaderOptions(spec: ScreenHeaderSpec, theme: Theme): NativeStackNavigationOptions {
  return {
    title: spec.title,
    headerLargeTitle: spec.largeTitle ?? false,
    headerBackVisible: spec.showBack ?? true,
    headerShadowVisible: false,
    headerTransparent: spec.transparent ?? false,
    headerTintColor: theme.palette.accent,
    headerStyle: { backgroundColor: spec.transparent ? 'transparent' : theme.palette.background },
    headerTitleStyle: {
      color: theme.palette.text,
      fontFamily: theme.typography.familySemibold,
      fontSize: 17,
    },
    headerLargeTitleStyle: {
      color: theme.palette.text,
      fontFamily: theme.typography.familySemibold,
      fontSize: 32,
    },
    contentStyle: { backgroundColor: theme.palette.background },
  };
}
