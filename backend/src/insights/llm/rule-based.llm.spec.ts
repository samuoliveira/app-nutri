import { RuleBasedLlm } from './rule-based.llm';

describe('RuleBasedLlm', () => {
  const llm = new RuleBasedLlm();

  it('aponta obesidade e glicemia alterada', async () => {
    const result = await llm.generate({
      ageYears: 54,
      sex: 'F',
      bmi: 32,
      measurements: [{ kind: 'glucose', takenAt: '2026-09-10T12:00:00.000Z', value: 140, secondaryValue: null }],
    });

    expect(result.source).toBe('rules');
    expect(result.summary).toContain('obesidade');
    expect(result.recommendations.length).toBeGreaterThan(1);
  });

  it('devolve conduta de manutenção quando não há alteração', async () => {
    const result = await llm.generate({ ageYears: 30, sex: 'M', bmi: 22, measurements: [] });

    expect(result.recommendations).toEqual(['Manter o plano atual e reavaliar na próxima consulta.']);
  });
});
