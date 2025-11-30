// src/db.ts
import { Platform } from "react-native";
import * as SQLite from "expo-sqlite";
import type { SQLiteDatabase } from "expo-sqlite";

let dbPromise: Promise<SQLiteDatabase> | null = null;

async function getDB(): Promise<SQLiteDatabase> {
  if (Platform.OS === "web") {
    throw new Error("SQLite não está configurado para web neste projeto.");
  }

  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync("movimentos.db");
      await db.execAsync("PRAGMA journal_mode = WAL;");
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS movimentos (
          id TEXT PRIMARY KEY NOT NULL,
          type TEXT NOT NULL,
          description TEXT,
          title TEXT,
          category TEXT,
          date TEXT,
          amount REAL,
          created_at TEXT
        );
      `);
      return db;
    })();
  }

  return dbPromise;
}

export async function execSql<T = any>(
  sql: string,
  params: any[] = []
): Promise<T> {
  const db = await getDB();

  const isSelect = /^\s*select/i.test(sql);

  if (isSelect) {
    const rows = await db.getAllAsync<any>(sql, params);
    // “emula” o result antigo para o teu MovimentosContext não rebentar
    return { rows: { _array: rows } } as unknown as T;
  }

  const result = await db.runAsync(sql, ...params);
  return result as unknown as T;
}
