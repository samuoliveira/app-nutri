import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/core/designsystem/ThemeProvider';
import { GlassSurface, Icon, Text } from '@/core/designsystem/native';
import { tabs } from '@/core/navigation/tabs';
import { QuickActions } from '../QuickActions';
import type { TabBarProps } from './types';

/** Barra flutuante de vidro + botão de ações rápidas, como no desenho. */
export function TabBar({ state, navigation }: TabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { bottom: Math.max(insets.bottom, 16) + 10 }]} pointerEvents="box-none">
      {/* style-ok: raio vem da forma da marca */}
      <GlassSurface style={{ ...styles.bar, borderRadius: theme.shape.glass }}>
        {state.routes.map((route, index) => {
          const definition = tabs.find((tab) => tab.route === route.name);
          if (!definition) return null;
          const focused = state.index === index;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={definition.label}
              onPress={() => {
                void Haptics.selectionAsync();
                if (!focused) navigation.navigate(route.name);
              }}
              style={[
                styles.tab,
                { borderRadius: theme.shape.glass - 6 },
                focused && { backgroundColor: theme.palette.accentSoft },
              ]}
            >
              <Icon
                name={definition.icon}
                size={21}
                color={focused ? theme.palette.accent : theme.palette.textMuted}
                strokeWidth={focused ? 2 : 1.7}
              />
              <Text
                token="caption"
                weight={focused ? '600' : '500'}
                color={focused ? theme.palette.accent : theme.palette.textMuted}
                style={styles.label}
              >
                {definition.label}
              </Text>
            </Pressable>
          );
        })}
      </GlassSurface>
      <QuickActions />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  bar: { flex: 1, height: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, gap: 2 },
  tab: { flex: 1, height: 52, alignItems: 'center', justifyContent: 'center', gap: 2 },
  label: { fontSize: 10, lineHeight: 12 },
});
