/**
 * Versão nova entra no fim do array. Versão publicada nunca é editada:
 * o aparelho do usuário já rodou a anterior.
 */
export const migrations: ReadonlyArray<{ version: number; statements: ReadonlyArray<string> }> = [
  {
    version: 1,
    statements: [
      `CREATE TABLE IF NOT EXISTS patient (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        age_years INTEGER NOT NULL,
        sex TEXT NOT NULL,
        height_m REAL NOT NULL,
        weight_kg REAL NOT NULL,
        pinned INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        last_visit_at TEXT,
        cached_at TEXT NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS patient_name_idx ON patient (name)`,
      `CREATE TABLE IF NOT EXISTS measurement (
        id TEXT PRIMARY KEY NOT NULL,
        patient_id TEXT NOT NULL,
        kind TEXT NOT NULL,
        taken_at TEXT NOT NULL,
        value REAL NOT NULL,
        secondary_value REAL
      )`,
      `CREATE INDEX IF NOT EXISTS measurement_patient_idx ON measurement (patient_id, kind, taken_at)`,
      `CREATE TABLE IF NOT EXISTS pending_mutation (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kind TEXT NOT NULL,
        payload TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`,
    ],
  },
  {
    version: 2,
    statements: [
      // Status passa a vir do backend. O cache antigo não tem o valor certo:
      // é só cache, então esvazia e a próxima carga online preenche de novo.
      `DELETE FROM patient`,
      `ALTER TABLE patient ADD COLUMN status TEXT NOT NULL DEFAULT 'em_dia'`,
    ],
  },
];

export const LATEST_SCHEMA_VERSION = migrations[migrations.length - 1]?.version ?? 0;
