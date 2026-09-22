import type { ReactNode } from 'react';

export interface BiometricGateProps {
  children: ReactNode;
  /** Flag remota: desligada, o app abre sem pedir biometria. */
  enabled: boolean;
}
