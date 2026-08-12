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
  /** Mark a borrow/lend debt as repaid (settled). */
  settleTransaction: (id: string) => void;
  /** Reopen a settled debt. */
  unsettleTransaction: (id: string) => void;
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
            {
              ...input,
              settled: input.settled ?? false,
              id: uuid(),
              createdAt: nowISO(),
            },
            ...s.expenses,
          ],
        })),
      updateExpense: (id, patch) =>
        set((s) => ({
          expenses: s.expenses.map((e) =>
            e.id === id
              ? {
                  ...e,
                  ...patch,
                  settled:
                    patch.settled !== undefined ? patch.settled : e.settled,
                }
              : e
          ),
        })),
      deleteExpense: (id) =>
        set((s) => ({
          expenses: s.expenses.filter((e) => e.id !== id),
        })),
      settleTransaction: (id) =>
        set((s) => ({
          expenses: s.expenses.map((e) =>
            e.id === id &&
            (e.kind === "borrow" || e.kind === "lend") &&
            !e.settled
              ? { ...e, settled: true }
              : e
          ),
        })),
      unsettleTransaction: (id) =>
        set((s) => ({
          expenses: s.expenses.map((e) =>
            e.id === id && (e.kind === "borrow" || e.kind === "lend")
              ? { ...e, settled: false }
              : e
          ),
        })),
      loadDemo: () => set({ expenses: createSeedExpenses() }),
      reset: () => set({ expenses: [] }),
    }),
    {
      name: "campusflow:expenses",
      storage: createJSONStorage(() => localStorage),
      version: 2,
      // Migrate v1 (no kind field) → v2 (kind:"expense", settled:false).
      migrate: (persisted: unknown) => {
        const obj = (persisted as { expenses?: unknown[] }) ?? {};
        const expenses = Array.isArray(obj.expenses) ? obj.expenses : [];
        const migrated = expenses.map((e) => {
          const old = e as Record<string, unknown>;
          return {
            id: (old.id as string) ?? uuid(),
            amount: (old.amount as number) ?? 0,
            kind: (old.kind as Expense["kind"]) ?? "expense",
            category: (old.category as Expense["category"]) ?? "Other",
            description: (old.description as string) ?? "",
            date: (old.date as string) ?? new Date().toISOString().slice(0, 10),
            counterparty: old.counterparty as string | undefined,
            settled:
              (old.settled as boolean | undefined) ??
              ((old.kind as string) === "borrow" || (old.kind as string) === "lend"
                ? false
                : undefined),
            createdAt: (old.createdAt as string) ?? nowISO(),
          } as Expense;
        });
        return { expenses: migrated } as { expenses: Expense[] };
      },
    }
  )
);
