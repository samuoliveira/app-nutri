export interface Segment<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  segments: ReadonlyArray<Segment<T>>;
  selected: T;
  onSelect: (value: T) => void;
  accessibilityLabel: string;
}
