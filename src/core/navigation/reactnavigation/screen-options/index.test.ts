import { brandById } from '@/core/designsystem/brands';
import { screenHeaderOptions } from './index';

describe('opções de header', () => {
  const tecsa = brandById('tecsa');
  const vitta = brandById('vitta');

  it('usa cor e fonte da marca ativa', () => {
    const options = screenHeaderOptions({ title: 'Biomarcadores', showBack: true }, tecsa);

    expect(options.headerTintColor).toBe(tecsa.palette.accent);
    expect(options.headerTitleStyle).toMatchObject({ fontFamily: tecsa.typography.familySemibold });
    expect(options.headerShadowVisible).toBe(false);
  });

  it('troca de marca troca o header inteiro, sem tocar na tela', () => {
    const first = screenHeaderOptions({ title: 'Pacientes' }, tecsa);
    const second = screenHeaderOptions({ title: 'Pacientes' }, vitta);

    expect(first.headerTintColor).not.toBe(second.headerTintColor);
    expect(first.title).toBe(second.title);
  });

  it('large title só aparece quando a tela pede', () => {
    expect(screenHeaderOptions({ title: 'Início' }, tecsa).headerLargeTitle).toBe(false);
    expect(screenHeaderOptions({ title: 'Início', largeTitle: true }, tecsa).headerLargeTitle).toBe(true);
  });
});
