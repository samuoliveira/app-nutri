import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../ThemeProvider';
import type { ScreenProps } from './types';

/** Fundo da marca + área segura. Nenhuma tela lê insets sozinha. */
export function Screen({ children, edges = 'top' }: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: theme.palette.background, paddingTop: edges === 'top' ? insets.top : 0 },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
