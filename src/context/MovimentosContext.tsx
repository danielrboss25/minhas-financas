// src/context/MovimentosContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Movimento = {
  id: string;
  type: "income" | "expense";
  description: string;
  title?: string; // compatibilidade com código existente
  category: string;
  date: string;
  amount: string; // mantemos string para evitar refactor extra
};

type MovimentosContextProps = {
  movimentos: Movimento[];
  addMovimento: (m: Omit<Movimento, "id">) => Promise<void>;
  updateMovimento: (id: string, fields: Partial<Movimento>) => Promise<void>;
  deleteMovimento: (id: string) => Promise<void>;
  loadMovimentos: () => Promise<void>;
};

const MovimentosContext = createContext<MovimentosContextProps | undefined>(
  undefined
);

const STORAGE_KEY = "@minhas_financas:movimentos";

export const MovimentosProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [movimentos, setMovimentos] = useState<Movimento[]>([]);

  useEffect(() => {
    loadMovimentos();
  }, []);

  useEffect(() => {
    // guarda automaticamente sempre que mudar
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(movimentos)).catch(
      () => {}
    );
  }, [movimentos]);

  async function loadMovimentos() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setMovimentos(JSON.parse(raw));
    } catch (e) {
      console.warn("Failed to load movimentos", e);
    }
  }

  async function addMovimento(m: Omit<Movimento, "id">) {
    const novo: Movimento = {
      id: Date.now().toString(),
      title: m.title ?? m.description,
      ...m,
    };
    setMovimentos((prev) => [novo, ...prev]);
  }

  async function updateMovimento(id: string, fields: Partial<Movimento>) {
    setMovimentos((prev) =>
      prev.map((mv) =>
        mv.id === id
          ? {
              ...mv,
              ...fields,
              title: fields.title ?? fields.description ?? mv.description,
            }
          : mv
      )
    );
  }

  async function deleteMovimento(id: string) {
    setMovimentos((prev) => prev.filter((mv) => mv.id !== id));
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
