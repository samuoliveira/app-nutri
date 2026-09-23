import type { Appointment, Measurement, Patient, PatientStatus, Sex } from '@/core/domain/model';

/**
 * Catálogo do "servidor": 2.000 pacientes gerados de forma determinística,
 * que é o volume que a lista virtualizada precisa aguentar.
 */
const FIRST_NAMES = [
  'Ana', 'João', 'Maria', 'Carlos', 'Fernanda', 'Rafael', 'Beatriz', 'Lucas', 'Helena', 'Paulo',
  'Camila', 'Bruno', 'Juliana', 'Marcos', 'Patrícia', 'Diego', 'Larissa', 'Thiago', 'Renata', 'Felipe',
];

const LAST_NAMES = [
  'Silva', 'Santos', 'Costa', 'Lima', 'Alves', 'Pereira', 'Rocha', 'Martins', 'Duarte', 'Nogueira',
  'Cardoso', 'Barbosa', 'Teixeira', 'Moraes', 'Ramos', 'Pinto', 'Azevedo', 'Freitas', 'Campos', 'Moura',
];

export const TOTAL_PATIENTS = 2000;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Semente fixa: mesmo id gera sempre o mesmo paciente, em qualquer aparelho. */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function buildPatient(index: number, nowMs: number): Patient {
  const first = FIRST_NAMES[index % FIRST_NAMES.length] ?? 'Ana';
  const last = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length] ?? 'Silva';
  const suffix = index >= FIRST_NAMES.length * LAST_NAMES.length ? ` ${Math.floor(index / 400) + 1}` : '';
  const random = pseudoRandom(index + 1);
  const sex: Sex = index % 3 === 0 ? 'M' : 'F';

  const createdDaysAgo = Math.floor(random * 900) + 1;
  const hasVisited = createdDaysAgo > 25 || random > 0.7;
  const lastVisitDaysAgo = hasVisited ? Math.floor(pseudoRandom(index + 77) * 120) : null;

  const id = `p-${index}`;
  const createdAt = new Date(nowMs - createdDaysAgo * DAY_MS).toISOString();
  const lastVisitAt = lastVisitDaysAgo === null ? null : new Date(nowMs - lastVisitDaysAgo * DAY_MS).toISOString();

  return {
    id,
    name: `${first} ${last}${suffix}`,
    ageYears: 20 + Math.floor(pseudoRandom(index + 13) * 50),
    sex,
    heightM: Number((1.55 + pseudoRandom(index + 31) * 0.3).toFixed(2)),
    weightKg: Number((52 + pseudoRandom(index + 51) * 50).toFixed(1)),
    pinned: index === 0,
    createdAt,
    lastVisitAt,
    status: serverStatus(createdAt, lastVisitAt, catalogMeasurements(id, nowMs), nowMs),
  };
}

/**
 * O catálogo faz papel de servidor, então devolve o status pronto como o
 * backend faz. Espelha backend/src/patients/patient-status.ts — o app não
 * tem regra própria de status.
 */
function serverStatus(
  createdAt: string,
  lastVisitAt: string | null,
  measurements: ReadonlyArray<Measurement>,
  nowMs: number,
): PatientStatus {
  const daysSince = (iso: string) => Math.floor((nowMs - Date.parse(iso)) / DAY_MS);
  if (daysSince(createdAt) <= 14) return 'novo';

  const alerted = measurements.some(
    (measurement) =>
      (measurement.kind === 'glicemia' && measurement.value >= 126) ||
      (measurement.kind === 'pressao' && measurement.value >= 140),
  );
  if (alerted) return 'atencao';

  if (lastVisitAt === null || daysSince(lastVisitAt) > 45) return 'atencao';
  return 'em_dia';
}

export function catalogPatients(nowMs: number = Date.now()): ReadonlyArray<Patient> {
  return Array.from({ length: TOTAL_PATIENTS }, (_, index) => buildPatient(index, nowMs));
}

export function catalogMeasurements(patientId: string, nowMs: number = Date.now()): ReadonlyArray<Measurement> {
  const index = Number(patientId.replace('p-', '')) || 0;
  const rising = index % 3 === 0;
  const measurements: Measurement[] = [];

  for (let step = 9; step >= 0; step -= 1) {
    const takenAt = new Date(nowMs - step * 3 * DAY_MS).toISOString();
    const drift = (9 - step) * (rising ? 1.6 : -0.2);
    measurements.push({
      id: `${patientId}-peso-${step}`,
      patientId,
      kind: 'peso',
      takenAt,
      value: Number((70 + pseudoRandom(index + step) * 10 - (9 - step) * 0.14).toFixed(1)),
      secondaryValue: null,
    });
    if (step % 3 === 0) {
      measurements.push({
        id: `${patientId}-glicemia-${step}`,
        patientId,
        kind: 'glicemia',
        takenAt,
        value: Math.round(94 + drift + pseudoRandom(index + step + 5) * 6),
        secondaryValue: null,
      });
      measurements.push({
        id: `${patientId}-pressao-${step}`,
        patientId,
        kind: 'pressao',
        takenAt,
        value: Math.round(118 + pseudoRandom(index + step + 9) * 16),
        secondaryValue: Math.round(76 + pseudoRandom(index + step + 11) * 10),
      });
    }
  }

  return measurements;
}

export function catalogAppointments(nowMs: number = Date.now()): ReadonlyArray<Appointment> {
  const patients = [0, 1, 2].map((index) => buildPatient(index, nowMs));
  const day = new Date(nowMs);
  const at = (hour: number, minute: number): string => {
    const date = new Date(day);
    date.setHours(hour, minute, 0, 0);
    return date.toISOString();
  };

  return [
    { id: 'a-1', patientId: patients[0]!.id, patientName: patients[0]!.name, startsAt: at(9, 30), kind: 'retorno' },
    { id: 'a-2', patientId: patients[1]!.id, patientName: patients[1]!.name, startsAt: at(11, 0), kind: 'retorno' },
    { id: 'a-3', patientId: patients[2]!.id, patientName: patients[2]!.name, startsAt: at(14, 30), kind: 'primeira' },
  ];
}
