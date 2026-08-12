"use client";

import * as React from "react";
import {
  ListTodo,
  Plus,
  Search,
  Pencil,
  Trash2,
  CalendarDays,
  CheckCircle2,
  Circle,
  Filter,
  X,
  Eraser,
  ClipboardList,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import { useTaskStore } from "@/lib/stores";
import type { Task, TaskCategory, Priority, TaskInput } from "@/lib/types";
import { TASK_CATEGORIES } from "@/lib/types";
import {
  formatDate,
  relativeDay,
  todayISO,
  PRIORITY_STYLES,
  TASK_CATEGORY_STYLES,
} from "@/lib/format";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

// --------------------------- constants ----------------------------------

const PRIORITIES: Priority[] = ["Low", "Medium", "High"];

/** Higher number = higher priority (for high→low sort). */
const PRIORITY_RANK: Record<Priority, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};

type SortKey = "due-asc" | "due-desc" | "priority-desc" | "recent";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "due-asc", label: "Due date (earliest)" },
  { value: "due-desc", label: "Due date (latest)" },
  { value: "priority-desc", label: "Priority (high→low)" },
  { value: "recent", label: "Recently added" },
];

// --------------------------- helpers ------------------------------------

function isOverdue(task: Task): boolean {
  if (task.completed) return false;
  return task.dueDate < todayISO();
}

function isDueToday(task: Task): boolean {
  return task.dueDate === todayISO();
}

interface FormState {
  title: string;
  description: string;
  category: TaskCategory;
  priority: Priority;
  dueDate: string;
}

const emptyFormState: FormState = {
  title: "",
  description: "",
  category: "Academics",
  priority: "Medium",
  dueDate: todayISO(),
};

function formStateFromTask(task: Task): FormState {
  return {
    title: task.title,
    description: task.description,
    category: task.category,
    priority: task.priority,
    dueDate: task.dueDate,
  };
}

function formStateToInput(state: FormState): TaskInput {
  return {
    title: state.title.trim(),
    description: state.description.trim(),
    category: state.category,
    priority: state.priority,
    dueDate: state.dueDate,
  };
}

// --------------------------- small Field wrapper -----------------------

function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-medium">
        {label}
        {required ? (
          <span className="ml-0.5 text-destructive">*</span>
        ) : null}
      </Label>
      {children}
      {hint && !error ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

// --------------------------- task form dialog ---------------------------

function TaskFormDialog({
  open,
  onOpenChange,
  mode,
  task,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  task?: Task;
  onSubmit: (state: FormState) => void;
}) {
  const [state, setState] = React.useState<FormState>(emptyFormState);
  const [error, setError] = React.useState<string | undefined>(undefined);

  // (Re)seed the form whenever the dialog opens.
  React.useEffect(() => {
    if (open) {
      setState(task ? formStateFromTask(task) : emptyFormState);
      setError(undefined);
    }
  }, [open, task]);

  const titleInvalid = state.title.trim().length === 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (titleInvalid) {
      setError("Title is required");
      return;
    }
    setError(undefined);
    onSubmit(state);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add task" : "Edit task"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Capture an assignment or to-do so you don't forget it."
              : "Update the details of this task."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <Field
            label="Title"
            htmlFor="task-title"
            required
            error={error}
          >
            <Input
              id="task-title"
              value={state.title}
              onChange={(e) => {
                setState((s) => ({ ...s, title: e.target.value }));
                if (error) setError(undefined);
              }}
              placeholder="e.g. Submit Java assignment"
              autoFocus
              aria-invalid={!!error}
              maxLength={120}
            />
          </Field>

          <Field label="Description" htmlFor="task-desc">
            <Textarea
              id="task-desc"
              value={state.description}
              onChange={(e) =>
                setState((s) => ({ ...s, description: e.target.value }))
              }
              placeholder="Optional notes (what, where, link…)"
              rows={3}
              maxLength={500}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Category" htmlFor="task-category">
              <Select
                value={state.category}
                onValueChange={(v) =>
                  setState((s) => ({ ...s, category: v as TaskCategory }))
                }
              >
                <SelectTrigger id="task-category" className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {TASK_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Priority" htmlFor="task-priority">
              <Select
                value={state.priority}
                onValueChange={(v) =>
                  setState((s) => ({ ...s, priority: v as Priority }))
                }
              >
                <SelectTrigger id="task-priority" className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Due date" htmlFor="task-due">
            <Input
              id="task-due"
              type="date"
              value={state.dueDate}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  dueDate: e.target.value || todayISO(),
                }))
              }
            />
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={titleInvalid}>
              {mode === "add" ? (
                <>
                  <Plus className="size-4" />
                  Add task
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------- skeleton -----------------------------------

function TasksSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 border-2 border-[var(--pixel-line)] pixel-shadow-sm" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-44" />
          </div>
        </div>
        <Skeleton className="h-9 w-28 border-2 border-[var(--pixel-line)] pixel-shadow-sm" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="gap-0 p-5 py-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-9 w-9 border-2 border-[var(--pixel-line)]" />
            </div>
            <Skeleton className="mt-3 h-8 w-20" />
            <Skeleton className="mt-1 h-3 w-24" />
          </Card>
        ))}
      </div>

      <Card className="gap-0 p-3 sm:p-4 py-3 sm:py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full border-2 border-[var(--pixel-line)] pixel-shadow-sm" />
          ))}
        </div>
      </Card>

      <Card className="gap-0 py-0 divide-y-2 divide-[var(--pixel-line)]/40">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-4">
            <Skeleton className="mt-1 size-4 border-2 border-[var(--pixel-line)]" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
            <div className="flex gap-1">
              <Skeleton className="h-8 w-8 border-2 border-[var(--pixel-line)]" />
              <Skeleton className="h-8 w-8 border-2 border-[var(--pixel-line)]" />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// --------------------------- main view ----------------------------------

export function TasksView() {
  const hydrated = useHydrated();
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    clearCompleted,
  } = useTaskStore();

  // filter / search / sort state
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<
    "all" | TaskCategory
  >("all");
  const [priorityFilter, setPriorityFilter] = React.useState<"all" | Priority>(
    "all"
  );
  const [sort, setSort] = React.useState<SortKey>("due-asc");

  // dialog state
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | undefined>(
    undefined
  );

  // ---- stats ----
  const total = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = total - completedCount;
  const overdueCount = tasks.filter(isOverdue).length;
  const dueTodayCount = tasks.filter(
    (t) => !t.completed && isDueToday(t)
  ).length;

  // ---- derived filtered + sorted list ----
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = tasks.filter((t) => {
      if (categoryFilter !== "all" && t.category !== categoryFilter)
        return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter)
        return false;
      if (q) {
        const hay = `${t.title}\n${t.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      switch (sort) {
        case "due-asc":
          // earlier dates first; overdue (past) dates naturally sort before today
          return a.dueDate.localeCompare(b.dueDate);
        case "due-desc":
          return b.dueDate.localeCompare(a.dueDate);
        case "priority-desc":
          return PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
        case "recent":
          return b.createdAt.localeCompare(a.createdAt);
        default:
          return 0;
      }
    });
  }, [tasks, search, categoryFilter, priorityFilter, sort]);

  const hasActiveFilters =
    search.trim() !== "" ||
    categoryFilter !== "all" ||
    priorityFilter !== "all";

  function resetFilters() {
    setSearch("");
    setCategoryFilter("all");
    setPriorityFilter("all");
    setSort("due-asc");
  }

  function openAdd() {
    setEditingTask(undefined);
    setDialogOpen(true);
  }
  function openEdit(task: Task) {
    setEditingTask(task);
    setDialogOpen(true);
  }

  function handleSubmit(state: FormState) {
    const input = formStateToInput(state);
    if (editingTask) {
      updateTask(editingTask.id, input);
      toast.success("Task updated");
    } else {
      addTask(input);
      toast.success("Task added");
    }
    setDialogOpen(false);
    setEditingTask(undefined);
  }

  function handleToggle(task: Task) {
    const next = !task.completed;
    toggleTask(task.id);
    toast.success(next ? "Task completed" : "Marked pending");
  }

  function handleDelete(id: string) {
    deleteTask(id);
    toast.success("Task deleted");
  }

  function handleClearCompleted() {
    const n = completedCount;
    if (n === 0) return;
    clearCompleted();
    toast.success(
      `${n} completed task${n === 1 ? "" : "s"} cleared`
    );
  }

  // SSR-safe placeholder until the persisted store hydrates.
  if (!hydrated) return <TasksSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <ModuleHeader
        icon={<ListTodo className="h-5 w-5" />}
        title="Tasks"
        description="Your assignments and to-dos"
        actions={
          <>
            {completedCount > 0 ? (
              <Button
                variant="ghost"
                onClick={handleClearCompleted}
                aria-label="Clear completed tasks"
              >
                <Eraser className="size-4" />
                Clear completed
              </Button>
            ) : null}
            <Button onClick={openAdd}>
              <Plus className="size-4" />
              Add task
            </Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={<ClipboardList className="h-4 w-4" />}
          label="Total"
          value={total}
          sub={`${pendingCount} pending · ${completedCount} done`}
          tone="primary"
          display
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="Pending"
          value={pendingCount}
          sub={`${dueTodayCount} due today`}
          tone="amber"
          display
        />
        <StatCard
          icon={<CheckCircle className="h-4 w-4" />}
          label="Completed"
          value={completedCount}
          sub={
            total === 0
              ? "—"
              : `${Math.round((completedCount / total) * 100)}%`
          }
          tone="teal"
          display
        />
        <StatCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Overdue"
          value={overdueCount}
          sub={overdueCount === 0 ? "All good" : "Needs attention"}
          tone="rose"
          display
        />
      </div>

      {/* Controls */}
      <Card className="gap-0 p-3 sm:p-4 py-3 sm:py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks…"
              aria-label="Search tasks"
              className="pl-8"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 border-2 border-transparent p-1 text-muted-foreground hover:border-[var(--pixel-line)] hover:bg-muted hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>

          {/* Category filter */}
          <Select
            value={categoryFilter}
            onValueChange={(v) =>
              setCategoryFilter(v as "all" | TaskCategory)
            }
          >
            <SelectTrigger className="w-full" aria-label="Filter by category">
              <Filter className="size-3.5 text-muted-foreground" />
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {TASK_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Priority filter */}
          <Select
            value={priorityFilter}
            onValueChange={(v) =>
              setPriorityFilter(v as "all" | Priority)
            }
          >
            <SelectTrigger className="w-full" aria-label="Filter by priority">
              <Filter className="size-3.5 text-muted-foreground" />
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select
            value={sort}
            onValueChange={(v) => setSort(v as SortKey)}
          >
            <SelectTrigger className="w-full" aria-label="Sort tasks">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active-filters indicator + reset */}
        {hasActiveFilters ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              Showing{" "}
              <span className="font-medium text-foreground">
                {filtered.length}
              </span>{" "}
              of {total} task{total === 1 ? "" : "s"}
            </span>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              <X className="size-3" />
              Reset filters
            </button>
          </div>
        ) : null}
      </Card>

      {/* Task list / empty states */}
      {total === 0 ? (
        <EmptyState
          icon={<ListTodo className="h-6 w-6" />}
          title="No tasks yet"
          description="Add your first assignment or to-do to start tracking what's due."
          action={
            <Button onClick={openAdd}>
              <Plus className="size-4" />
              Add your first task
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="h-6 w-6" />}
          title="No tasks match"
          description="Try adjusting your search or filters to find what you're looking for."
          action={
            <Button variant="outline" onClick={resetFilters}>
              Reset filters
            </Button>
          }
        />
      ) : (
        <Card className="gap-0 py-0">
          <ul className="divide-y-2 divide-[var(--pixel-line)]/40">
            {filtered.map((task) => {
              const overdue = isOverdue(task);
              const dueToday = !task.completed && isDueToday(task);
              const prio = PRIORITY_STYLES[task.priority];
              const catStyle = TASK_CATEGORY_STYLES[task.category];
              const rel = relativeDay(task.dueDate);
              const relTone = overdue
                ? "text-rose-600 dark:text-rose-300"
                : dueToday
                  ? "text-amber-600 dark:text-amber-300"
                  : "text-muted-foreground";

              return (
                <li
                  key={task.id}
                  className={cn(
                    "flex items-start gap-3 p-4 transition-colors hover:bg-accent/40",
                    task.completed && "opacity-70"
                  )}
                >
                  {/* Toggle complete */}
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => handleToggle(task)}
                    aria-label={
                      task.completed
                        ? `Mark "${task.title}" as pending`
                        : `Mark "${task.title}" as completed`
                    }
                    className="mt-0.5"
                  />

                  {/* Body */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      {task.completed ? (
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                      ) : (
                        <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      )}
                      <p
                        className={cn(
                          "text-sm font-bold leading-snug",
                          task.completed &&
                            "line-through text-muted-foreground"
                        )}
                      >
                        {task.title}
                      </p>
                    </div>

                    {task.description ? (
                      <p
                        className={cn(
                          "mt-1 line-clamp-2 text-sm text-muted-foreground",
                          task.completed && "line-through"
                        )}
                      >
                        {task.description}
                      </p>
                    ) : null}

                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className={cn("font-medium", catStyle)}
                      >
                        {task.category}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn("font-medium", prio.className)}
                      >
                        <span
                          className={cn("h-2 w-2", prio.dot)}
                        />
                        {prio.label}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-medium",
                          overdue
                            ? "border-rose-500/25 text-rose-600 dark:text-rose-300"
                            : "text-muted-foreground"
                        )}
                      >
                        <CalendarDays className="size-3" />
                        {formatDate(task.dueDate)}
                        {rel ? (
                          <span className={cn("font-normal", relTone)}>
                            ({rel})
                          </span>
                        ) : null}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 border-2 border-transparent hover:border-[var(--pixel-line)] hover:bg-muted"
                      onClick={() => openEdit(task)}
                      aria-label={`Edit task "${task.title}"`}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <ConfirmDialog
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 border-2 border-transparent text-muted-foreground hover:border-[var(--pixel-line)] hover:bg-muted hover:text-destructive"
                          aria-label={`Delete task "${task.title}"`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      }
                      title="Delete task?"
                      description={`"${task.title}" will be permanently removed.`}
                      onConfirm={() => handleDelete(task.id)}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <TaskFormDialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditingTask(undefined);
        }}
        mode={editingTask ? "edit" : "add"}
        task={editingTask}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default TasksView;
