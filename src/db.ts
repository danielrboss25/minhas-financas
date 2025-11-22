// src/db.ts — implementação NATIVE (Expo Go / Android / iOS)
// API moderna do expo-sqlite (SDK 51/52+), 100% assíncrona.

import { openDatabaseAsync, SQLiteDatabase } from "expo-sqlite";

export type FinanceRecord = {
  id: string;
  date: string;
  type: "expense" | "income";
  category: string;
  amount: number;
  note?: string;
  month_key: string;
  created_at?: string;
};

// Singleton para abrir/initializar a BD uma única vez
let dbPromise: Promise<SQLiteDatabase> | null = null;

async function getDB(): Promise<SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = openDatabaseAsync("financas.db").then(async (db) => {
      // Opcional, mas melhora concorrência
      await db.execAsync(`PRAGMA journal_mode = WAL;`);

      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS finance_records (
          id TEXT PRIMARY KEY NOT NULL,
          date TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('expense','income')),
          category TEXT NOT NULL,
          amount REAL NOT NULL,
          note TEXT,
          month_key TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
      `);

      return db;
    });
  }
  return dbPromise;
}

/** Garante que a BD está criada (podes chamar no arranque da app). */
export async function initDB(): Promise<void> {
  await getDB();
}

export const q = {
  /** Lista todos os registos do mês (ordenados por data desc, depois created_at desc). */
  async listMonth(monthKey: string): Promise<FinanceRecord[]> {
    const db = await getDB();
    const rows = await db.getAllAsync<FinanceRecord>(
      `SELECT * FROM finance_records
       WHERE month_key = ?
       ORDER BY date DESC, created_at DESC`,
      [monthKey]
    );
    return rows ?? [];
  },

  /** Soma das despesas do mês (0 se vazio). */
  async sumOfMonth(monthKey: string): Promise<number> {
    const db = await getDB();
    const row = await db.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0) AS total
       FROM finance_records
       WHERE month_key = ?`,
      [monthKey]
    );
    return Number(row?.total ?? 0);
  },

  /** Insere um registo (a created_at é preenchida aqui). */
  async insert(rec: Omit<FinanceRecord, "created_at">): Promise<void> {
    const db = await getDB();
    const created = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO finance_records
       (id, date, type, category, amount, note, month_key, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        rec.id,
        rec.date,
        rec.type,
        rec.category,
        rec.amount,
        rec.note ?? null,
        rec.month_key,
        created,
      ]
    );
  },

  /** (Opcional) Apaga todos os registos de um mês — útil para testes. */
  async clearMonth(monthKey: string): Promise<void> {
    const db = await getDB();
    await db.runAsync(`DELETE FROM finance_records WHERE month_key = ?`, [
      monthKey,
    ]);
  },
};
