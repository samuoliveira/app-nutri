import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../../ThemeProvider';
import { Text } from '../Text';

import type { SegmentedControlProps } from './types';

export function SegmentedControl<T extends string>({
  segments,
  selected,
  onSelect,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  const theme = useTheme();

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={[styles.root, { backgroundColor: theme.palette.surfaceMuted, borderRadius: theme.shape.control - 1 }]}
    >
      {segments.map((segment) => {
        const active = segment.value === selected;
        return (
          <Pressable
            key={segment.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => {
              void Haptics.selectionAsync();
              onSelect(segment.value);
            }}
            style={[
              styles.item,
              {
                borderRadius: theme.shape.control - 3,
                backgroundColor: active ? theme.palette.surface : 'transparent',
              },
              active && styles.activeShadow,
            ]}
          >
            <Text token="footnote" weight={active ? '600' : '500'} tone={active ? 'default' : 'muted'}>
              {segment.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', padding: 2 },
  item: { flex: 1, height: 32, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  activeShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
});
