import { dayWindow, isWithin } from './day-window';

describe('dayWindow', () => {
  it('abre a janela na meia-noite e fecha na meia-noite seguinte', () => {
    const window = dayWindow('2026-09-22T15:42:10.000Z');

    expect(window.start.toISOString()).toBe('2026-09-22T00:00:00.000Z');
    expect(window.end.toISOString()).toBe('2026-09-23T00:00:00.000Z');
  });

  it('inclui o primeiro instante do dia e exclui o primeiro do dia seguinte', () => {
    const window = dayWindow('2026-09-22T12:00:00.000Z');

    expect(isWithin(window, new Date('2026-09-22T00:00:00.000Z'))).toBe(true);
    expect(isWithin(window, new Date('2026-09-22T23:59:59.999Z'))).toBe(true);
    expect(isWithin(window, new Date('2026-09-23T00:00:00.000Z'))).toBe(false);
    expect(isWithin(window, new Date('2026-09-21T23:59:59.999Z'))).toBe(false);
  });

  it('rejeita data inválida', () => {
    expect(() => dayWindow('ontem')).toThrow(RangeError);
  });
});
