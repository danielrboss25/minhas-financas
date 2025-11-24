// src/db.ts — implementação moderna com expo-sqlite (SDK 51/52+)
// 100% assíncrona, compatível com Android, iOS e Expo Go.

import { openDatabaseAsync, SQLiteDatabase } from "expo-sqlite";

export type FinanceRecord = {
  id: string;                      // UUID manual
  date: string;                    // YYYY-MM-DD
  type: "expense" | "income";      // tipo de movimento
  category: string;                // ex: "Supermercado"
  amount: number;                  // valor
  note?: string;                   // opcional
  month_key: string;               // "YYYY-MM"
  created_at?: string;             // ISO timestamp
};

// Singleton para abrir a BD apenas 1 vez
let dbPromise: Promise<SQLiteDatabase> | null = null;

async function getDB(): Promise<SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = openDatabaseAsync("financas.db").then(async (db) => {
      // Melhor concorrência e estabilidade
      await db.execAsync(`PRAGMA journal_mode = WAL;`);

      // Cria tabela
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS finance_records (
          id TEXT PRIMARY KEY NOT NULL,
          date TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
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

/** Inicializa a BD (chamar no arranque da app). */
export async function initDB(): Promise<void> {
  await getDB();
}

export const q = {
  /** Lista registos de UM mês (ordenados por data e criação). */
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

  /** Soma total de despesas do mês (0 se não houver nada). */
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

  /** Insere um registo. */
  async insert(rec: Omit<FinanceRecord, "created_at">): Promise<void> {
    const db = await getDB();
    const createdAt = new Date().toISOString();

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
        createdAt,
      ]
    );
  },

  /** Apaga todos os registos de um mês (útil em testes). */
  async clearMonth(monthKey: string): Promise<void> {
    const db = await getDB();
    await db.runAsync(
      `DELETE FROM finance_records WHERE month_key = ?`,
      [monthKey]
    );
  },
};
