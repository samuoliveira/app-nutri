import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

import { useTheme } from '../../ThemeProvider';

import type { IconProps } from './types';

export function Icon({ name, size = 20, color, strokeWidth = 1.8 }: IconProps) {
  const theme = useTheme();
  const stroke = color ?? theme.palette.text;
  const common = { stroke, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' as const };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no">
      {name === 'chevron-right' && <Polyline points="9 18 15 12 9 6" {...common} />}
      {name === 'chevron-left' && <Polyline points="15 18 9 12 15 6" {...common} />}
      {name === 'search' && (
        <>
          <Circle cx="11" cy="11" r="7" {...common} />
          <Line x1="21" y1="21" x2="16.5" y2="16.5" {...common} />
        </>
      )}
      {name === 'home' && <Path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" {...common} />}
      {name === 'users' && (
        <>
          <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" {...common} />
          <Circle cx="9" cy="7" r="4" {...common} />
          <Path d="M23 21v-2a4 4 0 0 0-3-3.9" {...common} />
          <Path d="M16 3.1a4 4 0 0 1 0 7.8" {...common} />
        </>
      )}
      {name === 'calendar' && (
        <>
          <Rect x="3" y="4" width="18" height="18" rx="3" {...common} />
          <Line x1="16" y1="2" x2="16" y2="6" {...common} />
          <Line x1="8" y1="2" x2="8" y2="6" {...common} />
          <Line x1="3" y1="10" x2="21" y2="10" {...common} />
        </>
      )}
      {name === 'more' && (
        <>
          <Circle cx="5" cy="12" r="1.3" fill={stroke} stroke={stroke} />
          <Circle cx="12" cy="12" r="1.3" fill={stroke} stroke={stroke} />
          <Circle cx="19" cy="12" r="1.3" fill={stroke} stroke={stroke} />
        </>
      )}
      {name === 'pin' && <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" {...common} />}
      {name === 'sparkle' && <Path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" {...common} />}
      {name === 'check' && <Path d="M5 12.5l4.5 4.5L19 7.5" {...common} />}
      {name === 'close' && (
        <>
          <Line x1="17" y1="7" x2="7" y2="17" {...common} />
          <Line x1="7" y1="7" x2="17" y2="17" {...common} />
        </>
      )}
      {name === 'plus' && (
        <>
          <Line x1="12" y1="5" x2="12" y2="19" {...common} />
          <Line x1="5" y1="12" x2="19" y2="12" {...common} />
        </>
      )}
      {name === 'alert' && (
        <>
          <Circle cx="12" cy="12" r="9" {...common} />
          <Line x1="12" y1="8" x2="12" y2="12.5" {...common} />
          <Line x1="12" y1="16" x2="12" y2="16.01" {...common} />
        </>
      )}
      {name === 'clock' && (
        <>
          <Circle cx="12" cy="12" r="9" {...common} />
          <Polyline points="12 7 12 12 15.5 14" {...common} />
        </>
      )}
      {name === 'file' && (
        <>
          <Path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" {...common} />
          <Polyline points="14 3 14 9 20 9" {...common} />
        </>
      )}
      {name === 'lock' && (
        <>
          <Rect x="4" y="10" width="16" height="11" rx="3" {...common} />
          <Path d="M8 10V7a4 4 0 0 1 8 0v3" {...common} />
        </>
      )}
      {name === 'cloud-off' && (
        <>
          <Path d="M18 17H7a4 4 0 0 1-.5-7.97" {...common} />
          <Path d="M9 6.2A5 5 0 0 1 18.5 9.5" {...common} />
          <Line x1="3" y1="3" x2="21" y2="21" {...common} />
        </>
      )}
    </Svg>
  );
}
