import type { TextStyle } from 'react-native';

export interface ThemePalette {
  background: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  border: string;
  accent: string;
  accentSoft: string;
  onAccent: string;
  success: string;
  successSoft: string;
  danger: string;
  dangerSoft: string;
  warningSoft: string;
  info: string;
  chevron: string;
  scrim: string;
  chart: string;
  avatarTints: readonly string[];
}

export interface ThemeShape {
  card: number;
  control: number;
  pill: number;
  /** Botão primário: arredondado (Tecsa) ou pílula (Vitta). */
  button: number;
  glass: number;
}

export interface ThemeTypography {
  family: string;
  familyMedium: string;
  familySemibold: string;
  familyLight: string;
  /** Peso é propriedade da fonte carregada; o estilo só escolhe a família. */
  weightMap: Record<NonNullable<TextStyle['fontWeight']> & string, string>;
}

export interface Brand {
  id: string;
  /** Nome comercial exibido em texto de marca. Nenhuma tela escreve isso literal. */
  displayName: string;
  assistantName: string;
  palette: ThemePalette;
  shape: ThemeShape;
  typography: ThemeTypography;
  fontsToLoad: Record<string, number>;
}

export type Theme = Brand;
