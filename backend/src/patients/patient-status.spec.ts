import { classifyPatientStatus, computeBmi } from './patient-status';

const NOW = new Date('2026-09-22T12:00:00Z');
const daysAgo = (days: number): Date => new Date(NOW.getTime() - days * 86_400_000);

describe('classifyPatientStatus', () => {
  it('classifica como novo quem entrou nos últimos 14 dias', () => {
    const status = classifyPatientStatus({ createdAt: daysAgo(3), lastVisitAt: null }, [], NOW);

    expect(status).toBe('novo');
  });

  it('classifica como atenção quando a glicemia está acima do limite', () => {
    const status = classifyPatientStatus(
      { createdAt: daysAgo(200), lastVisitAt: daysAgo(5) },
      [{ kind: 'glucose', value: 140 }],
      NOW,
    );

    expect(status).toBe('atencao');
  });

  it('classifica como atenção quando a última visita passou de 45 dias', () => {
    const status = classifyPatientStatus({ createdAt: daysAgo(200), lastVisitAt: daysAgo(60) }, [], NOW);

    expect(status).toBe('atencao');
  });

  it('classifica como em dia quando as medições estão na faixa e a visita é recente', () => {
    const status = classifyPatientStatus(
      { createdAt: daysAgo(200), lastVisitAt: daysAgo(10) },
      [{ kind: 'glucose', value: 92 }, { kind: 'pressure', value: 120 }],
      NOW,
    );

    expect(status).toBe('em_dia');
  });
});

describe('computeBmi', () => {
  it('calcula o IMC com uma casa decimal', () => {
    expect(computeBmi(80, 1.75)).toBe(26.1);
  });

  it('devolve null para altura inválida', () => {
    expect(computeBmi(80, 0)).toBeNull();
  });
});
