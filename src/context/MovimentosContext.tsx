import React, { createContext, useContext, useEffect, useState } from "react";
import { openDatabase } from "expo-sqlite";
const db = openDatabase("financas.db");

function execSql<T = any>(sql: string, params: any[] = []): Promise<T> {
  return new Promise((resolve, reject) => {
    db.transaction(
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
      (txErr: any) => reject(txErr)
    );
  });
}

export type Movimento = {
  id: string;
  type: "income" | "expense";
  description: string;
  title?: string;
  category: string;
  date: string;
  amount: number;
  created_at?: string;
};

export type NewMovimento = {
  type: "income" | "expense";
  description: string;
  title?: string;
  category?: string;
  date: string; // dd/MM/yyyy
  amount: number | string;
};

type MovimentosContextProps = {
  movimentos: Movimento[];
  addMovimento: (m: NewMovimento) => Promise<void>;
  updateMovimento: (id: string, fields: Partial<Movimento>) => Promise<void>;
  deleteMovimento: (id: string) => Promise<void>;
  loadMovimentos: () => Promise<void>;
};

const MovimentosContext = createContext<MovimentosContextProps | undefined>(
  undefined
);

export const MovimentosProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [movimentos, setMovimentos] = useState<Movimento[]>([]);

  useEffect(() => {
    execSql(
      `CREATE TABLE IF NOT EXISTS movimentos (
        id TEXT PRIMARY KEY NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        title TEXT,
        category TEXT,
        date TEXT,
        amount REAL,
        created_at TEXT
      );`
    ).catch((e) => console.warn("create table err", e));
    loadMovimentos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadMovimentos() {
    try {
      const res: any = await execSql(
        "SELECT * FROM movimentos ORDER BY date DESC, created_at DESC",
        []
      );
      const rows = res?.rows?._array ?? [];
      const mapped: Movimento[] = rows.map((r: any) => ({
        id: String(r.id),
        type: r.type === "income" ? "income" : "expense",
        description: r.description ?? "",
        title: r.title ?? r.description ?? "",
        category: r.category ?? "Sem categoria",
        date: r.date ?? "",
        amount: typeof r.amount === "number" ? r.amount : Number(r.amount) || 0,
        created_at: r.created_at ?? undefined,
      }));
      setMovimentos(mapped);
    } catch (err) {
      console.error("Erro ao carregar movimentos", err);
    }
  }

  async function addMovimento(m: NewMovimento) {
    const id = Date.now().toString();
    const created_at = new Date().toISOString();
    const amountNum =
      typeof m.amount === "number"
        ? m.amount
        : Number(String(m.amount).replace(",", "."));
    const novo: Movimento = {
      id,
      created_at,
      title: m.title ?? m.description,
      type: m.type,
      description: m.description,
      category: m.category ?? "Sem categoria",
      date: m.date,
      amount: Number.isNaN(amountNum) ? 0 : amountNum,
    };

    try {
      await execSql(
        `INSERT INTO movimentos (id, type, description, title, category, date, amount, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          novo.id,
          novo.type,
          novo.description,
          novo.title ?? null,
          novo.category,
          novo.date,
          novo.amount,
          novo.created_at,
        ]
      );
      setMovimentos((prev) => [novo, ...prev]);
    } catch (err) {
      console.error("Erro ao adicionar movimento", err);
    }
  }

  async function updateMovimento(id: string, fields: Partial<Movimento>) {
    const keys = Object.keys(fields).filter(
      (k) => k !== "id" && k !== "created_at"
    );
    if (keys.length === 0) return;
    const setSql = keys.map((k) => `${k} = ?`).join(", ");
    const params = keys.map((k) => (fields as any)[k]);
    params.push(id);
    try {
      await execSql(`UPDATE movimentos SET ${setSql} WHERE id = ?`, params);
      setMovimentos((prev) =>
        prev.map((mv) =>
          mv.id === id
            ? {
                ...mv,
                ...fields,
                title: fields.title ?? fields.description ?? mv.title,
              }
            : mv
        )
      );
    } catch (err) {
      console.error("Erro ao atualizar movimento", err);
    }
  }

  async function deleteMovimento(id: string) {
    try {
      await execSql("DELETE FROM movimentos WHERE id = ?", [id]);
      setMovimentos((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Erro ao excluir movimento", err);
    }
  }

  return (
    <MovimentosContext.Provider
      value={{
        movimentos,
        addMovimento,
        updateMovimento,
        deleteMovimento,
        loadMovimentos,
      }}
    >
      {children}
    </MovimentosContext.Provider>
  );
};

export function useMovimentos() {
  const ctx = useContext(MovimentosContext);
  if (!ctx)
    throw new Error("useMovimentos must be used within MovimentosProvider");
  return ctx;
}
