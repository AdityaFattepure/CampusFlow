"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import type { StudyGoal, StudyGoalInput } from "@/lib/types";
import { createSeedGoals } from "./seed-data";

const nowISO = () => new Date().toISOString();

interface StudyStore {
  goals: StudyGoal[];
  addGoal: (input: StudyGoalInput) => void;
  updateGoal: (id: string, patch: Partial<StudyGoalInput>) => void;
  deleteGoal: (id: string) => void;
  setProgress: (id: string, progress: number) => void;
  toggleGoal: (id: string) => void;
  loadDemo: () => void;
  reset: () => void;
}

export const useStudyStore = create<StudyStore>()(
  persist(
    (set) => ({
      goals: [],
      addGoal: (input) =>
        set((s) => ({
          goals: [
            {
              ...input,
              completed: input.completed ?? false,
              id: uuid(),
              createdAt: nowISO(),
            },
            ...s.goals,
          ],
        })),
      updateGoal: (id, patch) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        })),
      deleteGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),
      setProgress: (id, progress) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === id
              ? {
                  ...g,
                  progress: Math.max(0, Math.min(100, Math.round(progress))),
                  completed: Math.round(progress) >= 100,
                }
              : g
          ),
        })),
      toggleGoal: (id) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === id ? { ...g, completed: !g.completed } : g
          ),
        })),
      loadDemo: () => set({ goals: createSeedGoals() }),
      reset: () => set({ goals: [] }),
    }),
    {
      name: "campusflow:studyGoals",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
