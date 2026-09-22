import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { FeatureFlag } from '../flags/feature-flag.entity';
import { DEFAULT_FLAGS } from '../flags/flags.service';
import { Insight } from '../insights/insight.entity';
import { Measurement } from '../patients/measurement.entity';
import { Patient } from '../patients/patient.entity';
import { Appointment } from '../schedule/appointment.entity';

const FIRST = ['Maria', 'João', 'Ana', 'Carlos', 'Beatriz', 'Paulo', 'Luiza', 'Rafael'];
const LAST = ['Souza', 'Lima', 'Ferreira', 'Alves', 'Costa', 'Ribeiro', 'Martins'];
const TOTAL = 120;

/** Base sintética para exercitar lista virtualizada, filtros e insights. */
async function seed(): Promise<void> {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number(process.env.DATABASE_PORT ?? 5432),
    username: process.env.DATABASE_USER ?? 'nutri',
    password: process.env.DATABASE_PASSWORD ?? 'nutri',
    database: process.env.DATABASE_NAME ?? 'nutri',
    entities: [Patient, Measurement, Insight, FeatureFlag, Appointment],
    synchronize: true,
  });

  await dataSource.initialize();

  const patients = dataSource.getRepository(Patient);
  if ((await patients.count()) > 0) {
    console.log('Seed ignorado: já existem pacientes.');
    await dataSource.destroy();
    return;
  }

  const flags = dataSource.getRepository(FeatureFlag);
  for (const [key, enabled] of Object.entries(DEFAULT_FLAGS)) {
    await flags.save({ key, enabled });
  }

  const measurements = dataSource.getRepository(Measurement);

  for (let index = 0; index < TOTAL; index += 1) {
    const createdDaysAgo = index < 10 ? index : 30 + index * 2;
    const patient = await patients.save({
      name: `${FIRST[index % FIRST.length]} ${LAST[index % LAST.length]}`,
      ageYears: 20 + (index % 50),
      sex: index % 2 === 0 ? 'F' : 'M',
      heightM: Number((1.55 + (index % 30) / 100).toFixed(2)),
      weightKg: Number((55 + (index % 45)).toFixed(1)),
      pinned: index % 17 === 0,
      createdAt: daysAgo(createdDaysAgo),
      lastVisitAt: index % 7 === 0 ? daysAgo(70) : daysAgo(index % 30),
    });

    await measurements.save([
      { patientId: patient.id, kind: 'weight', takenAt: daysAgo(30), value: patient.weightKg + 1.4, secondaryValue: null },
      { patientId: patient.id, kind: 'weight', takenAt: daysAgo(2), value: patient.weightKg, secondaryValue: null },
      { patientId: patient.id, kind: 'glucose', takenAt: daysAgo(5), value: index % 5 === 0 ? 132 : 92, secondaryValue: null },
      { patientId: patient.id, kind: 'pressure', takenAt: daysAgo(5), value: index % 6 === 0 ? 146 : 120, secondaryValue: 80 },
    ]);
  }

  await seedTodaySchedule(dataSource);

  console.log(`Seed concluído: ${TOTAL} pacientes.`);
  await dataSource.destroy();
}

/** Agenda de hoje: 6 consultas a partir das 8h, de 50 em 50 minutos. */
async function seedTodaySchedule(dataSource: DataSource): Promise<void> {
  const appointments = dataSource.getRepository(Appointment);
  const patients = await dataSource.getRepository(Patient).find({ take: 6 });
  const kinds = ['first', 'return', 'consultation'] as const;

  for (const [index, patient] of patients.entries()) {
    const startsAt = new Date();
    startsAt.setHours(8, 0, 0, 0);
    startsAt.setMinutes(startsAt.getMinutes() + index * 50);

    await appointments.save({
      patientId: patient.id,
      startsAt,
      durationMinutes: 40,
      kind: kinds[index % kinds.length],
    });
  }

  console.log(`Agenda de hoje: ${patients.length} consultas.`);
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 86_400_000);
}

void seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
