import type { ReactNode } from 'react';

export interface ScreenProps {
  children: ReactNode;
  edges?: 'top' | 'none';
}
