// src/context/MovimentosContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

import { useAuth } from "./AuthContext";
import { FirestoreMovimentosRepo } from "../data/movimentos.firestore";
import { SQLiteMovimentosRepo } from "../data/movimentos.cache";
import { dateStringToEpochMs, normalizeAmount } from "../utils/movimentos";

// ✅ Modelo único e consistente (UI + SQLite + Firestore)
export type Movimento = {
  id: string;
  type: "income" | "expense";
  description: string;
  title?: string;
  category: string;
  date: string;        // dd/MM/yyyy
  dateTs: number;      // epoch ms (ordenação)
  amount: number;
  created_at: string;  // ISO
};

export type NewMovimento = {
  type: "income" | "expense";
  description: string;
  title?: string;
  category?: string;
  date: string;
  amount: number | string;
};

type MovimentosContextProps = {
  movimentos: Movimento[];
  addMovimento: (m: NewMovimento) => Promise<void>;
  updateMovimento: (id: string, fields: Partial<Movimento>) => Promise<void>;
  deleteMovimento: (id: string) => Promise<void>;
  loadMovimentos: () => Promise<void>;
};

const MovimentosContext = createContext<MovimentosContextProps | undefined>(undefined);

export const MovimentosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [movimentos, setMovimentos] = useState<Movimento[]>([]);

  const isWeb = Platform.OS === "web";
  const useCacheOnMobile = !isWeb;

  const remoteRepo = FirestoreMovimentosRepo;

  // 1) Load inicial (cache no mobile, Firestore no web)
  async function loadMovimentos() {
    if (!user?.uid) {
      setMovimentos([]);
      return;
    }

    try {
      if (useCacheOnMobile) {
        const local = await SQLiteMovimentosRepo.getAll(user.uid);
        setMovimentos(local);
      } else {
        const remote = await remoteRepo.getAll(user.uid);
        setMovimentos(remote);
      }
    } catch (err) {
      console.error("Erro ao carregar movimentos:", err);
      setMovimentos([]);
    }
  }

  // 2) Realtime sync (Firestore como fonte de verdade)
  useEffect(() => {
    if (authLoading) return;

    if (!user?.uid) {
      setMovimentos([]);
      return;
    }

    const unsubscribe = remoteRepo.listen(
      user.uid,
      async (remoteList: Movimento[]) => {
        setMovimentos(remoteList);

        if (useCacheOnMobile) {
          try {
            await SQLiteMovimentosRepo.syncFromRemote(user.uid, remoteList);
          } catch (e) {
            console.error("Erro ao sincronizar cache local:", e);
          }
        }
      },
      (err: unknown) => console.error("Erro Firestore movimentos:", err)
    );

    return () => unsubscribe();
  }, [user?.uid, authLoading, useCacheOnMobile]);

  // 3) CRUD

  async function addMovimento(m: NewMovimento) {
    if (!user?.uid) return;

    const mov: Movimento = {
      id: Date.now().toString(),
      type: m.type,
      description: m.description.trim(),
      title: (m.title ?? m.description).trim(),
      category: (m.category?.trim() || "Sem categoria"),
      date: m.date,
      dateTs: dateStringToEpochMs(m.date),
      amount: normalizeAmount(m.amount),
      created_at: new Date().toISOString(),
    };

    // Optimistic UI
    setMovimentos((prev) => [mov, ...prev]);

    // cache local (mobile)
    if (useCacheOnMobile) {
      try {
        await SQLiteMovimentosRepo.insert(user.uid, mov);
      } catch (e) {
        console.error("Erro a inserir no cache local:", e);
      }
    }

    // Firestore (fonte de verdade)
    try {
      await remoteRepo.insertWithId(user.uid, mov.id, mov);
    } catch (e) {
      console.error("Erro a inserir no Firestore:", e);

      // rollback simples
      setMovimentos((prev) => prev.filter((x) => x.id !== mov.id));
      if (useCacheOnMobile) {
        try {
          await SQLiteMovimentosRepo.remove(user.uid, mov.id);
        } catch {}
      }
    }
  }

  async function updateMovimento(id: string, fields: Partial<Movimento>) {
    if (!user?.uid) return;

    // Se mudarem a date, alinha também o dateTs
    const patched: Partial<Movimento> = { ...fields };
    if (typeof patched.date === "string") {
      patched.dateTs = dateStringToEpochMs(patched.date);
    }

    // Optimistic UI
    setMovimentos((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patched } : m))
    );

    if (useCacheOnMobile) {
      try {
        await SQLiteMovimentosRepo.update(user.uid, id, patched);
      } catch (e) {
        console.error("Erro a actualizar cache local:", e);
      }
    }

    try {
      await remoteRepo.update(user.uid, id, patched);
    } catch (e) {
      console.error("Erro a actualizar no Firestore:", e);
      // o listener tende a corrigir o estado depois
    }
  }

  async function deleteMovimento(id: string) {
    if (!user?.uid) return;

    // Optimistic UI
    setMovimentos((prev) => prev.filter((m) => m.id !== id));

    if (useCacheOnMobile) {
      try {
        await SQLiteMovimentosRepo.remove(user.uid, id);
      } catch (e) {
        console.error("Erro a apagar do cache local:", e);
      }
    }

    try {
      await remoteRepo.remove(user.uid, id);
    } catch (e) {
      console.error("Erro a apagar no Firestore:", e);
    }
  }

  const value = useMemo(
    () => ({ movimentos, addMovimento, updateMovimento, deleteMovimento, loadMovimentos }),
    [movimentos]
  );

  return <MovimentosContext.Provider value={value}>{children}</MovimentosContext.Provider>;
};

export function useMovimentos() {
  const ctx = useContext(MovimentosContext);
  if (!ctx) {
    throw new Error("useMovimentos tem de ser usado dentro de MovimentosProvider.");
  }
  return ctx;
}
