import { DomainError } from '@/core/domain/domain-error';
import { setApiConfig } from '@/core/network/api-config';
import { api } from './index';

const originalFetch = global.fetch;

function mockFetch(status: number, payload: unknown): jest.Mock {
  const mock = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(payload),
  });

  global.fetch = mock as unknown as typeof fetch;
  return mock;
}

describe('camada de API', () => {
  beforeEach(() => setApiConfig({ baseUrl: 'http://localhost:9000/api', timeoutMs: 1000 }));
  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('traduz o DTO do backend para o modelo de domínio', async () => {
    mockFetch(200, {
      items: [
        {
          id: 'uuid-1',
          name: 'Maria Souza',
          ageYears: 54,
          sex: 'F',
          heightM: 1.6,
          weightKg: 82,
          bmi: 32,
          pinned: true,
          status: 'atencao',
          createdAt: '2026-01-10T12:00:00.000Z',
          lastVisitAt: null,
        },
      ],
      total: 1,
      nextOffset: null,
    });

    const [patient] = await api.listPatients();

    expect(patient).toEqual({
      id: 'uuid-1',
      name: 'Maria Souza',
      ageYears: 54,
      sex: 'F',
      heightM: 1.6,
      weightKg: 82,
      pinned: true,
      createdAt: '2026-01-10T12:00:00.000Z',
      lastVisitAt: null,
    });
  });

  it('traduz o vocabulário de medição do backend', async () => {
    mockFetch(200, [
      { id: 'm-1', patientId: 'uuid-1', kind: 'glucose', takenAt: '2026-09-10T12:00:00.000Z', value: 140, secondaryValue: null },
      { id: 'm-2', patientId: 'uuid-1', kind: 'pressure', takenAt: '2026-09-10T12:00:00.000Z', value: 146, secondaryValue: 92 },
    ]);

    const measurements = await api.measurements('uuid-1');

    expect(measurements.map((measurement) => measurement.kind)).toEqual(['glicemia', 'pressao']);
  });

  it('transforma 503 do kill switch em feature-disabled', async () => {
    mockFetch(503, {});

    await expect(api.createInsight('uuid-1')).rejects.toMatchObject({ code: 'feature-disabled' });
  });

  it('transforma 404 em not-found', async () => {
    mockFetch(404, {});

    await expect(api.patientById('sumiu')).rejects.toMatchObject({ code: 'not-found' });
  });

  it('transforma falha de rede em offline', async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('Network request failed')) as unknown as typeof fetch;

    const error = await api.flags().catch((cause: unknown) => cause);

    expect(error).toBeInstanceOf(DomainError);
    expect((error as DomainError).code).toBe('offline');
  });
});

describe('agenda', () => {
  beforeEach(() => setApiConfig({ baseUrl: 'http://localhost:9000/api', timeoutMs: 1000 }));

  it('traduz o tipo de consulta do backend', async () => {
    const fetchMock = mockFetch(200, [
      {
        id: 'a-1',
        patientId: 'uuid-1',
        patientName: 'Maria Souza',
        startsAt: '2026-09-22T11:00:00.000Z',
        durationMinutes: 40,
        kind: 'return',
      },
      {
        id: 'a-2',
        patientId: 'uuid-2',
        patientName: 'João Lima',
        startsAt: '2026-09-22T12:00:00.000Z',
        durationMinutes: 40,
        kind: 'first',
      },
    ]);

    const appointments = await api.appointmentsToday('2026-09-22T09:00:00.000Z');

    expect(appointments.map((appointment) => appointment.kind)).toEqual(['retorno', 'primeira']);
    expect(appointments[0]).toMatchObject({ patientName: 'Maria Souza', startsAt: '2026-09-22T11:00:00.000Z' });
    expect(String(fetchMock.mock.calls[0][0])).toContain('/schedule/today?date=');
  });
});
