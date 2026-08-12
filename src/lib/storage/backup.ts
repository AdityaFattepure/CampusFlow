"use client";

import { useTaskStore } from "@/lib/stores/task-store";
import { useExpenseStore } from "@/lib/stores/expense-store";
import { useStudyStore } from "@/lib/stores/study-store";
import { useNoteStore } from "@/lib/stores/note-store";
import { useSettingsStore } from "@/lib/stores/settings-store";
import type { Task, Expense, StudyGoal, Note } from "@/lib/types";

/**
 * CampusFlow backup / restore layer.
 *
 * The app stores everything in the browser's localStorage (one key per
 * store). These helpers bundle all five stores (+ the theme preference)
 * into a single JSON file the user can download, and restore it back.
 *
 * No backend is involved — this is the portable answer to localStorage's
 * "stuck on this one browser" limitation.
 */

export const BACKUP_VERSION = 1;
export const APP_VERSION = "1.0.0";

export interface CampusFlowBackup {
  app: "campusflow";
  version: number;
  exportedAt: string;
  data: {
    tasks: Task[];
    expenses: Expense[];
    studyGoals: StudyGoal[];
    notes: Note[];
    settings: { studentName: string };
    theme?: string;
  };
}

/** Read every store's current state into a single backup object. */
export function buildBackup(): CampusFlowBackup {
  return {
    app: "campusflow",
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      tasks: useTaskStore.getState().tasks,
      expenses: useExpenseStore.getState().expenses,
      studyGoals: useStudyStore.getState().goals,
      notes: useNoteStore.getState().notes,
      settings: { studentName: useSettingsStore.getState().studentName },
      theme:
        typeof localStorage !== "undefined"
          ? (localStorage.getItem("theme") ?? undefined)
          : undefined,
    },
  };
}

function todayStamp(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}

/** Build a backup and trigger a browser download as `campusflow-backup-YYYY-MM-DD.json`. */
export function downloadBackup(): void {
  const backup = buildBackup();
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `campusflow-backup-${todayStamp()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface RestoreResult {
  ok: boolean;
  error?: string;
  theme?: string | null;
  counts?: {
    tasks: number;
    expenses: number;
    studyGoals: number;
    notes: number;
  };
}

/**
 * Parse a backup JSON string, validate it, and write it into every store.
 * Returns the restored theme (if present) so the caller can sync next-themes.
 */
export function restoreBackup(json: string): RestoreResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, error: "File is not valid JSON." };
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    (parsed as CampusFlowBackup).app !== "campusflow" ||
    !(parsed as CampusFlowBackup).data
  ) {
    return { ok: false, error: "Not a CampusFlow backup file (missing signature)." };
  }

  const d = (parsed as CampusFlowBackup).data;

  const counts = {
    tasks: Array.isArray(d.tasks) ? d.tasks.length : 0,
    expenses: Array.isArray(d.expenses) ? d.expenses.length : 0,
    studyGoals: Array.isArray(d.studyGoals) ? d.studyGoals.length : 0,
    notes: Array.isArray(d.notes) ? d.notes.length : 0,
  };

  if (Array.isArray(d.tasks)) useTaskStore.setState({ tasks: d.tasks });
  if (Array.isArray(d.expenses)) useExpenseStore.setState({ expenses: d.expenses });
  if (Array.isArray(d.studyGoals)) useStudyStore.setState({ goals: d.studyGoals });
  if (Array.isArray(d.notes)) useNoteStore.setState({ notes: d.notes });
  if (d.settings && typeof d.settings.studentName === "string") {
    useSettingsStore.setState({ studentName: d.settings.studentName });
  }

  const theme = typeof d.theme === "string" ? d.theme : null;
  if (theme) {
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* ignore quota / privacy mode */
    }
  }

  return { ok: true, theme, counts };
}

/** Wipe every store back to its empty / default state. */
export function resetAllData(): void {
  useTaskStore.getState().reset();
  useExpenseStore.getState().reset();
  useStudyStore.getState().reset();
  useNoteStore.getState().reset();
  useSettingsStore.getState().reset();
}

/** Replace every store with the bundled demo dataset. */
export function loadDemoData(): void {
  useTaskStore.getState().loadDemo();
  useExpenseStore.getState().loadDemo();
  useStudyStore.getState().loadDemo();
  useNoteStore.getState().loadDemo();
  useSettingsStore.getState().loadDemo();
}

/** Whether the workspace currently holds any user/demo data. */
export function isWorkspaceEmpty(): boolean {
  return (
    useTaskStore.getState().tasks.length === 0 &&
    useExpenseStore.getState().expenses.length === 0 &&
    useStudyStore.getState().goals.length === 0 &&
    useNoteStore.getState().notes.length === 0
  );
}
