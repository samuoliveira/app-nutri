import { NotFoundException } from '@nestjs/common';
import type { Repository } from 'typeorm';

import type { FeatureFlag } from './feature-flag.entity';
import { DEFAULT_FLAGS, FlagsService } from './flags.service';

function build(rows: Array<Partial<FeatureFlag>> = []) {
  const repository = {
    find: jest.fn().mockResolvedValue(rows),
    save: jest.fn().mockImplementation((row) => Promise.resolve(row)),
  } as unknown as Repository<FeatureFlag>;

  return { service: new FlagsService(repository), repository };
}

describe('FlagsService', () => {
  it('devolve os defaults quando o banco está vazio', async () => {
    const { service } = build();

    await expect(service.snapshot()).resolves.toEqual(DEFAULT_FLAGS);
  });

  it('sobrepõe o default com o que está gravado', async () => {
    const { service } = build([{ key: 'ai_insights', enabled: false }]);

    const snapshot = await service.snapshot();

    expect(snapshot.ai_insights).toBe(false);
    expect(snapshot.agenda_tab).toBe(true);
  });

  it('ignora chave desconhecida vinda do banco', async () => {
    const { service } = build([{ key: 'flag_fantasma', enabled: true }]);

    const snapshot = await service.snapshot();

    expect(snapshot).toEqual(DEFAULT_FLAGS);
    expect(snapshot).not.toHaveProperty('flag_fantasma');
  });

  it('isEnabled lê a flag pedida', async () => {
    const { service } = build([{ key: 'biometric_lock', enabled: false }]);

    await expect(service.isEnabled('biometric_lock')).resolves.toBe(false);
    await expect(service.isEnabled('ai_insights')).resolves.toBe(true);
  });

  it('grava a flag e devolve o snapshot atualizado', async () => {
    const { service, repository } = build();
    /** O snapshot é lido depois do save, então o find devolve a linha já gravada. */
    (repository.find as jest.Mock).mockResolvedValue([{ key: 'ai_insights', enabled: false }]);

    const snapshot = await service.set('ai_insights', false);

    expect(repository.save).toHaveBeenCalledWith({ key: 'ai_insights', enabled: false });
    expect(snapshot.ai_insights).toBe(false);
  });

  it('recusa flag fora do catálogo', async () => {
    const { service, repository } = build();

    await expect(service.set('nao_existe', true)).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
