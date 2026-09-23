export type IconName =
  | 'chevron-right'
  | 'chevron-left'
  | 'search'
  | 'home'
  | 'users'
  | 'calendar'
  | 'more'
  | 'pin'
  | 'sparkle'
  | 'close'
  | 'plus'
  | 'alert'
  | 'clock'
  | 'file'
  | 'lock'
  | 'cloud-off'
  | 'check';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}
