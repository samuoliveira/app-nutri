import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/core/designsystem/ThemeProvider';
import { Avatar, Icon, StatusDot, Text } from '@/core/designsystem/native';
import { spacing } from '@/core/designsystem/tokens';
import { patientSubtitle, statusLabel } from '../patient-format';
import type { PatientListRowProps } from './types';

/** Linha da carteira. memo porque a lista virtualizada rerenderiza muito. */
export const PatientListRow = memo(function PatientListRow({
  patient,
  status,
  onPress,
  onLongPress,
}: PatientListRowProps) {
  const theme = useTheme();
  const statusColor =
    status === 'atencao' ? theme.palette.danger : status === 'novo' ? theme.palette.info : theme.palette.success;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${patient.name}, ${statusLabel(status)}`}
      onPress={() => onPress(patient)}
      onLongPress={() => onLongPress(patient)}
      style={({ pressed }) => [styles.root, pressed && { backgroundColor: theme.palette.surfaceMuted }]}
    >
      <Avatar name={patient.name} />
      <View style={styles.middle}>
        <View style={styles.nameRow}>
          <Text token="body" weight="500" numberOfLines={1}>
            {patient.name}
          </Text>
          {patient.pinned ? <Icon name="pin" size={12} color={theme.palette.textMuted} strokeWidth={2} /> : null}
        </View>
        <Text token="footnote" tone="muted" numberOfLines={1}>
          {patientSubtitle(patient)}
        </Text>
      </View>
      <View style={styles.status}>
        <StatusDot color={statusColor} />
        <Text token="footnote" tone="muted">
          {statusLabel(status)}
        </Text>
      </View>
      <Icon name="chevron-right" size={16} color={theme.palette.chevron} strokeWidth={2} />
      <View style={[styles.separator, { backgroundColor: theme.palette.border }]} />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  root: {
    height: 66,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingLeft: spacing.screenX,
    paddingRight: 16,
  },
  middle: { flex: 1, gap: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  separator: { position: 'absolute', left: 78, right: 0, bottom: 0, height: 1 },
});
