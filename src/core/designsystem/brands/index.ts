import type { Brand } from '../theme';
import { tecsa } from './tecsa';
import { vitta } from './vitta';

export const brands = { tecsa, vitta } as const;

export type BrandId = keyof typeof brands;

export const brandIds = Object.keys(brands) as BrandId[];

export const DEFAULT_BRAND_ID: BrandId = 'tecsa';

export function brandById(id: BrandId): Brand {
  return brands[id];
}
