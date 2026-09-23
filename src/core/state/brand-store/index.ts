import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { brandIds, DEFAULT_BRAND_ID } from '@/core/designsystem/brands';
import type { BrandState } from './types';

const STORAGE_KEY = 'tecsa.brand.v1';

export type { BrandState } from './types';

/**
 * A marca é dado de sessão, não de build: o core não conhece marca nenhuma,
 * só o id que está selecionado aqui.
 */
export const useBrandStore = create<BrandState>((set) => ({
  brandId: DEFAULT_BRAND_ID,
  hydrated: false,
  setBrand: (brandId) => {
    set({ brandId });
    void AsyncStorage.setItem(STORAGE_KEY, brandId);
  },
  hydrate: async () => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const brandId = brandIds.find((id) => id === stored) ?? DEFAULT_BRAND_ID;
    set({ brandId, hydrated: true });
  },
}));
