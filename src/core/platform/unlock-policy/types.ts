export interface AuthAttempt {
  readonly success: boolean;
  readonly error?: string;
}

/** Porta do autenticador do aparelho: o policy não conhece expo-local-authentication. */
export interface DeviceAuth {
  hasHardware(): Promise<boolean>;
  isEnrolled(): Promise<boolean>;
  authenticate(options: { promptMessage: string; disableDeviceFallback: boolean }): Promise<AuthAttempt>;
}

export type UnlockReason = 'biometric' | 'device-credential' | 'no-credential';

export type UnlockOutcome =
  | { readonly status: 'unlocked'; readonly reason: UnlockReason; readonly warning: string | null }
  | { readonly status: 'locked'; readonly message: string };
