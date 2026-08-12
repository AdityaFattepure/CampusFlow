"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DEFAULT_STUDENT_NAME, DEMO_STUDENT_NAME } from "./seed-data";

interface SettingsStore {
  studentName: string;
  setStudentName: (name: string) => void;
  loadDemo: () => void;
  reset: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      studentName: DEFAULT_STUDENT_NAME,
      setStudentName: (name) =>
        set({ studentName: (name || "").trim().slice(0, 40) || DEFAULT_STUDENT_NAME }),
      loadDemo: () => set({ studentName: DEMO_STUDENT_NAME }),
      reset: () => set({ studentName: DEFAULT_STUDENT_NAME }),
    }),
    {
      name: "campusflow:settings",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
