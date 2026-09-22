import type { BrandId } from '@/core/designsystem/brands';

export interface BrandState {
  brandId: BrandId;
  hydrated: boolean;
  setBrand: (brandId: BrandId) => void;
  hydrate: () => Promise<void>;
}
