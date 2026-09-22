import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../ThemeProvider';
import { Text } from '../Text';
import { avatarInitials } from '../avatarInitials';
import type { AvatarProps } from './types';

export function Avatar({ name, size = 40 }: AvatarProps) {
  const theme = useTheme();
  const tints = theme.palette.avatarTints;
  const tint = tints[avatarTintIndex(name, tints.length)] ?? theme.palette.surfaceMuted;

  return (
    <View
      // style-ok: tamanho e tint vêm por prop e por marca, não cabem em StyleSheet estático
      style={[styles.root, { width: size, height: size, borderRadius: size / 2, backgroundColor: tint }]}
    >
      <Text
        token="footnote"
        tone="muted"
        weight="500"
        // style-ok: a inicial acompanha o diâmetro pedido pela tela
        style={{ fontSize: size <= 32 ? 11 : 14 }}
      >
        {avatarInitials(name)}
      </Text>
    </View>
  );
}

function avatarTintIndex(name: string, length: number): number {
  let sum = 0;
  for (let i = 0; i < name.length; i += 1) sum += name.charCodeAt(i);
  return sum % length;
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
});
