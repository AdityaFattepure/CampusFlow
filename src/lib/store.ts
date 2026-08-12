"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import type {
  Expense,
  ExpenseInput,
  Note,
  NoteInput,
  StudyGoal,
  StudyGoalInput,
  Task,
  TaskInput,
} from "./types";
import { daysFromTodayISO, todayISO } from "./format";

/**
 * CampusFlow persistence layer.
 *
 * Each store is persisted independently to `localStorage` under its own key
 * (campusflow:tasks, campusflow:expenses, ...). On the very first visit the
 * initial seed data is written to localStorage; afterwards the user's own data
 * always wins, so deleting an item never re-seeds it.
 */

const nowISO = () => new Date().toISOString();

// ----------------------------- seed data --------------------------------

const seedTasks: Task[] = [
  {
    id: "seed-task-1",
    title: "Complete Java Assignment",
    description: "Finish the OOP inheritance problem set and submit on portal.",
    category: "Academics",
    priority: "High",
    dueDate: daysFromTodayISO(2),
    completed: false,
    createdAt: nowISO(),
  },
  {
    id: "seed-task-2",
    title: "Study DBMS chapter 6",
    description: "Normalization + ACID properties revision.",
    category: "Academics",
    priority: "Medium",
    dueDate: todayISO(),
    completed: false,
    createdAt: nowISO(),
  },
  {
    id: "seed-task-3",
    title: "Complete Internship Report",
    description: "Compile Chapter 7 — Training + Mini Project.",
    category: "Academics",
    priority: "High",
    dueDate: daysFromTodayISO(-1),
    completed: true,
    createdAt: nowISO(),
  },
  {
    id: "seed-task-4",
    title: "Pay hostel mess bill",
    description: "",
    category: "Errands",
    priority: "Medium",
    dueDate: daysFromTodayISO(4),
    completed: false,
    createdAt: nowISO(),
  },
];

const seedExpenses: Expense[] = [
  {
    id: "seed-exp-1",
    amount: 2000,
    category: "Food",
    description: "Mess + canteen (month)",
    date: daysFromTodayISO(-6),
    createdAt: nowISO(),
  },
  {
    id: "seed-exp-2",
    amount: 800,
    category: "Education",
    description: "DBMS reference book",
    date: daysFromTodayISO(-4),
    createdAt: nowISO(),
  },
  {
    id: "seed-exp-3",
    amount: 600,
    category: "Transport",
    description: "Metro recharge",
    date: daysFromTodayISO(-3),
    createdAt: nowISO(),
  },
  {
    id: "seed-exp-4",
    amount: 450,
    category: "Entertainment",
    description: "Movie night",
    date: daysFromTodayISO(-2),
    createdAt: nowISO(),
  },
  {
    id: "seed-exp-5",
    amount: 400,
    category: "Other",
    description: "Stationery",
    date: daysFromTodayISO(-1),
    createdAt: nowISO(),
  },
  {
    id: "seed-exp-6",
    amount: 250,
    category: "Food",
    description: "Dinner",
    date: todayISO(),
    createdAt: nowISO(),
  },
];

const seedGoals: StudyGoal[] = [
  {
    id: "seed-goal-1",
    subject: "Java",
    topic: "Collections Framework",
    progress: 70,
    targetDate: daysFromTodayISO(6),
    priority: "High",
    completed: false,
    createdAt: nowISO(),
  },
  {
    id: "seed-goal-2",
    subject: "DBMS",
    topic: "Normalization & Joins",
    progress: 45,
    targetDate: daysFromTodayISO(9),
    priority: "Medium",
    completed: false,
    createdAt: nowISO(),
  },
  {
    id: "seed-goal-3",
    subject: "OS",
    topic: "Process Scheduling",
    progress: 90,
    targetDate: daysFromTodayISO(3),
    priority: "Medium",
    completed: false,
    createdAt: nowISO(),
  },
  {
    id: "seed-goal-4",
    subject: "Web Dev",
    topic: "React hooks revision",
    progress: 100,
    targetDate: daysFromTodayISO(-1),
    priority: "Low",
    completed: true,
    createdAt: nowISO(),
  },
];

const seedNotes: Note[] = [
  {
    id: "seed-note-1",
    title: "DBMS Important Questions",
    content:
      "1. Explain normalization\n2. What is 2NF?\n3. Explain ACID properties\n4. Difference between INNER and OUTER join",
    category: "Academics",
    updatedAt: nowISO(),
    createdAt: nowISO(),
  },
  {
    id: "seed-note-2",
    title: "Java Collections — quick recap",
    content:
      "List → ArrayList (random access), LinkedList (insert/delete)\nSet → HashSet (no order), TreeSet (sorted)\nMap → HashMap, TreeMap",
    category: "Academics",
    updatedAt: nowISO(),
    createdAt: nowISO(),
  },
  {
    id: "seed-note-3",
    title: "Project ideas",
    content:
      "- Expense splitter for trips\n- Habit tracker with streaks\n- Campus event aggregator",
    category: "Ideas",
    updatedAt: nowISO(),
    createdAt: nowISO(),
  },
];

// ----------------------------- tasks ------------------------------------

interface TaskStore {
  tasks: Task[];
  addTask: (input: TaskInput) => void;
  updateTask: (id: string, patch: Partial<TaskInput>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  setCompleted: (id: string, completed: boolean) => void;
  clearCompleted: () => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: seedTasks,
      addTask: (input) =>
        set((s) => ({
          tasks: [
            {
              ...input,
              id: uuid(),
              completed: false,
              createdAt: nowISO(),
            },
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
    }),
    {
      name: "campusflow:tasks",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);

// ----------------------------- expenses ---------------------------------

interface ExpenseStore {
  expenses: Expense[];
  addExpense: (input: ExpenseInput) => void;
  updateExpense: (id: string, patch: Partial<ExpenseInput>) => void;
  deleteExpense: (id: string) => void;
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set) => ({
      expenses: seedExpenses,
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
    }),
    {
      name: "campusflow:expenses",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);

// ----------------------------- study goals ------------------------------

interface StudyStore {
  goals: StudyGoal[];
  addGoal: (input: StudyGoalInput) => void;
  updateGoal: (id: string, patch: Partial<StudyGoalInput>) => void;
  deleteGoal: (id: string) => void;
  setProgress: (id: string, progress: number) => void;
  toggleGoal: (id: string) => void;
}

export const useStudyStore = create<StudyStore>()(
  persist(
    (set) => ({
      goals: seedGoals,
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
    }),
    {
      name: "campusflow:studyGoals",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);

// ----------------------------- notes ------------------------------------

interface NoteStore {
  notes: Note[];
  addNote: (input: NoteInput) => void;
  updateNote: (id: string, patch: Partial<NoteInput>) => void;
  deleteNote: (id: string) => void;
}

export const useNoteStore = create<NoteStore>()(
  persist(
    (set) => ({
      notes: seedNotes,
      addNote: (input) =>
        set((s) => ({
          notes: [
            {
              ...input,
              id: uuid(),
              createdAt: nowISO(),
              updatedAt: nowISO(),
            },
            ...s.notes,
          ],
        })),
      updateNote: (id, patch) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, ...patch, updatedAt: nowISO() } : n
          ),
        })),
      deleteNote: (id) =>
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
    }),
    {
      name: "campusflow:notes",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);

// ----------------------------- settings ---------------------------------

interface SettingsStore {
  studentName: string;
  setStudentName: (name: string) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      studentName: "Aditya",
      setStudentName: (name) =>
        set({ studentName: (name || "").trim().slice(0, 40) || "Student" }),
    }),
    {
      name: "campusflow:settings",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);

// Convenience selector hook used by views that need to avoid SSR hydration
// flashes: render a skeleton until the persisted state has hydrated.
