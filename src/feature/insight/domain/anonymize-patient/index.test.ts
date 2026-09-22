import type { Measurement, Patient } from '@/core/domain/model';
import { anonymizePatient, profileFingerprint } from './index';

const patient: Patient = {
  id: 'p-1',
  name: 'Ana Silva',
  ageYears: 32,
  sex: 'F',
  heightM: 1.62,
  weightKg: 68.4,
  pinned: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  lastVisitAt: null,
};

const measurements: ReadonlyArray<Measurement> = [
  { id: 'm-1', patientId: 'p-1', kind: 'glicemia', takenAt: '2026-09-01T00:00:00.000Z', value: 108, secondaryValue: null },
];

describe('anonimização antes da IA', () => {
  it('não deixa nome nem id saírem do aparelho', () => {
    const profile = anonymizePatient(patient, measurements);
    const serialized = JSON.stringify(profile);

    expect(serialized).not.toContain('Ana');
    expect(serialized).not.toContain('p-1');
    expect(profile.ageYears).toBe(32);
  });

  it('mesmos dados geram a mesma chave, para não cobrar duas vezes', () => {
    const first = profileFingerprint(anonymizePatient(patient, measurements));
    const second = profileFingerprint(anonymizePatient({ ...patient, name: 'Outra Pessoa' }, measurements));

    expect(first).toBe(second);
  });
});
