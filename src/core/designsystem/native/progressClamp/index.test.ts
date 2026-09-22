import { progressClamp } from './index';

describe('progressClamp', () => {
  it('mapeia o valor para 0..1 dentro da escala', () => {
    expect(progressClamp(100, 50, 150)).toBe(0.5);
  });

  it('prende nos extremos em vez de vazar o desenho', () => {
    expect(progressClamp(10, 50, 150)).toBe(0);
    expect(progressClamp(400, 50, 150)).toBe(1);
  });

  it('devolve 0 para escala inválida', () => {
    expect(progressClamp(100, 150, 50)).toBe(0);
    expect(progressClamp(Number.NaN, 0, 10)).toBe(0);
  });
});
