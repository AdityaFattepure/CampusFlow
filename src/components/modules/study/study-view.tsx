"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  Target,
  CalendarDays,
  TrendingUp,
  CheckCircle2,
  Circle,
  Flame,
} from "lucide-react";

import { useStudyStore } from "@/lib/stores";
import type { StudyGoal, Priority, StudyGoalInput } from "@/lib/types";
import {
  formatDate,
  relativeDay,
  todayISO,
  daysFromTodayISO,
  PRIORITY_STYLES,
} from "@/lib/format";
import { useHydrated } from "@/hooks/use-hydrated";

import { ModuleHeader } from "@/components/shared/module-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";

// --------------------------- form helpers ---------------------------

interface GoalFormState {
  subject: string;
  topic: string;
  priority: Priority;
  targetDate: string;
  progress: number;
}

const PRIORITIES: Priority[] = ["Low", "Medium", "High"];

type SortKey = "targetDate" | "progress" | "priority";

const PRIORITY_RANK: Record<Priority, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

function emptyForm(): GoalFormState {
  return {
    subject: "",
    topic: "",
    priority: "Medium",
    targetDate: daysFromTodayISO(7),
    progress: 0,
  };
}

function goalToForm(g: StudyGoal): GoalFormState {
  return {
    subject: g.subject,
    topic: g.topic,
    priority: g.priority,
    targetDate: g.targetDate,
    progress: g.progress,
  };
}

/** A goal is "due this week" if its target date falls within the next 7 days
 * (inclusive of today) and it is not yet completed. */
function isDueThisWeek(g: StudyGoal): boolean {
  if (g.completed) return false;
  const today = todayISO();
  const week = daysFromTodayISO(7);
  return g.targetDate >= today && g.targetDate <= week;
}

function sortGoals(goals: StudyGoal[], key: SortKey): StudyGoal[] {
  const arr = [...goals];
  switch (key) {
    case "progress":
      return arr.sort(
        (a, b) => b.progress - a.progress || a.targetDate.localeCompare(b.targetDate)
      );
    case "priority":
      return arr.sort(
        (a, b) =>
          PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
          a.targetDate.localeCompare(b.targetDate)
      );
    case "targetDate":
    default:
      return arr.sort(
        (a, b) =>
          a.targetDate.localeCompare(b.targetDate) || b.progress - a.progress
      );
  }
}

// --------------------------- form dialog ---------------------------

function GoalFormDialog({
  open,
  onOpenChange,
  mode,
  initial,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "add" | "edit";
  initial: GoalFormState;
  onSubmit: (form: GoalFormState) => void;
}) {
  const [form, setForm] = React.useState<GoalFormState>(initial);
  const [error, setError] = React.useState<string | null>(null);

  // Re-seed the local form whenever the dialog (re-)opens or the seeded
  // initial value changes (e.g. switching edit targets). While open and the
  // user is typing, `initial` stays referentially stable so this effect does
  // not fire and wipe their input.
  React.useEffect(() => {
    if (open) {
      setForm(initial);
      setError(null);
    }
  }, [open, initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = form.subject.trim();
    const topic = form.topic.trim();
    if (!subject) {
      setError("Subject is required.");
      return;
    }
    if (!topic) {
      setError("Topic is required.");
      return;
    }
    setError(null);
    onSubmit({ ...form, subject, topic });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add study goal" : "Edit study goal"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Set a subject, topic, priority and target date to start tracking progress."
              : "Update the details of your study goal."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goal-subject">Subject</Label>
            <Input
              id="goal-subject"
              value={form.subject}
              placeholder="e.g. Java, DBMS, OS"
              onChange={(e) =>
                setForm((f) => ({ ...f, subject: e.target.value }))
              }
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-topic">Topic</Label>
            <Input
              id="goal-topic"
              value={form.topic}
              placeholder="e.g. Collections Framework"
              onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, priority: v as Priority }))
                }
              >
                <SelectTrigger className="w-full" aria-label="Priority">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-date">Target date</Label>
              <Input
                id="goal-date"
                type="date"
                value={form.targetDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, targetDate: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Progress</Label>
              <span className="text-sm font-medium tabular-nums">
                {form.progress}%
              </span>
            </div>
            <Slider
              value={[form.progress]}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, progress: v[0] ?? 0 }))
              }
              min={0}
              max={100}
              step={1}
              aria-label="Goal progress"
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {mode === "add" ? "Add goal" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------- goal card ---------------------------

function GoalCard({
  goal,
  onProgressChange,
  onToggle,
  onEdit,
  onDelete,
}: {
  goal: StudyGoal;
  onProgressChange: (value: number) => void;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const priorityStyle = PRIORITY_STYLES[goal.priority];
  const overdue = !goal.completed && goal.targetDate < todayISO();
  const rel = relativeDay(goal.targetDate);
  const ariaLabel = `${goal.subject}: ${goal.topic}`;

  return (
    <Card className={goal.completed ? "gap-4 p-5 opacity-70" : "gap-4 p-5"}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-bold">{goal.subject}</h3>
            <Badge
              variant="outline"
              className={`gap-1 ${priorityStyle.className}`}
            >
              <span
                className={`h-2 w-2 ${priorityStyle.dot}`}
                aria-hidden="true"
              />
              {priorityStyle.label}
            </Badge>
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {goal.topic}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            aria-label={`Edit goal ${ariaLabel}`}
            className="border-2 border-transparent hover:border-[var(--pixel-line)] hover:bg-muted"
          >
            <Pencil className="size-4" />
          </Button>
          <ConfirmDialog
            trigger={
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Delete goal ${ariaLabel}`}
                className="border-2 border-transparent hover:border-[var(--pixel-line)] hover:bg-muted"
              >
                <Trash2 className="size-4" />
              </Button>
            }
            title="Delete study goal?"
            description={`"${goal.subject} — ${goal.topic}" will be permanently removed.`}
            confirmLabel="Delete"
            onConfirm={onDelete}
          />
        </div>
      </div>

      {/* Progress display */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          {goal.completed ? (
            <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" /> Completed
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Circle className="size-4" /> In progress
            </span>
          )}
          <span className="font-medium tabular-nums">{goal.progress}%</span>
        </div>
        <Progress value={goal.progress} className="h-2" />
      </div>

      {/* Interactive slider (only when not completed) */}
      {!goal.completed ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Adjust progress</span>
            <span className="tabular-nums">{goal.progress}%</span>
          </div>
          <Slider
            value={[goal.progress]}
            onValueChange={(v) => onProgressChange(v[0] ?? 0)}
            min={0}
            max={100}
            step={1}
            aria-label={`Progress for ${ariaLabel}`}
          />
        </div>
      ) : null}

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2 text-sm">
          <CalendarDays
            className="size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="text-muted-foreground">
            {formatDate(goal.targetDate)}
          </span>
          <Badge
            variant="outline"
            className={
              overdue
                ? "border-rose-500/25 bg-rose-500/12 font-bold text-rose-600 dark:text-rose-300"
                : "border-border bg-muted text-muted-foreground"
            }
          >
            {rel}
          </Badge>
        </div>

        <Button
          variant={goal.completed ? "outline" : "secondary"}
          size="sm"
          onClick={onToggle}
          aria-label={
            goal.completed
              ? `Reopen goal ${ariaLabel}`
              : `Mark goal ${ariaLabel} complete`
          }
        >
          {goal.completed ? (
            <>
              <Circle /> Reopen
            </>
          ) : (
            <>
              <CheckCircle2 /> Mark complete
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}

// --------------------------- skeleton ---------------------------

function StudySkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 animate-pulse border-2 border-[var(--pixel-line)] bg-muted pixel-shadow-sm" />
          <div className="space-y-2">
            <div className="h-5 w-40 animate-pulse bg-muted" />
            <div className="h-3 w-56 animate-pulse bg-muted" />
          </div>
        </div>
        <div className="h-9 w-28 animate-pulse border-2 border-[var(--pixel-line)] bg-muted pixel-shadow-sm" />
      </div>
      <div className="h-28 animate-pulse border-2 border-[var(--pixel-line)] bg-card pixel-shadow-sm" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse border-2 border-[var(--pixel-line)] bg-card pixel-shadow-sm"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-52 animate-pulse border-2 border-[var(--pixel-line)] bg-card pixel-shadow"
          />
        ))}
      </div>
    </div>
  );
}

// --------------------------- main view ---------------------------

export function StudyView() {
  const hydrated = useHydrated();
  const { goals, addGoal, updateGoal, deleteGoal, setProgress, toggleGoal } =
    useStudyStore();

  const [addOpen, setAddOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<StudyGoal | null>(null);
  const [subjectFilter, setSubjectFilter] = React.useState<string>("all");
  const [sortKey, setSortKey] = React.useState<SortKey>("targetDate");

  // Stable default form for the "Add" dialog (computed once).
  const addInitial = React.useMemo(() => emptyForm(), []);
  // Re-seed form whenever a different goal is opened for editing.
  const editInitial = React.useMemo(
    () => (editTarget ? goalToForm(editTarget) : emptyForm()),
    [editTarget]
  );

  const subjects = React.useMemo(
    () =>
      Array.from(new Set(goals.map((g) => g.subject))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [goals]
  );

  const visibleGoals = React.useMemo(() => {
    const filtered =
      subjectFilter === "all"
        ? goals
        : goals.filter((g) => g.subject === subjectFilter);
    return sortGoals(filtered, sortKey);
  }, [goals, subjectFilter, sortKey]);

  const overall = React.useMemo(() => {
    if (goals.length === 0) return 0;
    const sum = goals.reduce((acc, g) => acc + g.progress, 0);
    return Math.round(sum / goals.length);
  }, [goals]);

  const activeCount = goals.filter((g) => !g.completed).length;
  const completedCount = goals.filter((g) => g.completed).length;
  const dueThisWeek = goals.filter(isDueThisWeek).length;

  const handleAdd = (form: GoalFormState) => {
    const payload: StudyGoalInput = {
      subject: form.subject,
      topic: form.topic,
      priority: form.priority,
      targetDate: form.targetDate,
      progress: form.progress,
      ...(form.progress >= 100 ? { completed: true } : {}),
    };
    addGoal(payload);
    setAddOpen(false);
    toast.success("Goal added");
  };

  const handleEdit = (form: GoalFormState) => {
    if (!editTarget) return;
    // Sync `completed` with progress: reaching 100% marks complete, anything
    // below 100% preserves the prior completed state (a manual override
    // stays intact unless the user explicitly drags to 100).
    const patch: Partial<StudyGoalInput> = {
      subject: form.subject,
      topic: form.topic,
      priority: form.priority,
      targetDate: form.targetDate,
      progress: form.progress,
      completed: form.progress >= 100 ? true : editTarget.completed,
    };
    updateGoal(editTarget.id, patch);
    setEditTarget(null);
    toast.success("Goal updated");
  };

  const handleProgressChange = (goal: StudyGoal, value: number) => {
    const wasCompleted = goal.completed;
    setProgress(goal.id, value);
    if (!wasCompleted && value >= 100) {
      toast.success("Goal completed 🎉");
    }
  };

  const handleToggle = (goal: StudyGoal) => {
    toggleGoal(goal.id);
    if (!goal.completed) {
      toast.success("Goal completed 🎉");
    }
  };

  const handleDelete = (goal: StudyGoal) => {
    deleteGoal(goal.id);
    toast.success("Goal deleted");
  };

  if (!hydrated) {
    return <StudySkeleton />;
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={<GraduationCap className="size-5" />}
        title="Study Planner"
        description="Track your study goals & progress"
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus /> Add Goal
          </Button>
        }
      />

      {/* Featured overall progress */}
      <Card className="gap-0 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Overall Study Progress
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-3xl text-primary">
                {overall}%
              </span>
              <span className="text-sm text-muted-foreground">
                across {goals.length}{" "}
                {goals.length === 1 ? "goal" : "goals"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start border-2 border-[var(--pixel-line)] bg-primary/15 px-3 py-1.5 text-primary pixel-shadow-sm sm:self-auto">
            <TrendingUp className="size-4" aria-hidden="true" />
            <span className="text-xs font-bold">
              {completedCount}/{goals.length} done
            </span>
          </div>
        </div>
        <Progress value={overall} className="mt-4 h-2.5" />
        {/* Pixel HP-bar: 20 segments, lit by overall %. */}
        <div className="pixel-segments mt-3" aria-hidden>
          {Array.from({ length: 20 }).map((_, i) => (
            <i key={i} className={i < Math.round(overall / 5) ? "on" : ""} />
          ))}
        </div>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          icon={<TrendingUp className="size-4" />}
          label="Overall Progress"
          value={`${overall}%`}
          tone="primary"
          sub="avg across goals"
          display
        />
        <StatCard
          icon={<Target className="size-4" />}
          label="Active Goals"
          value={activeCount}
          tone="amber"
          sub="in progress"
          display
        />
        <StatCard
          icon={<CheckCircle2 className="size-4" />}
          label="Completed"
          value={completedCount}
          tone="teal"
          sub="done"
          display
        />
        <StatCard
          icon={<Flame className="size-4" />}
          label="Due This Week"
          value={dueThisWeek}
          tone="rose"
          sub="next 7 days"
          display
        />
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filter by subject">
            <SelectValue placeholder="All subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subjects</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
          <SelectTrigger className="w-full sm:w-[180px]" aria-label="Sort goals">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="targetDate">Sort: Target date</SelectItem>
            <SelectItem value="progress">Sort: Progress</SelectItem>
            <SelectItem value="priority">Sort: Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Goals list */}
      {visibleGoals.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="size-5" />}
          title="No study goals yet"
          description="Add your first study goal to start tracking progress towards your exams and deadlines."
          action={
            <Button onClick={() => setAddOpen(true)}>
              <Plus /> Add Goal
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {visibleGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onProgressChange={(v) => handleProgressChange(goal, v)}
              onToggle={() => handleToggle(goal)}
              onEdit={() => setEditTarget(goal)}
              onDelete={() => handleDelete(goal)}
            />
          ))}
        </div>
      )}

      {/* Add dialog */}
      <GoalFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        mode="add"
        initial={addInitial}
        onSubmit={handleAdd}
      />

      {/* Edit dialog */}
      <GoalFormDialog
        open={editTarget !== null}
        onOpenChange={(v) => {
          if (!v) setEditTarget(null);
        }}
        mode="edit"
        initial={editInitial}
        onSubmit={handleEdit}
      />
    </div>
  );
}
