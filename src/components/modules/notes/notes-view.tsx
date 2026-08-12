"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { useNoteStore } from "@/lib/store";
import type { Note, NoteCategory, NoteInput } from "@/lib/types";
import { NOTE_CATEGORIES } from "@/lib/types";
import { formatDate, NOTE_CATEGORY_STYLES, todayISO } from "@/lib/format";
import { ModuleHeader } from "@/components/shared/module-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useHydrated } from "@/hooks/use-hydrated";
import { toast } from "sonner";
import {
  CalendarClock,
  FileText,
  Hash,
  NotebookPen,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

type CategoryFilter = "All" | NoteCategory;

const CATEGORY_OPTIONS: CategoryFilter[] = ["All", ...NOTE_CATEGORIES];

interface FormState {
  title: string;
  content: string;
  category: NoteCategory;
}

const EMPTY_FORM: FormState = {
  title: "",
  content: "",
  category: "Academics",
};

/**
 * Notes module — capture, organize and search freeform notes.
 * Reads/writes the persisted `useNoteStore`. Create + edit share a single
 * dialog (mode determined by `editingId`). All feedback via Sonner toasts.
 */
export function NotesView() {
  const hydrated = useHydrated();
  const { notes, addNote, updateNote, deleteNote } = useNoteStore();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState<CategoryFilter>("All");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  // Filter + search + sort (newest updatedAt first).
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notes
      .filter((n) => {
        if (categoryFilter !== "All" && n.category !== categoryFilter)
          return false;
        if (!q) return true;
        return (
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [notes, search, categoryFilter]);

  const stats = useMemo(() => {
    const total = notes.length;
    const academics = notes.filter((n) => n.category === "Academics").length;
    const today = todayISO();
    const updatedToday = notes.filter(
      (n) => n.updatedAt.slice(0, 10) === today
    ).length;
    return { total, academics, updatedToday };
  }, [notes]);

  // Per-category counts for the quick-filter chips.
  const categoryCounts = useMemo(() => {
    const map = new Map<NoteCategory, number>();
    for (const c of NOTE_CATEGORIES) map.set(c, 0);
    for (const n of notes) {
      map.set(n.category, (map.get(n.category) ?? 0) + 1);
    }
    return map;
  }, [notes]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(note: Note) {
    setEditingId(note.id);
    setForm({
      title: note.title,
      content: note.content,
      category: note.category,
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const title = form.title.trim();
    const content = form.content.trim();
    if (!title || !content) {
      toast.error("Title and content are required");
      return;
    }
    const payload: NoteInput = { title, content, category: form.category };
    if (editingId) {
      updateNote(editingId, payload);
      toast.success("Note updated");
    } else {
      addNote(payload);
      toast.success("Note created");
    }
    closeDialog();
  }

  function handleDelete(id: string) {
    deleteNote(id);
    toast.success("Note deleted");
  }

  // ---------- skeleton (pre-hydration) ----------
  if (!hydrated) {
    return (
      <div className="space-y-6">
        <ModuleHeader
          icon={<NotebookPen className="size-5" />}
          title="Notes"
          description="Capture and organize your notes"
          actions={
            <Button disabled>
              <Plus /> New Note
            </Button>
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full border-2 border-[var(--pixel-line)] pixel-shadow-sm" />
          ))}
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Skeleton className="h-9 flex-1 border-2 border-[var(--pixel-line)] pixel-shadow-sm" />
          <Skeleton className="h-9 w-40 border-2 border-[var(--pixel-line)] pixel-shadow-sm" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full border-2 border-[var(--pixel-line)] pixel-shadow-sm" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={<NotebookPen className="size-5" />}
        title="Notes"
        description="Capture and organize your notes"
        actions={
          <Button onClick={openCreate}>
            <Plus /> New Note
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          icon={<FileText className="size-4" />}
          label="Total notes"
          value={stats.total}
          sub="Across all categories"
          tone="primary"
          display
        />
        <StatCard
          icon={<Hash className="size-4" />}
          label="Academics"
          value={stats.academics}
          sub="Subject notes captured"
          tone="teal"
          display
        />
        <StatCard
          icon={<CalendarClock className="size-4" />}
          label="Updated today"
          value={stats.updatedToday}
          sub="Notes touched today"
          tone="amber"
          display
        />
      </div>

      {/* Controls: search + category select */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or content…"
            className="pl-9"
            aria-label="Search notes"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 border-2 border-[var(--pixel-line)] bg-card p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
        <div className="sm:w-56">
          <Select
            value={categoryFilter}
            onValueChange={(v) => setCategoryFilter(v as CategoryFilter)}
          >
            <SelectTrigger className="w-full" aria-label="Filter by category">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c === "All" ? "All categories" : c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick-filter chips with counts */}
      <div className="flex flex-wrap gap-2">
        {CATEGORY_OPTIONS.map((c) => {
          const active = categoryFilter === c;
          const count =
            c === "All"
              ? notes.length
              : categoryCounts.get(c as NoteCategory) ?? 0;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCategoryFilter(c)}
              className={
                "inline-flex items-center gap-1.5 border-2 border-[var(--pixel-line)] px-2.5 py-1 text-xs font-semibold transition-colors " +
                (active
                  ? "bg-primary text-primary-foreground pixel-inset"
                  : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground")
              }
              aria-pressed={active}
            >
              <span>{c === "All" ? "All" : c}</span>
              <span
                className={
                  "px-1.5 text-[10px] tabular-nums " +
                  (active
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground")
                }
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Notes grid / empty state */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<NotebookPen className="size-6" />}
          title={
            notes.length === 0
              ? "No notes yet"
              : "No notes match your filters"
          }
          description={
            notes.length === 0
              ? "Capture your first note — a quick idea, a class summary, or anything worth keeping."
              : "Try adjusting your search or category filter."
          }
          action={
            notes.length === 0 ? (
              <Button onClick={openCreate}>
                <Plus /> New Note
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("All");
                }}
              >
                Clear filters
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((note) => (
            <Card
              key={note.id}
              className="group gap-0 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <h3 className="truncate text-sm font-bold">
                    {note.title}
                  </h3>
                  <Badge
                    variant="outline"
                    className={NOTE_CATEGORY_STYLES[note.category]}
                  >
                    {note.category}
                  </Badge>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7 border-2 border-transparent text-muted-foreground hover:border-[var(--pixel-line)] hover:bg-muted hover:text-foreground"
                    onClick={() => openEdit(note)}
                    aria-label={`Edit note: ${note.title}`}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <ConfirmDialog
                    title="Delete this note?"
                    description={`“${note.title}” will be permanently removed.`}
                    confirmLabel="Delete"
                    onConfirm={() => handleDelete(note.id)}
                    trigger={
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 border-2 border-transparent text-muted-foreground hover:border-[var(--pixel-line)] hover:bg-muted hover:text-destructive"
                        aria-label={`Delete note: ${note.title}`}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    }
                  />
                </div>
              </div>

              <p className="line-clamp-4 whitespace-pre-line mt-3 text-sm text-muted-foreground">
                {note.content}
              </p>

              <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarClock className="size-3" />
                <span>Updated {formatDate(note.updatedAt)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => (o ? setDialogOpen(true) : closeDialog())}>
        <DialogContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit note" : "New note"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Update the details of your note."
                  : "Capture a new note — pick a category to keep things tidy."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="note-title">Title</Label>
              <Input
                id="note-title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="e.g. DBMS Important Questions"
                autoFocus
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note-content">Content</Label>
              <Textarea
                id="note-content"
                value={form.content}
                onChange={(e) =>
                  setForm((f) => ({ ...f, content: e.target.value }))
                }
                placeholder="Write your note here…"
                className="min-h-32"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note-category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category: v as NoteCategory }))
                }
              >
                <SelectTrigger id="note-category" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOTE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit">
                {editingId ? "Save changes" : "Create note"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
