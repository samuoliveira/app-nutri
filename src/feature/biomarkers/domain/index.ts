/**
 * Porta pública do DOMÍNIO da feature: regra pura, sem React e sem tela.
 * É por aqui que o domínio de outra feature entra.
 */
export {
  bmiScale,
  classify,
  classifyBloodPressure,
  DIASTOLIC_HIGH_FROM,
  glycemiaScale,
  isOutOfRange,
  systolicScale,
} from './clinical-bands';
export type { BandReading, BandScale } from './clinical-bands/types';
export { buildIndicators } from './build-indicators';
export type { Indicator } from './build-indicators/types';
export { computeBmi } from './compute-bmi';
export { isGlycemiaRising, measurementTrend, TREND_THRESHOLD_PERCENT } from './measurement-trend';
export type { Trend } from './measurement-trend/types';
