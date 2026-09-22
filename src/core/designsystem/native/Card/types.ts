import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';

export interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: ViewStyle;
}
