import type { DeviceAuth, UnlockOutcome } from './types';

export type { AuthAttempt, DeviceAuth, UnlockOutcome, UnlockReason } from './types';

export const NO_BIOMETRIC_WARNING =
  'Sem biometria cadastrada neste aparelho. Confirmamos pelo código de bloqueio.';

export const NO_CREDENTIAL_WARNING =
  'Este aparelho não tem bloqueio de tela. O app segue aberto, mas os dados dos pacientes ficam desprotegidos.';

/** iOS e Android reportam "aparelho sem bloqueio" com códigos diferentes. */
const NO_CREDENTIAL_ERRORS = ['passcode_not_set', 'not_enrolled', 'not_available'];

/**
 * Decide se a carteira abre. Três caminhos, nesta ordem:
 * biometria cadastrada → código do aparelho → aparelho sem bloqueio nenhum.
 *
 * O último caso libera com aviso: sem credencial cadastrada não existe como
 * provar identidade, e travar aqui deixaria o app permanentemente inacessível.
 */
export async function runUnlock(auth: DeviceAuth): Promise<UnlockOutcome> {
  try {
    const enrolled = (await auth.hasHardware()) && (await auth.isEnrolled());

    if (enrolled) {
      /** Com biometria cadastrada, exige biometria: senha do aparelho não vale. */
      const result = await auth.authenticate({
        promptMessage: 'Desbloquear dados dos pacientes',
        disableDeviceFallback: true,
      });

      return result.success
        ? { status: 'unlocked', reason: 'biometric', warning: null }
        : { status: 'locked', message: 'Não foi possível desbloquear' };
    }

    const fallback = await auth.authenticate({
      promptMessage: 'Desbloquear',
      disableDeviceFallback: false,
    });

    if (fallback.success) {
      return { status: 'unlocked', reason: 'device-credential', warning: NO_BIOMETRIC_WARNING };
    }

    if (fallback.error && NO_CREDENTIAL_ERRORS.includes(fallback.error)) {
      return { status: 'unlocked', reason: 'no-credential', warning: NO_CREDENTIAL_WARNING };
    }

    return { status: 'locked', message: 'Não foi possível desbloquear' };
  } catch {
    return { status: 'locked', message: 'Não foi possível desbloquear' };
  }
}
