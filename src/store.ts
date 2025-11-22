import { create } from "zustand";

type BudgetState = {
  budgetByMonth: Record<string, number>;
  setBudget: (monthKey: string, amount: number) => void;
};

export const useBudget = create<BudgetState>((set) => ({
  budgetByMonth: {},
  setBudget: (m, a) => set(s => ({ budgetByMonth: { ...s.budgetByMonth, [m]: a } }))
}));
