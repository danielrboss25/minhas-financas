// src/store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

type BudgetState = {
  budgetByMonth: Record<string, number>;
  setBudget: (monthKey: string, amount: number) => void;
};

export const useBudget = create<BudgetState>()(
  persist(
    (set) => ({
      budgetByMonth: {},

      setBudget: (monthKey, amount) =>
        set((state) => ({
          budgetByMonth: {
            ...state.budgetByMonth,
            [monthKey]: amount,
          },
        })),
    }),
    {
      name: "my-budget-storage", // fica gravado no AsyncStorage
    }
  )
);
