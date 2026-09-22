import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { brandById, DEFAULT_BRAND_ID } from '../brands';
import type { Theme } from '../theme';
import { useBrandStore } from '@/core/state/brand-store';

const ThemeContext = createContext<Theme>(brandById(DEFAULT_BRAND_ID));

export function ThemeProvider({ children }: { children: ReactNode }) {
  const brandId = useBrandStore((state) => state.brandId);
  const theme = useMemo(() => brandById(brandId), [brandId]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

/** Única porta de cor, forma e fonte para qualquer tela. */
export function useTheme(): Theme {
  return useContext(ThemeContext);
}
