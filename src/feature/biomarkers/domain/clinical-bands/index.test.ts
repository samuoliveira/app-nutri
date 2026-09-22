import { bmiScale, classify, classifyBloodPressure, glycemiaScale, isOutOfRange } from './index';

describe('faixas clínicas', () => {
  it('classifica glicemia de jejum pela regra do produto', () => {
    expect(classify(65, glycemiaScale).level).toBe('baixo');
    expect(classify(88, glycemiaScale).level).toBe('normal');
    expect(classify(108, glycemiaScale).level).toBe('atencao');
    expect(classify(126, glycemiaScale).level).toBe('alto');
  });

  it('trata diastólica 80+ como pressão alta mesmo com sistólica normal', () => {
    expect(classifyBloodPressure(118, 82).level).toBe('alto');
    expect(classifyBloodPressure(118, 76).level).toBe('normal');
    expect(classifyBloodPressure(128, 78).level).toBe('atencao');
  });

  it('classifica IMC pela tabela da OMS', () => {
    expect(classify(17, bmiScale).label).toBe('Baixo peso');
    expect(classify(24.9, bmiScale).label).toBe('Adequado');
    expect(classify(26.1, bmiScale).label).toBe('Sobrepeso');
    expect(classify(31, bmiScale).label).toBe('Obesidade');
  });

  it('só normal fica dentro da faixa', () => {
    expect(isOutOfRange('normal')).toBe(false);
    expect(isOutOfRange('atencao')).toBe(true);
    expect(isOutOfRange('alto')).toBe(true);
  });
});
