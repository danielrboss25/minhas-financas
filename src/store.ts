import { create } from "zustand";

type BudgetState = {
  budgetByMonth: Record<string, number>;
  setBudget: (monthKey: string, amount: number) => void;
};

export const useBudget = create<BudgetState>()(
  (set) => ({
    budgetByMonth: {},

    setBudget: (monthKey: string, amount: number) =>
      set((state) => ({
        ...state,
        budgetByMonth: {
          ...state.budgetByMonth,
          [monthKey]: amount,
        },
      })),
  })
);
