"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import type { Task, TaskInput } from "@/lib/types";
import { createSeedTasks } from "./seed-data";

const nowISO = () => new Date().toISOString();

interface TaskStore {
  tasks: Task[];
  addTask: (input: TaskInput) => void;
  updateTask: (id: string, patch: Partial<TaskInput>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  setCompleted: (id: string, completed: boolean) => void;
  clearCompleted: () => void;
  /** Replace all tasks with the bundled demo dataset. */
  loadDemo: () => void;
  /** Empty the store. */
  reset: () => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      // Empty by default — genuine users start with a clean workspace.
      tasks: [],
      addTask: (input) =>
        set((s) => ({
          tasks: [
            { ...input, id: uuid(), completed: false, createdAt: nowISO() },
            ...s.tasks,
          ],
        })),
      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      deleteTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
        })),
      setCompleted: (id, completed) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, completed } : t)),
        })),
      clearCompleted: () =>
        set((s) => ({ tasks: s.tasks.filter((t) => !t.completed) })),
      loadDemo: () => set({ tasks: createSeedTasks() }),
      reset: () => set({ tasks: [] }),
    }),
    {
      name: "campusflow:tasks",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
