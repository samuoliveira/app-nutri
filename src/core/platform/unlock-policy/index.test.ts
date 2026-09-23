import { NO_BIOMETRIC_WARNING, NO_CREDENTIAL_WARNING, runUnlock } from './index';
import type { AuthAttempt, DeviceAuth } from './types';

function auth(options: {
  hasHardware?: boolean;
  enrolled?: boolean;
  attempt?: AuthAttempt | (() => Promise<AuthAttempt>);
}): DeviceAuth & { authenticate: jest.Mock } {
  const attempt = options.attempt ?? { success: true };

  return {
    hasHardware: jest.fn().mockResolvedValue(options.hasHardware ?? true),
    isEnrolled: jest.fn().mockResolvedValue(options.enrolled ?? true),
    authenticate: jest.fn().mockImplementation(() => (typeof attempt === 'function' ? attempt() : Promise.resolve(attempt))),
  };
}

describe('runUnlock', () => {
  it('abre por biometria quando há digital cadastrada', async () => {
    const device = auth({ enrolled: true, attempt: { success: true } });

    await expect(runUnlock(device)).resolves.toEqual({ status: 'unlocked', reason: 'biometric', warning: null });
  });

  it('exige biometria de verdade: não aceita senha quando há digital cadastrada', async () => {
    const device = auth({ enrolled: true });

    await runUnlock(device);

    expect(device.authenticate).toHaveBeenCalledWith(expect.objectContaining({ disableDeviceFallback: true }));
  });

  it('mantém trancado quando a biometria é recusada', async () => {
    const device = auth({ enrolled: true, attempt: { success: false, error: 'authentication_failed' } });

    await expect(runUnlock(device)).resolves.toEqual({ status: 'locked', message: 'Não foi possível desbloquear' });
  });

  it('cai no código do aparelho quando não há biometria cadastrada', async () => {
    const device = auth({ enrolled: false, attempt: { success: true } });

    const outcome = await runUnlock(device);

    expect(outcome).toEqual({ status: 'unlocked', reason: 'device-credential', warning: NO_BIOMETRIC_WARNING });
    expect(device.authenticate).toHaveBeenCalledWith(expect.objectContaining({ disableDeviceFallback: false }));
  });

  it('abre com aviso quando o aparelho não tem bloqueio nenhum', async () => {
    for (const error of ['passcode_not_set', 'not_enrolled', 'not_available']) {
      const device = auth({ enrolled: false, attempt: { success: false, error } });

      await expect(runUnlock(device)).resolves.toEqual({
        status: 'unlocked',
        reason: 'no-credential',
        warning: NO_CREDENTIAL_WARNING,
      });
    }
  });

  it('não abre quando o aparelho tem bloqueio e o usuário cancela', async () => {
    const device = auth({ enrolled: false, attempt: { success: false, error: 'user_cancel' } });

    await expect(runUnlock(device)).resolves.toMatchObject({ status: 'locked' });
  });

  it('trata falha do módulo nativo sem derrubar a tela', async () => {
    const device = auth({});
    device.hasHardware = jest.fn().mockRejectedValue(new Error('módulo indisponível'));

    await expect(runUnlock(device)).resolves.toMatchObject({ status: 'locked' });
  });

  it('não consulta biometria quando o aparelho não tem sensor', async () => {
    const device = auth({ hasHardware: false, attempt: { success: true } });

    const outcome = await runUnlock(device);

    expect(outcome).toMatchObject({ reason: 'device-credential' });
  });
});
