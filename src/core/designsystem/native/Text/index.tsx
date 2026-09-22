import { Text as RNText, type TextStyle } from 'react-native';

import { useTheme } from '../../ThemeProvider';
import { typeScale } from '../../tokens';
import type { TextProps, TextTone, TextWeight } from './types';

export function Text({ token = 'body', tone = 'default', weight, color, style, ...rest }: TextProps) {
  const theme = useTheme();
  const scale = typeScale[token];
  const resolvedWeight: TextWeight = weight ?? (scale.weight as TextWeight);

  const toneColor: Record<TextTone, string> = {
    default: theme.palette.text,
    muted: theme.palette.textMuted,
    subtle: theme.palette.textSubtle,
    success: theme.palette.success,
    danger: theme.palette.danger,
    accent: theme.palette.accent,
    onAccent: theme.palette.onAccent,
  };

  const base: TextStyle = {
    fontSize: scale.fontSize,
    lineHeight: scale.lineHeight,
    letterSpacing: scale.letterSpacing,
    fontFamily: theme.typography.weightMap[resolvedWeight],
    color: color ?? toneColor[tone],
  };

  return <RNText {...rest} style={[base, style]} />;
}
