import * as SQLite from 'expo-sqlite';

import { DomainError } from '@/core/domain/domain-error';
import { LATEST_SCHEMA_VERSION, migrations } from '../migrations';
import type { Database } from './types';

export type { Database } from './types';

const DATABASE_NAME = 'tecsa.db';

/** Abre o banco e aplica as migrations pendentes. Chamado uma vez, na subida do app. */
export async function openDatabase(): Promise<Database> {
  try {
    const database = await SQLite.openDatabaseAsync(DATABASE_NAME);
    await database.execAsync('PRAGMA journal_mode = WAL;');
    await runMigrations(database);
    return database;
  } catch (cause) {
    throw DomainError.storage(cause instanceof Error ? cause.message : undefined);
  }
}

async function runMigrations(database: Database): Promise<void> {
  const row = await database.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;
  if (currentVersion >= LATEST_SCHEMA_VERSION) return;

  for (const migration of migrations) {
    if (migration.version <= currentVersion) continue;
    for (const statement of migration.statements) {
      await database.execAsync(statement);
    }
  }

  await database.execAsync(`PRAGMA user_version = ${LATEST_SCHEMA_VERSION}`);
}
