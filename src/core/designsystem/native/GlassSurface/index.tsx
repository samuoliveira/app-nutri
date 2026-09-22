import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '../../ThemeProvider';
import type { GlassSurfaceProps } from './types';

/**
 * Superfície de vidro da barra de abas e do menu rápido.
 * iOS usa o blur do sistema; Android cai para superfície opaca com elevação,
 * que é o que o Material entrega de verdade.
 */
export function GlassSurface({ children, style }: GlassSurfaceProps) {
  const theme = useTheme();

  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={48} tint="light" style={[styles.base, style, styles.clip]}>
        <View style={[styles.tintIOS, { borderRadius: (style?.borderRadius as number) ?? theme.shape.glass }]} />
        {children}
      </BlurView>
    );
  }

  return (
    <View style={[styles.base, styles.androidSurface, { backgroundColor: theme.palette.surface }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  clip: { overflow: 'hidden' },
  tintIOS: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.55)' },
  androidSurface: { elevation: 6 },
});
