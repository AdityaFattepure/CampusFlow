"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import type { Expense, ExpenseInput } from "@/lib/types";
import { createSeedExpenses } from "./seed-data";

const nowISO = () => new Date().toISOString();

interface ExpenseStore {
  expenses: Expense[];
  addExpense: (input: ExpenseInput) => void;
  updateExpense: (id: string, patch: Partial<ExpenseInput>) => void;
  deleteExpense: (id: string) => void;
  loadDemo: () => void;
  reset: () => void;
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set) => ({
      expenses: [],
      addExpense: (input) =>
        set((s) => ({
          expenses: [
            { ...input, id: uuid(), createdAt: nowISO() },
            ...s.expenses,
          ],
        })),
      updateExpense: (id, patch) =>
        set((s) => ({
          expenses: s.expenses.map((e) =>
            e.id === id ? { ...e, ...patch } : e
          ),
        })),
      deleteExpense: (id) =>
        set((s) => ({
          expenses: s.expenses.filter((e) => e.id !== id),
        })),
      loadDemo: () => set({ expenses: createSeedExpenses() }),
      reset: () => set({ expenses: [] }),
    }),
    {
      name: "campusflow:expenses",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
