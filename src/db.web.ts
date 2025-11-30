// src/db.web.ts — mock em memória para correr no browser.
// Mantém a MESMA API do ficheiro nativo para que o UI funcione na Web.

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


// “Base de dados” em memória (perde ao recarregar a página)
// db.web.ts — mock para SQLite na web
const memory: any[] = []; // Base de dados em memória para web

export async function initDB() {
  return {
    transaction: (callback: any) => {
      callback({
        executeSql: (sql: string, params: any[], success: any, error: any) => {
          try {
            // Simulação de execução SQL
            if (sql.startsWith("CREATE TABLE")) {
              success();
            } else if (sql.startsWith("SELECT")) {
              success({}, { rows: { _array: memory } });
            } else if (sql.startsWith("INSERT")) {
              memory.push(params);
              success();
            } else if (sql.startsWith("DELETE")) {
              memory.splice(0, memory.length); // Limpa a "base de dados"
              success();
            }
          } catch (err) {
            error(err);
          }
        },
      });
    },
  };
}


export const q = {
  async listMonth(monthKey: string): Promise<FinanceRecord[]> {
    return memory
      .filter((r) => r.month_key === monthKey)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  },

  async sumOfMonth(monthKey: string): Promise<number> {
    return memory
      .filter((r) => r.month_key === monthKey && r.type === "expense")
      .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  },

  async insert(rec: Omit<FinanceRecord, "created_at">): Promise<void> {
    memory.push({ ...rec, created_at: new Date().toISOString() });
  },

  async clearMonth(monthKey: string): Promise<void> {
    for (let i = memory.length - 1; i >= 0; i--) {
      if (memory[i].month_key === monthKey) memory.splice(i, 1);
    }
  },
};


export async function execSql<T = any>(sql: string, params: any[] = []): Promise<T> {
  return new Promise((resolve, reject) => {
    try {
      if (sql.startsWith("CREATE TABLE")) {
        resolve({ rows: { _array: [] } } as unknown as T);
      } else if (sql.startsWith("SELECT")) {
        resolve({ rows: { _array: memory } } as unknown as T);
      } else if (sql.startsWith("INSERT")) {
        const obj = {
          id: params[0],
          type: params[1],
          description: params[2],
          title: params[3],
          category: params[4],
          date: params[5],
          amount: params[6],
          created_at: params[7],
        };
        memory.push(obj);
        resolve({ rows: { _array: [] } } as unknown as T);
      } else if (sql.startsWith("DELETE")) {
        const id = params[0];
        const index = memory.findIndex((m) => m.id === id);
        if (index !== -1) memory.splice(index, 1);
        resolve({ rows: { _array: [] } } as unknown as T);
      } else if (sql.startsWith("UPDATE")) {
        const id = params[params.length - 1];
        const fields = params.slice(0, -1);
        const item = memory.find((m) => m.id === id);
        if (item) {
          // Atualiza campos (simplificado)
          Object.assign(item, fields);
        }
        resolve({ rows: { _array: [] } } as unknown as T);
      } else {
        resolve({ rows: { _array: [] } } as unknown as T);
      }
    } catch (err) {
      reject(err);
    }
  });
}
