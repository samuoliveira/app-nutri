import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '../../ThemeProvider';
import { spacing } from '../../tokens';
import type { CardProps } from './types';

export function Card({ children, onPress, accessibilityLabel, style }: CardProps) {
  const theme = useTheme();
  const base: ViewStyle = {
    backgroundColor: theme.palette.surface,
    borderRadius: theme.shape.card,
    padding: spacing.md + 2,
    ...styles.shadow,
  };

  if (!onPress) return <View style={[base, style]}>{children}</View>;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [base, style, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  pressed: { opacity: 0.85 },
});
