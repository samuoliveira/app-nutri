import type { TextProps as RNTextProps } from 'react-native';

import type { TypeToken } from '../../tokens';

export type TextTone = 'default' | 'muted' | 'subtle' | 'success' | 'danger' | 'accent' | 'onAccent';

export type TextWeight = '300' | '400' | '500' | '600';

export interface TextProps extends RNTextProps {
  token?: TypeToken;
  tone?: TextTone;
  weight?: TextWeight;
  color?: string;
}
