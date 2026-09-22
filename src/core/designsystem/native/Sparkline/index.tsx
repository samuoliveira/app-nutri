import Svg, { Circle, Line, Path } from 'react-native-svg';

import { useTheme } from '../../ThemeProvider';
import { sparklinePath } from '../sparklinePath';
import type { SparklineProps } from './types';

/** Única linha que sobrou no app: tendência de peso. Decorativa, não é leitura clínica. */
export function Sparkline({ values, width = 120, height = 48 }: SparklineProps) {
  const theme = useTheme();
  const geometry = sparklinePath(values, width, height);
  if (!geometry) return null;

  return (
    <Svg width={width} height={height} accessibilityElementsHidden importantForAccessibility="no">
      <Line x1={0} x2={width} y1={height - 0.5} y2={height - 0.5} stroke={theme.palette.border} strokeWidth={1} />
      <Path d={geometry.d} fill="none" stroke={theme.palette.chart} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <Circle cx={geometry.lastX} cy={geometry.lastY} r={4.5} fill={theme.palette.chart} stroke={theme.palette.background} strokeWidth={2.5} />
    </Svg>
  );
}
