// src/context/MealsContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

import { useAuth } from "./AuthContext";
import { FirestoreMealsRepo } from "../data/meals.firestore";
import { SQLiteMealsRepo } from "../data/meals.cache";

export type MealType = "Pequeno-almoço" | "Almoço" | "Jantar" | "Snack";

export type Meal = {
  id: string;
  day: string;
  type: MealType;
  title: string;
  notes?: string;
  calories?: number;
  tag?: string;
  created_at: string; // ISO obrigatório
};

export type NewMeal = {
  day: string;
  type: MealType;
  title: string;
  notes?: string;
  calories?: number | string;
  tag?: string;
};

type MealsContextProps = {
  meals: Meal[];
  loading: boolean;
  loadMeals: () => Promise<void>;
  addMeal: (m: NewMeal) => Promise<void>;
  updateMeal: (id: string, fields: Partial<Meal>) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
};

const MealsContext = createContext<MealsContextProps | undefined>(undefined);

function normalizeCalories(v?: number | string): number | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(String(v).replace(",", ".").trim());
  return Number.isFinite(n) ? n : undefined;
}

function sanitizeMeals(list: any[]): Meal[] {
  if (!Array.isArray(list)) return [];
  return list
    .filter((x) => x && typeof x === "object" && typeof x.id === "string" && x.id.trim().length > 0)
    .map((x) => ({
      id: String(x.id),
      day: String(x.day ?? ""),
      type: (x.type ?? "Snack") as MealType,
      title: String(x.title ?? ""),
      notes: typeof x.notes === "string" ? x.notes : "",
      calories: typeof x.calories === "number" && Number.isFinite(x.calories) ? x.calories : undefined,
      tag: typeof x.tag === "string" ? x.tag : "Sem tag",
      created_at: typeof x.created_at === "string" && x.created_at ? x.created_at : new Date().toISOString(),
    }));
}

export const MealsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();

  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const isWeb = Platform.OS === "web";
  const useCacheOnMobile = !isWeb;

  const remoteRepo = FirestoreMealsRepo;

  async function loadMeals() {
    if (!user?.uid) {
      setMeals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      if (useCacheOnMobile) {
        // ✅ SQLite “local-only” (sem user_id)
        const local = await SQLiteMealsRepo.getAll();
        setMeals(sanitizeMeals(local as any[]));
      } else {
        const remote = await remoteRepo.getAll(user.uid);
        setMeals(sanitizeMeals(remote as any[]));
      }
    } catch (e) {
      console.error("Erro ao carregar refeições:", e);
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) return;

    if (!user?.uid) {
      setMeals([]);
      setLoading(false);
      return;
    }

    const unsubscribe = remoteRepo.listen(
      user.uid,
      async (remoteList: Meal[]) => {
        const safeList = sanitizeMeals(remoteList as any[]);
        setMeals(safeList);
        setLoading(false);

        if (useCacheOnMobile) {
          try {
            // ✅ SQLiteRepo: 1 argumento
           await SQLiteMealsRepo.syncFromRemote(user.uid, remoteList);
          } catch (e) {
            console.error("Erro ao sincronizar refeições (SQLite):", e);
          }
        }
      },
      (err) => {
        console.error("Erro Firestore meals:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid, authLoading, useCacheOnMobile]);

  async function addMeal(m: NewMeal) {
    if (!user?.uid) return;

    const meal: Meal = {
      id: Date.now().toString(),
      day: m.day,
      type: m.type,
      title: (m.title ?? "").trim() || "Refeição sem título",
      notes: (m.notes ?? "").trim() || "",
      calories: normalizeCalories(m.calories),
      tag: (m.tag ?? "").trim() || "Sem tag",
      created_at: new Date().toISOString(),
    };

    setMeals((prev) => [meal, ...prev]);

    if (useCacheOnMobile) {
      try {
        // ✅ SQLiteRepo: 1 argumento (meal)
        await SQLiteMealsRepo.remove(user.uid, );
      } catch (e) {
        console.error("Erro a inserir refeição no SQLite:", e);
      }
    }

    try {
      await remoteRepo.insertWithId(user.uid, meal.id, meal);
    } catch (e) {
      console.error("Erro a inserir refeição no Firestore:", e);

      setMeals((prev) => prev.filter((x) => x.id !== meal.id));
      if (useCacheOnMobile) {
        try {
          // ✅ SQLiteRepo: 1 argumento (id)
          await SQLiteMealsRepo.remove(meal.id);
        } catch {}
      }
    }
  }

  async function updateMeal(id: string, fields: Partial<Meal>) {
    if (!user?.uid) return;

    const updates: Partial<Meal> = { ...fields };
    if (typeof (updates as any).calories === "string") {
      updates.calories = normalizeCalories((updates as any).calories);
    }

    setMeals((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));

    if (useCacheOnMobile) {
      try {
        // ✅ SQLiteRepo: 2 argumentos (id, updates)
        await SQLiteMealsRepo.update(id, updates);
      } catch (e) {
        console.error("Erro a actualizar refeição no SQLite:", e);
      }
    }

    try {
      await remoteRepo.update(user.uid, id, updates);
    } catch (e) {
      console.error("Erro a actualizar refeição no Firestore:", e);
    }
  }

  async function deleteMeal(id: string) {
    if (!user?.uid) return;

    setMeals((prev) => prev.filter((m) => m.id !== id));

    if (useCacheOnMobile) {
      try {
        // ✅ SQLiteRepo: 1 argumento (id)
        await SQLiteMealsRepo.remove(id);
      } catch (e) {
        console.error("Erro a apagar refeição no SQLite:", e);
      }
    }

    try {
      await remoteRepo.remove(user.uid, id);
    } catch (e) {
      console.error("Erro a apagar refeição no Firestore:", e);
    }
  }

  const value = useMemo(
    () => ({ meals, loading, loadMeals, addMeal, updateMeal, deleteMeal }),
    [meals, loading]
  );

  return <MealsContext.Provider value={value}>{children}</MealsContext.Provider>;
};

export function useMeals() {
  const ctx = useContext(MealsContext);
  if (!ctx) throw new Error("useMeals tem de ser usado dentro de MealsProvider");
  return ctx;
}
