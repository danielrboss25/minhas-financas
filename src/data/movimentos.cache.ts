// src/data/movimentos.cache.ts
import { Platform } from "react-native";
import * as SQLite from "expo-sqlite";
import type { Movimento } from "../context/MovimentosContext";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (Platform.OS === "web") {
    throw new Error("SQLite não deve ser usado na web.");
  }

  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync("movimentos.db");
      await db.execAsync("PRAGMA journal_mode = WAL;");
      return db;
    })();
  }

  return dbPromise;
}

async function execSql<T = any>(sql: string, params: any[] = []): Promise<T> {
  const db = await getDB();
  const isSelect = /^\s*select/i.test(sql);

  if (isSelect) {
    const rows = await db.getAllAsync<any>(sql, params);
    return { rows: { _array: rows } } as unknown as T;
  }

  const result = await db.runAsync(sql, ...params);
  return result as unknown as T;
}

/* --------------------------------
   Inicialização da tabela
-------------------------------- */
async function init() {
  await execSql(`
    CREATE TABLE IF NOT EXISTS movimentos (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      title TEXT,
      category TEXT,
      date TEXT,
      dateTs INTEGER NOT NULL,
      amount REAL,
      created_at TEXT NOT NULL
    );
  `);
}

/* --------------------------------
   Repo SQLite
-------------------------------- */
export const SQLiteMovimentosRepo = {
  async getAll(userId: string): Promise<Movimento[]> {
    await init();

    const res: any = await execSql(
      `SELECT * FROM movimentos
       WHERE user_id = ?
       ORDER BY dateTs DESC, created_at DESC`,
      [userId]
    );

    return (res.rows?._array ?? []) as Movimento[];
  },

  async insert(userId: string, mov: Movimento): Promise<void> {
    await init();

    // Se isto falhar, é bom: quer dizer que o teu pipeline está a criar Movimento inválido.
    if (!Number.isFinite(mov.dateTs)) {
      throw new Error("Movimento inválido: dateTs em falta/NaN.");
    }
    if (!mov.created_at) {
      throw new Error("Movimento inválido: created_at em falta.");
    }

    await execSql(
      `INSERT OR REPLACE INTO movimentos
       (id, user_id, type, description, title, category, date, dateTs, amount, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        mov.id,
        userId,
        mov.type,
        mov.description ?? "",
        mov.title ?? "",
        mov.category ?? "Sem categoria",
        mov.date ?? "",
        mov.dateTs,
        mov.amount ?? 0,
        mov.created_at,
      ]
    );
  },

  async update(userId: string, id: string, fields: Partial<Movimento>): Promise<void> {
    const keys = Object.keys(fields).filter(
      (k) => k !== "id" && k !== "created_at" && k !== "user_id"
    );
    if (keys.length === 0) return;

    const sets = keys.map((k) => `${k} = ?`).join(", ");
    const values = keys.map((k) => (fields as any)[k]);

    await execSql(
      `UPDATE movimentos
       SET ${sets}
       WHERE id = ? AND user_id = ?`,
      [...values, id, userId]
    );
  },

  async remove(userId: string, id: string): Promise<void> {
    await execSql(
      `DELETE FROM movimentos
       WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
  },

  async syncFromRemote(userId: string, remote: Movimento[]): Promise<void> {
    await init();

    await execSql(`DELETE FROM movimentos WHERE user_id = ?`, [userId]);

    for (const mov of remote) {
      await this.insert(userId, mov);
    }
  },
};
