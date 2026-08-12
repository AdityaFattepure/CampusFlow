"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import type { Note, NoteInput } from "@/lib/types";
import { createSeedNotes } from "./seed-data";

const nowISO = () => new Date().toISOString();

interface NoteStore {
  notes: Note[];
  addNote: (input: NoteInput) => void;
  updateNote: (id: string, patch: Partial<NoteInput>) => void;
  deleteNote: (id: string) => void;
  loadDemo: () => void;
  reset: () => void;
}

export const useNoteStore = create<NoteStore>()(
  persist(
    (set) => ({
      notes: [],
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
      loadDemo: () => set({ notes: createSeedNotes() }),
      reset: () => set({ notes: [] }),
    }),
    {
      name: "campusflow:notes",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
