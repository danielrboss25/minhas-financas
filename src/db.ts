// src/db.ts
import { Platform } from "react-native";
import * as SQLite from "expo-sqlite";
import type { SQLiteDatabase } from "expo-sqlite";

let dbPromise: Promise<SQLiteDatabase> | null = null;

async function hasColumn(db: SQLiteDatabase, table: string, col: string): Promise<boolean> {
  const rows = await db.getAllAsync<any>(`PRAGMA table_info(${table});`);
  return rows.some((r: any) => String(r.name).toLowerCase() === col.toLowerCase());
}

async function ensureFixed(db: SQLiteDatabase, table: string) {
  const exists = await hasColumn(db, table, "fixed");
  if (!exists) {
    // INTEGER 0/1 para compatibilidade com SQLite/Expo
    await db.execAsync(`ALTER TABLE ${table} ADD COLUMN fixed INTEGER NOT NULL DEFAULT 0;`);
  }

  // compat: se houver pinned, copia para fixed
  const hasPinned = await hasColumn(db, table, "pinned");
  if (hasPinned) {
    await db.execAsync(`UPDATE ${table} SET fixed = COALESCE(fixed, pinned, 0);`);
  }
}

async function runMigrations(db: SQLiteDatabase) {
  // Só mexemos onde faz sentido: ideias, tarefas, refeições, budgets (se o teu código usar fixed em alguma)
  // Importante: usa NOMES REAIS das tabelas que tu tens no CREATE TABLE.
  const tables = ["ideas", "tasks", "meals", "budgets"];

  for (const t of tables) {
    // Se a tabela não existir, PRAGMA devolve vazio. Vamos ignorar nesse caso.
    const anyCols = await db.getAllAsync<any>(`PRAGMA table_info(${t});`);
    if (!anyCols || anyCols.length === 0) continue;

    // Só adiciona "fixed" se algum repo o usar nessa tabela.
    // Se não usas fixed em meals/budgets, podes remover daqui. Mas como o teu log diz que falha em várias,
    // deixo para parar a queda em cadeia.
    try {
      await ensureFixed(db, t);
    } catch {
      // Se por alguma razão a tabela for velha e o ALTER falhar por bloqueio, etc, não matamos a app.
    }
  }

  // Migração específica de ideas (schema antigo: body/pinned)
  // Só adiciona body/pinned se faltarem, e depois copia para o novo modelo.
  try { if (!(await hasColumn(db, "ideas", "body")))   await db.execAsync(`ALTER TABLE ideas ADD COLUMN body TEXT;`); } catch {}
  try { if (!(await hasColumn(db, "ideas", "pinned"))) await db.execAsync(`ALTER TABLE ideas ADD COLUMN pinned INTEGER;`); } catch {}

  try {
    const hasContent = await hasColumn(db, "ideas", "content");
    const hasFixedIdeas = await hasColumn(db, "ideas", "fixed");
    if (hasContent && hasFixedIdeas) {
      await db.execAsync(`
        UPDATE ideas
        SET
          content = COALESCE(content, body, ''),
          fixed   = COALESCE(fixed, pinned, 0),
          created_at = COALESCE(created_at, datetime('now'))
        WHERE content IS NULL OR content = '';
      `);
    }
  } catch {}
}

async function getDB(): Promise<SQLiteDatabase> {
  if (Platform.OS === "web") {
    throw new Error("SQLite não está configurado para web neste projeto.");
  }

  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync("movimentos.db");
      await db.execAsync("PRAGMA journal_mode = WAL;");

      // Tabelas base
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS movimentos (
          id TEXT PRIMARY KEY NOT NULL,
          type TEXT NOT NULL,
          description TEXT,
          title TEXT,
          category TEXT,
          date TEXT,
          dateTs INTEGER,
          amount REAL,
          created_at TEXT
        );

        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          notes TEXT,
          bucket TEXT NOT NULL,
          priority TEXT NOT NULL,
          done INTEGER NOT NULL DEFAULT 0,
          due_label TEXT,
          created_at TEXT
        );

        CREATE TABLE IF NOT EXISTS ideas (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          content TEXT,
          tag TEXT,
          fixed INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_ideas_created ON ideas(created_at);
        CREATE INDEX IF NOT EXISTS idx_ideas_fixed   ON ideas(fixed);
        CREATE INDEX IF NOT EXISTS idx_ideas_tag     ON ideas(tag);

        CREATE TABLE IF NOT EXISTS meals (
          id TEXT PRIMARY KEY NOT NULL,
          day TEXT NOT NULL,
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          notes TEXT,
          calories REAL,
          tag TEXT,
          created_at TEXT
        );

        CREATE TABLE IF NOT EXISTS budgets (
          id TEXT PRIMARY KEY NOT NULL,
          month_key TEXT NOT NULL,
          amount REAL NOT NULL,
          updated_at TEXT
        );
        CREATE UNIQUE INDEX IF NOT EXISTS idx_budgets_month ON budgets(month_key);
      `);
      async function ensureUserId(db: SQLiteDatabase, table: string) {
  const exists = await hasColumn(db, table, "user_id");
  if (!exists) {
    await db.execAsync(`ALTER TABLE ${table} ADD COLUMN user_id TEXT;`);
    await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_${table}_user_id ON ${table}(user_id);`);
  }
}

async function runMigrations(db: SQLiteDatabase) {
  const tables = ["movimentos", "tasks", "ideas", "meals", "budgets"];

  for (const t of tables) {
    const cols = await db.getAllAsync<any>(`PRAGMA table_info(${t});`);
    if (!cols || cols.length === 0) continue;

    // se estás a usar user_id nos caches (e estás, pelo erro), garante a coluna
    await ensureUserId(db, t);

    // se continuares a usar fixed algures, garante-o também
    // await ensureFixed(db, t);
  }

  // migrações específicas antigas (body/pinned) se aplicarem
}


      // MIGRAÇÕES: tem de ser aqui, depois dos CREATE TABLE
      await runMigrations(db);

      return db;
    })();
  }

  return dbPromise;
}

export async function execSql<T = any>(sql: string, params: any[] = []): Promise<T> {
  const db = await getDB();
  const isSelect = /^\s*select/i.test(sql);

  if (isSelect) {
    const rows = await db.getAllAsync<any>(sql, params);
    return { rows: { _array: rows } } as unknown as T;
  }

  const result = await db.runAsync(sql, ...params);
  return result as unknown as T;
}
