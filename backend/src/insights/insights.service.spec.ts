import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';

import type { FlagsService } from '../flags/flags.service';
import type { PatientsService, PatientView } from '../patients/patients.service';
import { InsightsService } from './insights.service';
import type { InsightsRepository } from './insights.repository';
import type { LlmClient } from './llm/llm.client';

const PATIENT: PatientView = {
  id: '9f1c2a44-0a3d-4f2b-9d0f-2b0a1c3d4e5f',
  name: 'Maria Souza',
  ageYears: 54,
  sex: 'F',
  heightM: 1.6,
  weightKg: 82,
  bmi: 32,
  pinned: false,
  status: 'atencao',
  createdAt: '2026-01-10T12:00:00.000Z',
  lastVisitAt: '2026-09-01T12:00:00.000Z',
};

function build(overrides: { aiEnabled?: boolean; llm?: LlmClient; known?: unknown } = {}) {
  const llm: LlmClient = overrides.llm ?? {
    generate: jest.fn().mockResolvedValue({ summary: 'resumo', recommendations: ['a'], source: 'llm' }),
  };

  const patients = {
    byId: jest.fn().mockResolvedValue(PATIENT),
    measurements: jest.fn().mockResolvedValue([
      { kind: 'glucose', takenAt: new Date('2026-09-10T12:00:00Z'), value: 140, secondaryValue: null },
    ]),
  } as unknown as PatientsService;

  const flags = {
    isEnabled: jest.fn().mockResolvedValue(overrides.aiEnabled ?? true),
  } as unknown as FlagsService;

  const repository = {
    save: jest.fn().mockImplementation((insight) => Promise.resolve({ id: 'insight-1', ...insight })),
    latestFor: jest.fn().mockResolvedValue(null),
    findByFingerprint: jest.fn().mockResolvedValue(overrides.known ?? null),
  } as unknown as InsightsRepository;

  return { service: new InsightsService(patients, flags, repository, llm), llm, patients, repository };
}

describe('InsightsService', () => {
  it('não chama o LLM quando a flag ai_insights está desligada', async () => {
    const { service, llm } = build({ aiEnabled: false });

    await expect(service.create(PATIENT.id)).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(llm.generate).not.toHaveBeenCalled();
  });

  it('envia ao LLM apenas dados anonimizados', async () => {
    const { service, llm } = build();

    await service.create(PATIENT.id);

    const profile = (llm.generate as jest.Mock).mock.calls[0][0];
    expect(JSON.stringify(profile)).not.toContain('Maria');
    expect(JSON.stringify(profile)).not.toContain(PATIENT.id);
    expect(profile).toMatchObject({ ageYears: 54, sex: 'F', bmi: 32 });
  });

  it('persiste o insight gerado com a origem da resposta', async () => {
    const { service, repository } = build();

    const insight = await service.create(PATIENT.id);

    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ patientId: PATIENT.id, summary: 'resumo', source: 'llm' }),
    );
    expect(insight.id).toBe('insight-1');
  });

  it('não chama o provedor quando o mesmo quadro clínico já tem rascunho', async () => {
    const { service, llm } = build({ known: { id: 'insight-antigo', summary: 'resumo anterior' } });

    const insight = await service.create(PATIENT.id);

    expect(insight.id).toBe('insight-antigo');
    expect(llm.generate).not.toHaveBeenCalled();
  });

  it('guarda a impressão digital e os dados considerados', async () => {
    const { service, repository } = build();

    await service.create(PATIENT.id);

    const saved = (repository.save as jest.Mock).mock.calls[0][0];
    expect(saved.fingerprint).toContain('54:F');
    expect(saved.considered).toEqual(
      expect.arrayContaining([
        { label: 'Idade', detail: '54 anos' },
        { label: 'IMC', detail: '32' },
        { label: 'Glicemia', detail: '140 mg/dL' },
      ]),
    );
  });

  it('propaga paciente inexistente como 404', async () => {
    const { service, patients } = build();
    (patients.byId as jest.Mock).mockRejectedValueOnce(new NotFoundException());

    await expect(service.create('sem-paciente')).rejects.toBeInstanceOf(NotFoundException);
  });
});
