export interface SettingRowProps {
  title: string;
  description?: string;
  value?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
  trailingLabel?: string;
}
