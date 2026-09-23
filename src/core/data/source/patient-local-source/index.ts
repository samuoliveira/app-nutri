import type { Database } from '@/core/database/database';
import type { Patient, PatientStatus, Sex } from '@/core/domain/model';

import type { PatientRow, PendingMutation } from './types';

export type { PatientRow, PendingMutation } from './types';

export function rowToPatient(row: PatientRow): Patient {
  return {
    id: row.id,
    name: row.name,
    ageYears: row.age_years,
    sex: (row.sex as Sex) ?? 'O',
    heightM: row.height_m,
    weightKg: row.weight_kg,
    pinned: row.pinned === 1,
    createdAt: row.created_at,
    lastVisitAt: row.last_visit_at,
    status: row.status as PatientStatus,
  };
}

/** Carteira salva no aparelho: é o que a tela mostra quando a rede falha. */
export class PatientLocalSource {
  /** Fila de gravação: withTransactionAsync não é exclusivo, e dois saves juntos abririam BEGIN dentro de BEGIN. */
  private pendingWrite: Promise<void> = Promise.resolve();

  constructor(private readonly database: Database) {}

  save(patients: ReadonlyArray<Patient>): Promise<void> {
    const write = this.pendingWrite.then(() => this.write(patients));
    this.pendingWrite = write.catch(() => undefined);
    return write;
  }

  private async write(patients: ReadonlyArray<Patient>): Promise<void> {
    const cachedAt = new Date().toISOString();
    await this.database.withTransactionAsync(async () => {
      for (const patient of patients) {
        await this.database.runAsync(
          `INSERT INTO patient (id, name, age_years, sex, height_m, weight_kg, pinned, created_at, last_visit_at, status, cached_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             name = excluded.name,
             age_years = excluded.age_years,
             sex = excluded.sex,
             height_m = excluded.height_m,
             weight_kg = excluded.weight_kg,
             created_at = excluded.created_at,
             last_visit_at = excluded.last_visit_at,
             status = excluded.status,
             cached_at = excluded.cached_at`,
          [
            patient.id,
            patient.name,
            patient.ageYears,
            patient.sex,
            patient.heightM,
            patient.weightKg,
            patient.pinned ? 1 : 0,
            patient.createdAt,
            patient.lastVisitAt,
            patient.status,
            cachedAt,
          ],
        );
      }
    });
  }

  async all(): Promise<ReadonlyArray<Patient>> {
    const rows = await this.database.getAllAsync<PatientRow>('SELECT * FROM patient ORDER BY name');
    return rows.map(rowToPatient);
  }

  async byId(id: string): Promise<Patient | null> {
    const row = await this.database.getFirstAsync<PatientRow>('SELECT * FROM patient WHERE id = ?', [id]);
    return row ? rowToPatient(row) : null;
  }

  async setPinned(id: string, pinned: boolean): Promise<void> {
    await this.database.runAsync('UPDATE patient SET pinned = ? WHERE id = ?', [pinned ? 1 : 0, id]);
  }

  async enqueue(kind: string, payload: unknown): Promise<void> {
    await this.database.runAsync(
      'INSERT INTO pending_mutation (kind, payload, created_at) VALUES (?, ?, ?)',
      [kind, JSON.stringify(payload), new Date().toISOString()],
    );
  }

  /** Mais antiga primeiro: a ordem de reenvio é a ordem em que o usuário agiu. */
  async pending(): Promise<ReadonlyArray<PendingMutation>> {
    const rows = await this.database.getAllAsync<{ id: number; kind: string; payload: string }>(
      'SELECT id, kind, payload FROM pending_mutation ORDER BY id',
    );
    return rows.map((row) => ({ id: row.id, kind: row.kind, payload: JSON.parse(row.payload) as unknown }));
  }

  async removePending(id: number): Promise<void> {
    await this.database.runAsync('DELETE FROM pending_mutation WHERE id = ?', [id]);
  }

  async pendingCount(): Promise<number> {
    const row = await this.database.getFirstAsync<{ total: number }>('SELECT COUNT(*) AS total FROM pending_mutation');
    return row?.total ?? 0;
  }

  async clearPending(): Promise<void> {
    await this.database.execAsync('DELETE FROM pending_mutation');
  }
}
