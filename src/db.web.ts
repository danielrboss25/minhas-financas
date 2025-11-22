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
const memory: FinanceRecord[] = [];

export async function initDB(): Promise<void> {
  // no-op no web
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
