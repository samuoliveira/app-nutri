import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { useTheme } from '../../ThemeProvider';
import { MIN_TOUCH_TARGET } from '../../tokens';
import { Text } from '../Text';
import type { ButtonProps } from './types';

export function Button({ label, onPress, variant = 'primary', loading, disabled, style }: ButtonProps) {
  const theme = useTheme();
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.root,
        {
          borderRadius: theme.shape.button,
          backgroundColor: isPrimary ? theme.palette.accent : theme.palette.surfaceMuted,
          opacity: disabled ? 0.5 : pressed ? 0.88 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? theme.palette.onAccent : theme.palette.text} />
      ) : (
        <Text token="body" weight="600" tone={isPrimary ? 'onAccent' : 'default'}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    height: 52,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
});
