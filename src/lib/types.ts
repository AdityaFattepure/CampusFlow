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

export interface StudyGoal {
  id: string;
  subject: string;
  topic: string;
  progress: number; // 0 - 100
  targetDate: string; // ISO yyyy-mm-dd
  priority: Priority;
  completed: boolean;
  createdAt: string;
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
  | "notes";

// Input shapes (omit generated fields)
export type TaskInput = Omit<Task, "id" | "createdAt" | "completed">;
export type ExpenseInput = Omit<Expense, "id" | "createdAt">;
export type StudyGoalInput = Omit<
  StudyGoal,
  "id" | "createdAt" | "completed"
> & { completed?: boolean };
export type NoteInput = Omit<Note, "id" | "createdAt" | "updatedAt">;
