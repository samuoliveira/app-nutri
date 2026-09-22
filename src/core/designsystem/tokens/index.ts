/**
 * Tokens: forma e ritmo do app, iguais em toda marca.
 * Cor e tipografia vêm da marca (brands/), nunca daqui.
 */
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 24,
  xxl: 32,
  screenX: 24,
} as const;

export const typeScale = {
  display: { fontSize: 52, lineHeight: 56, letterSpacing: -1.4, weight: '300' },
  number: { fontSize: 34, lineHeight: 40, letterSpacing: -0.8, weight: '300' },
  title1: { fontSize: 32, lineHeight: 38, letterSpacing: -0.6, weight: '600' },
  title3: { fontSize: 22, lineHeight: 28, letterSpacing: -0.3, weight: '500' },
  headline: { fontSize: 17, lineHeight: 22, letterSpacing: -0.2, weight: '600' },
  body: { fontSize: 16, lineHeight: 22, letterSpacing: -0.1, weight: '400' },
  subhead: { fontSize: 15, lineHeight: 20, letterSpacing: 0, weight: '400' },
  footnote: { fontSize: 13, lineHeight: 18, letterSpacing: 0, weight: '400' },
  caption: { fontSize: 12, lineHeight: 16, letterSpacing: 0.1, weight: '500' },
} as const;

export type TypeToken = keyof typeof typeScale;

/** Alvo mínimo de toque em ambas as plataformas. */
export const MIN_TOUCH_TARGET = 44;

export const durations = {
  fast: 180,
  base: 220,
  spring: 320,
} as const;
