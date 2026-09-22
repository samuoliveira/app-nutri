import type { Measurement, Patient } from '@/core/domain/model';
import { classifyPatientStatus } from './index';

const NOW = Date.parse('2026-09-21T12:00:00.000Z');
const daysAgo = (days: number) => new Date(NOW - days * 24 * 60 * 60 * 1000).toISOString();

function patient(overrides: Partial<Patient> = {}): Patient {
  return {
    id: 'p-1',
    name: 'Ana Silva',
    ageYears: 32,
    sex: 'F',
    heightM: 1.62,
    weightKg: 68.4,
    pinned: false,
    createdAt: daysAgo(400),
    lastVisitAt: daysAgo(10),
    ...overrides,
  };
}

function glycemia(value: number, days: number): Measurement {
  return { id: `g-${days}`, patientId: 'p-1', kind: 'glicemia', takenAt: daysAgo(days), value, secondaryValue: null };
}

describe('status do paciente', () => {
  it('é Novo quando nunca consultou e o cadastro tem até 30 dias', () => {
    expect(classifyPatientStatus(patient({ lastVisitAt: null, createdAt: daysAgo(12) }), [], NOW)).toBe('novo');
  });

  it('é Atenção com biomarcador fora da faixa', () => {
    expect(classifyPatientStatus(patient(), [glycemia(131, 2)], NOW)).toBe('atencao');
  });

  it('é Atenção com glicemia subindo 5%+ nas últimas 3 medições', () => {
    const rising = [glycemia(92, 30), glycemia(95, 15), glycemia(98, 2)];
    expect(classifyPatientStatus(patient(), rising, NOW)).toBe('atencao');
  });

  it('é Atenção sem consulta há mais de 60 dias', () => {
    expect(classifyPatientStatus(patient({ lastVisitAt: daysAgo(75) }), [], NOW)).toBe('atencao');
  });

  it('é Em dia no resto dos casos', () => {
    expect(classifyPatientStatus(patient(), [glycemia(88, 5)], NOW)).toBe('em_dia');
  });
});
