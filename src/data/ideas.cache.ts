// src/data/ideas.cache.ts
import { Platform } from "react-native";
import * as SQLite from "expo-sqlite";

export type Idea = {
  id: string;
  title: string;
  content: string;
  tag: string;
  fixed: boolean;
  createdAt: string; // ISO
  createdAtTs: number; // epoch ms
};

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

/**
 * MIGRAÇÃO “sem drama”:
 * A tua tabela original ideas não tem user_id e chama body/pinned/created_at.
 * Aqui garantimos um esquema consistente, criando ideas_v2 e copiando dados.
 */
async function init() {
  await execSql(`
    CREATE TABLE IF NOT EXISTS ideas_v2 (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      tag TEXT NOT NULL,
      fixed INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      createdAtTs INTEGER NOT NULL
    );
  `);

  // Se a tabela antiga "ideas" existir, tenta migrar uma única vez
  // (se já migrou, não volta a inserir porque ids já existem em ideas_v2).
  try {
    const old: any = await execSql(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='ideas';`
    );

    const hasOld = (old?.rows?._array ?? []).length > 0;
    if (!hasOld) return;

    // Copiar dados da tabela antiga para a nova (sem user_id, fica "legacy")
    // NOTA: estas entradas legacy vão aparecer a todos os utilizadores no mobile
    // até tu decidires limpar ou atribuir user_id. É inevitável sem histórico.
    await execSql(`
      INSERT OR IGNORE INTO ideas_v2 (id, user_id, title, content, tag, fixed, createdAt, createdAtTs)
      SELECT
        id,
        '__legacy__' AS user_id,
        COALESCE(title, '') AS title,
        COALESCE(body, '') AS content,
        COALESCE(tag, '') AS tag,
        COALESCE(pinned, 0) AS fixed,
        COALESCE(created_at, '') AS createdAt,
        CASE
          WHEN created_at IS NOT NULL AND created_at <> '' THEN CAST(strftime('%s', created_at) AS INTEGER) * 1000
          ELSE CAST(strftime('%s', 'now') AS INTEGER) * 1000
        END AS createdAtTs
      FROM ideas;
    `);
  } catch {
    // se falhar, não bloqueia a app. mas o schema v2 continua válido.
  }
}

function rowToIdea(r: any): Idea {
  return {
    id: String(r.id),
    title: String(r.title ?? ""),
    content: String(r.content ?? ""),
    tag: String(r.tag ?? ""),
    fixed: Number(r.fixed ?? 0) === 1,
    createdAt: String(r.createdAt ?? new Date().toISOString()),
    createdAtTs: Number(r.createdAtTs ?? Date.now()),
  };
}

export const SQLiteIdeasRepo = {
  async getAll(userId: string): Promise<Idea[]> {
    await init();
    const res: any = await execSql(
      `SELECT * FROM ideas_v2
       WHERE user_id = ?
       ORDER BY fixed DESC, createdAtTs DESC`,
      [userId]
    );
    return (res.rows?._array ?? []).map(rowToIdea);
  },

  async insert(userId: string, idea: Idea): Promise<void> {
    await init();
    await execSql(
      `INSERT OR REPLACE INTO ideas_v2
       (id, user_id, title, content, tag, fixed, createdAt, createdAtTs)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        idea.id,
        userId,
        idea.title ?? "",
        idea.content ?? "",
        idea.tag ?? "",
        idea.fixed ? 1 : 0,
        idea.createdAt ?? new Date().toISOString(),
        idea.createdAtTs ?? Date.now(),
      ]
    );
  },

  async update(userId: string, id: string, fields: Partial<Idea>): Promise<void> {
    await init();

    const allowed = Object.keys(fields).filter(
      (k) => !["id"].includes(k)
    );
    if (allowed.length === 0) return;

    const sets = allowed.map((k) => `${k} = ?`).join(", ");
    const values = allowed.map((k) => {
      const v = (fields as any)[k];
      if (k === "fixed") return v ? 1 : 0;
      return v;
    });

    await execSql(
      `UPDATE ideas_v2
       SET ${sets}
       WHERE id = ? AND user_id = ?`,
      [...values, id, userId]
    );
  },

  async remove(userId: string, id: string): Promise<void> {
    await init();
    await execSql(
      `DELETE FROM ideas_v2 WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
  },

  async syncFromRemote(userId: string, remote: Idea[]): Promise<void> {
    await init();

    await execSql(`DELETE FROM ideas_v2 WHERE user_id = ?`, [userId]);
    for (const idea of remote) {
      await this.insert(userId, idea);
    }
  },
};
