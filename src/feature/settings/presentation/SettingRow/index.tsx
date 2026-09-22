import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { useTheme } from '@/core/designsystem/ThemeProvider';
import { Text } from '@/core/designsystem/native';
import { spacing } from '@/core/designsystem/tokens';
import type { SettingRowProps } from './types';

export function SettingRow({ title, description, value, onToggle, onPress, trailingLabel }: SettingRowProps) {
  const theme = useTheme();

  const content = (
    <View style={styles.root}>
      <View style={styles.text}>
        <Text token="body" weight="500">
          {title}
        </Text>
        {description ? (
          <Text token="footnote" tone="muted">
            {description}
          </Text>
        ) : null}
      </View>

      {onToggle ? (
        <Switch
          accessibilityLabel={title}
          value={value ?? false}
          onValueChange={onToggle}
          trackColor={{ true: theme.palette.accent, false: theme.palette.border }}
        />
      ) : trailingLabel ? (
        <Text token="subhead" tone="muted">
          {trailingLabel}
        </Text>
      ) : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  text: { flex: 1, gap: 2 },
});
