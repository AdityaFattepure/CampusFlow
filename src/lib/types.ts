// CampusFlow — shared domain types.
// All persisted entities carry an `id` (string) and ISO timestamps.

export type Priority = "Low" | "Medium" | "High";

export const TASK_CATEGORIES = [
  "Academics",
  "Personal",
  "Errands",
  "Health",
  "Other",
] as const;
export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: Priority;
  dueDate: string; // ISO yyyy-mm-dd
  completed: boolean;
  createdAt: string; // ISO datetime
}

export const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Education",
  "Shopping",
  "Entertainment",
  "Bills",
  "Other",
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string; // ISO yyyy-mm-dd
  createdAt: string;
}

export interface StudySession {
  id: string;
  date: string; // ISO yyyy-mm-dd
  minutes: number;
  note?: string;
}

/**
 * A study plan models a real commitment: learn <subject> for <dailyMinutesGoal>
 * every day between <startDate> and <targetDate>. Progress is derived from the
 * logged <sessions>, not a hand-set percentage — so "am I on track?" is always
 * a truthful, computed answer.
 */
export interface StudyGoal {
  id: string;
  subject: string;
  topic: string; // the overall aim, e.g. "Learn DSA in 2 months"
  startDate: string; // ISO yyyy-mm-dd
  targetDate: string; // ISO yyyy-mm-dd (deadline)
  dailyMinutesGoal: number; // e.g. 120 = 2h/day
  priority: Priority;
  sessions: StudySession[];
  createdAt: string; // ISO datetime
}

export const NOTE_CATEGORIES = [
  "Academics",
  "Personal",
  "Ideas",
  "Reference",
  "Other",
] as const;
export type NoteCategory = (typeof NOTE_CATEGORIES)[number];

export interface Note {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  updatedAt: string; // ISO datetime
  createdAt: string;
}

export type ModuleKey =
  | "dashboard"
  | "tasks"
  | "expenses"
  | "study"
  | "notes"
  | "settings";

// Input shapes (omit generated fields)
export type TaskInput = Omit<Task, "id" | "createdAt" | "completed">;
export type ExpenseInput = Omit<Expense, "id" | "createdAt">;
export type StudyGoalInput = Omit<StudyGoal, "id" | "createdAt" | "sessions">;
export type StudySessionInput = {
  date: string;
  minutes: number;
  note?: string;
};
export type NoteInput = Omit<Note, "id" | "createdAt" | "updatedAt">;
