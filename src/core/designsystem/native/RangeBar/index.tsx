import { StyleSheet, View } from 'react-native';

import type { Band } from '@/core/domain/model';
import { useTheme } from '../../ThemeProvider';
import { progressClamp } from '../progressClamp';
import { Text } from '../Text';
import type { RangeBarProps } from './types';

/**
 * Faixa de referência substitui o gráfico nas seções clínicas:
 * mostra onde o valor está (normal / atenção / alto) sem sugerir precisão que não existe.
 */
export function RangeBar({ value, bands, ticks, min, max, accessibilityLabel }: RangeBarProps) {
  const theme = useTheme();
  const bandColor: Record<Band['level'], string> = {
    baixo: theme.palette.surfaceMuted,
    normal: theme.palette.successSoft,
    atencao: theme.palette.warningSoft,
    alto: theme.palette.dangerSoft,
  };

  return (
    <View accessible accessibilityLabel={accessibilityLabel} style={styles.root}>
      <View style={[styles.track, { backgroundColor: theme.palette.surfaceMuted }]}>
        {bands.map((band) => (
          <View
            key={`${band.level}-${band.from}`}
            style={[
              styles.band,
              {
                left: `${progressClamp(band.from, min, max) * 100}%`,
                width: `${(progressClamp(band.to, min, max) - progressClamp(band.from, min, max)) * 100}%`,
                backgroundColor: bandColor[band.level],
              },
            ]}
          />
        ))}
      </View>
      <View
        style={[
          styles.thumb,
          { left: `${progressClamp(value, min, max) * 100}%`, backgroundColor: theme.palette.surface },
        ]}
      />
      <View style={styles.ticks}>
        {ticks.map((tick) => (
          <Text
            key={tick}
            token="caption"
            tone="subtle"
            weight="400"
            style={[styles.tick, { left: `${progressClamp(tick, min, max) * 100}%` }]}
          >
            {String(tick)}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { paddingTop: 5 },
  track: { height: 6, borderRadius: 6, overflow: 'hidden' },
  band: { position: 'absolute', top: 0, bottom: 0 },
  thumb: {
    position: 'absolute',
    top: 0,
    width: 16,
    height: 16,
    marginLeft: -8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  ticks: { height: 16, marginTop: 7 },
  tick: { position: 'absolute', transform: [{ translateX: -12 }], width: 24, textAlign: 'center' },
});
