import { View } from 'react-native';
import type { StatusDotProps } from './types';

export function StatusDot({ color, size = 7, halo }: StatusDotProps) {
  return (
    <View
      accessible={false}
      // style-ok: cor e tamanho do ponto são a própria informação, vêm por prop
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        ...(halo ? { shadowColor: halo, shadowOpacity: 1, shadowRadius: 0, shadowOffset: { width: 0, height: 0 } } : null),
      }}
    />
  );
}
