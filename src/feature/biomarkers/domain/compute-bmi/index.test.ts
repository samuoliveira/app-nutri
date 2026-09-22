import { computeBmi } from './index';

describe('IMC', () => {
  it('calcula peso sobre altura ao quadrado', () => {
    const result = computeBmi(68.4, 1.62);
    expect(result.ok && result.value).toBe(26.1);
  });

  it('recusa altura inválida antes de qualquer tela desenhar', () => {
    const result = computeBmi(68, 0);
    expect(result.ok).toBe(false);
    expect(!result.ok && result.error.code).toBe('invalid-input');
  });
});
