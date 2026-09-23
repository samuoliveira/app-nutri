import { DomainError } from '@/core/domain/domain-error';
import type { Measurement } from '@/core/domain/model';
import type { PatientLocalSource } from '../source/patient-local-source';
import type { PatientRemoteSource } from '../source/patient-remote-source';
import { MeasurementRepositoryImpl } from './index';

const PATIENT = 'p-1';

function measurement(overrides: Partial<Measurement> = {}): Measurement {
  return {
    id: 'm-1',
    patientId: PATIENT,
    kind: 'glicemia',
    takenAt: '2026-09-20T12:00:00.000Z',
    value: 95,
    secondaryValue: null,
    ...overrides,
  };
}

function build(options: { remote?: Measurement[] | Error; cached?: Measurement[] } = {}) {
  const remote = {
    measurements: jest.fn().mockImplementation(() =>
      options.remote instanceof Error ? Promise.reject(options.remote) : Promise.resolve(options.remote ?? []),
    ),
  } as unknown as PatientRemoteSource;

  const local = {
    saveMeasurements: jest.fn().mockResolvedValue(undefined),
    measurementsOf: jest.fn().mockResolvedValue(options.cached ?? []),
  } as unknown as PatientLocalSource;

  return { repository: new MeasurementRepositoryImpl(remote, local), remote, local };
}

describe('MeasurementRepositoryImpl', () => {
  it('guarda no aparelho o que veio do servidor', async () => {
    const fromServer = [measurement()];
    const { repository, local } = build({ remote: fromServer });

    await repository.latest(PATIENT);

    expect(local.saveMeasurements).toHaveBeenCalledWith(fromServer);
  });

  it('abre a ficha pelo cache quando o servidor falha', async () => {
    const { repository } = build({ remote: DomainError.offline(), cached: [measurement({ value: 88 })] });

    const result = await repository.latest(PATIENT);

    expect(result.ok).toBe(true);
    expect(result.ok && result.value[0]?.value).toBe(88);
  });

  it('falha quando não há servidor nem cache', async () => {
    const { repository } = build({ remote: DomainError.offline(), cached: [] });

    const result = await repository.history(PATIENT, '2026-01-01T00:00:00.000Z');

    expect(result.ok).toBe(false);
    expect(!result.ok && result.error.code).toBe('offline');
  });

  it('history corta o que é mais antigo que a janela pedida', async () => {
    const { repository } = build({
      remote: [
        measurement({ id: 'novo', takenAt: '2026-09-20T12:00:00.000Z' }),
        measurement({ id: 'velho', takenAt: '2025-01-01T12:00:00.000Z' }),
      ],
    });

    const result = await repository.history(PATIENT, '2026-06-01T00:00:00.000Z');

    expect(result.ok && result.value.map((item) => item.id)).toEqual(['novo']);
  });

  it('latest devolve a medição mais recente de cada tipo', async () => {
    const { repository } = build({
      remote: [
        measurement({ id: 'antiga', kind: 'peso', takenAt: '2026-08-01T12:00:00.000Z', value: 80 }),
        measurement({ id: 'recente', kind: 'peso', takenAt: '2026-09-20T12:00:00.000Z', value: 78 }),
        measurement({ id: 'glicemia', kind: 'glicemia', takenAt: '2026-09-19T12:00:00.000Z', value: 92 }),
      ],
    });

    const result = await repository.latest(PATIENT);

    expect(result.ok && result.value.map((item) => item.id).sort()).toEqual(['glicemia', 'recente']);
  });

  it('não derruba a leitura se o banco local falhar', async () => {
    const { repository, local } = build({ remote: DomainError.offline() });
    (local.measurementsOf as jest.Mock).mockRejectedValue(new Error('banco indisponível'));

    const result = await repository.latest(PATIENT);

    expect(result.ok).toBe(false);
  });
});
