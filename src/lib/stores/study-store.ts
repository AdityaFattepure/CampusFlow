"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import type {
  StudyGoal,
  StudyGoalInput,
  StudySession,
  StudySessionInput,
} from "@/lib/types";
import { createSeedGoals } from "./seed-data";

const nowISO = () => new Date().toISOString();

interface StudyStore {
  goals: StudyGoal[];
  addGoal: (input: StudyGoalInput) => void;
  updateGoal: (id: string, patch: Partial<StudyGoalInput>) => void;
  deleteGoal: (id: string) => void;
  /** Log a study session against a plan (the "I studied X minutes today" action). */
  logSession: (goalId: string, input: StudySessionInput) => void;
  updateSession: (goalId: string, sessionId: string, patch: Partial<StudySessionInput>) => void;
  deleteSession: (goalId: string, sessionId: string) => void;
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
              sessions: [],
              id: uuid(),
              createdAt: nowISO(),
            },
            ...s.goals,
          ],
        })),
      updateGoal: (id, patch) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === id ? { ...g, ...patch } : g
          ),
        })),
      deleteGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),
      logSession: (goalId, input) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === goalId
              ? {
                  ...g,
                  sessions: [
                    {
                      id: uuid(),
                      date: input.date,
                      minutes: Math.max(0, Math.round(input.minutes)),
                      note: input.note?.trim() || undefined,
                    },
                    ...g.sessions,
                  ],
                }
              : g
          ),
        })),
      updateSession: (goalId, sessionId, patch) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === goalId
              ? {
                  ...g,
                  sessions: g.sessions.map((x) =>
                    x.id === sessionId
                      ? {
                          ...x,
                          ...patch,
                          minutes:
                            patch.minutes !== undefined
                              ? Math.max(0, Math.round(patch.minutes))
                              : x.minutes,
                        }
                      : x
                  ),
                }
              : g
          ),
        })),
      deleteSession: (goalId, sessionId) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === goalId
              ? { ...g, sessions: g.sessions.filter((x) => x.id !== sessionId) }
              : g
          ),
        })),
      loadDemo: () => set({ goals: createSeedGoals() }),
      reset: () => set({ goals: [] }),
    }),
    {
      name: "campusflow:studyGoals",
      storage: createJSONStorage(() => localStorage),
      version: 2,
      // Migrate v1 (old {progress, completed}) → v2 (sessions-based) by
      // carrying over identifying fields and starting sessions empty.
      migrate: (persisted: unknown) => {
        const obj = (persisted as { goals?: unknown[] }) ?? {};
        const goals = Array.isArray(obj.goals) ? obj.goals : [];
        const migrated = goals.map((g) => {
          const old = g as Record<string, unknown>;
          return {
            id: (old.id as string) ?? uuid(),
            subject: (old.subject as string) ?? "Untitled",
            topic: (old.topic as string) ?? "",
            startDate:
              (old.startDate as string) ??
              (typeof old.createdAt === "string"
                ? old.createdAt.slice(0, 10)
                : undefined) ??
              new Date().toISOString().slice(0, 10),
            targetDate: (old.targetDate as string) ?? new Date().toISOString().slice(0, 10),
            dailyMinutesGoal: (old.dailyMinutesGoal as number) ?? 60,
            priority: (old.priority as StudyGoal["priority"]) ?? "Medium",
            sessions: Array.isArray(old.sessions) ? old.sessions : [],
            createdAt: (old.createdAt as string) ?? nowISO(),
          } as StudyGoal;
        });
        return { goals: migrated } as { goals: StudyGoal[] };
      },
    }
  )
);
