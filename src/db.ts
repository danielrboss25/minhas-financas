import * as SQLite from "expo-sqlite";

export type FinanceRecord = {
  id: string;
  date: string; // Formato: YYYY-MM-DD
  type: "expense" | "income";
  category: string;
  amount: number;
  note?: string;
  month_key: string; // Formato: YYYY-MM
  created_at?: string; // Timestamp ISO
};

// abrir DB (singleton)
const rawDb = SQLite.openDatabase("financas.db");

// utilitário para executar SQL dentro de uma Promise
function execSqlAsync<T = any>(sql: string, params: any[] = []): Promise<T> {
  return new Promise((resolve, reject) => {
    rawDb.transaction(
      (tx: any) => {
        tx.executeSql(
          sql,
          params,
          (_tx: any, result: any) => resolve(result as unknown as T),
          (_tx: any, err: any) => {
            reject(err);
            return false;
          }
        );
      },
      (txErr: any) => reject(txErr),
      () => {}
    );
  });
}

export async function initDB(): Promise<void> {
  // cria tabela se não existir
  await execSqlAsync(`
    CREATE TABLE IF NOT EXISTS finance_records (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      note TEXT,
      month_key TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}

export const q = {
  async listMonth(monthKey: string): Promise<FinanceRecord[]> {
    const res: any = await execSqlAsync(
      `SELECT * FROM finance_records WHERE month_key = ? ORDER BY date DESC, created_at DESC`,
      [monthKey]
    );
    return (res?.rows?._array) ?? [];
  },

  async sumOfMonth(monthKey: string): Promise<number> {
    const res: any = await execSqlAsync(
      `SELECT COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END),0) AS total FROM finance_records WHERE month_key = ?`,
      [monthKey]
    );
    const row = (res?.rows?._array && res.rows._array[0]) ?? { total: 0 };
    return Number(row.total ?? 0);
  },

  async insert(rec: Omit<FinanceRecord, "created_at">): Promise<void> {
    const createdAt = new Date().toISOString();
    await execSqlAsync(
      `INSERT INTO finance_records (id, date, type, category, amount, note, month_key, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [rec.id, rec.date, rec.type, rec.category, rec.amount, rec.note ?? null, rec.month_key, createdAt]
    );
  },

  async clearMonth(monthKey: string): Promise<void> {
    await execSqlAsync(`DELETE FROM finance_records WHERE month_key = ?`, [monthKey]);
  },
};

export async function initializeDB() {
  await initDB();
}
