// src/db/budget.ts
import { openDatabaseAsync, SQLiteDatabase } from "expo-sqlite";

let dbPromise: Promise<SQLiteDatabase> | null = null;

async function getDB(): Promise<SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = openDatabaseAsync("financas.db").then(async (db) => {
      // Tabela muito simples: 1 linha com o orçamento actual
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS budget_settings (
          id INTEGER PRIMARY KEY NOT NULL,
          amount REAL NOT NULL
        );
      `);
      return db;
    });
  }
  return dbPromise;
}

export async function getStoredBudget(): Promise<number | null> {
  const db = await getDB();

  const row = await db.getFirstAsync<{ amount: number }>(
    "SELECT amount FROM budget_settings ORDER BY id DESC LIMIT 1;"
  );

  if (!row || typeof row.amount !== "number") {
    return null;
  }

  return row.amount;
}

export async function saveBudget(amount: number): Promise<void> {
  const db = await getDB();
  // Mantemos apenas uma linha actual; se não existir, insere, se existir, substitui.
  await db.execAsync("DELETE FROM budget_settings;");
  await db.runAsync("INSERT INTO budget_settings (amount) VALUES (?);", [
    amount,
  ]);
}
