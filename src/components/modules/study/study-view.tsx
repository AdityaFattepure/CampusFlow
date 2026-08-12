"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  CalendarDays,
  CheckCircle2,
  Flame,
  Clock,
  Play,
  AlertTriangle,
  TrendingUp,
  History,
} from "lucide-react";

import { useStudyStore } from "@/lib/stores";
import type { StudyGoal, Priority, StudyGoalInput } from "@/lib/types";
import {
  formatDate,
  relativeDay,
  todayISO,
  daysFromTodayISO,
  daysBetween,
  formatDuration,
  formatHours,
  planStats,
  PRIORITY_STYLES,
} from "@/lib/format";
import { useHydrated } from "@/hooks/use-hydrated";

import { ModuleHeader } from "@/components/shared/module-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const PRIORITIES: Priority[] = ["Low", "Medium", "High"];

export function StudyView() {
  const hydrated = useHydrated();
  const goals = useStudyStore((s) => s.goals);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<StudyGoal | null>(null);

  const stats = useMemo(() => {
    const active = goals.filter((g) => !planStats(g).isComplete);
    const behind = goals.filter((g) => {
      const p = planStats(g);
      return !p.isComplete && !p.onTrack;
    });
    const minutesToday = goals.reduce(
      (s, g) => s + planStats(g).minutesToday,
      0
    );
    const dailyGoalTotal = goals
      .filter((g) => {
        const p = planStats(g);
        return !p.isComplete && p.hasStarted;
      })
      .reduce((s, g) => s + g.dailyMinutesGoal, 0);
    const overallPercent =
      goals.length === 0
        ? 0
        : Math.round(
            goals.reduce((s, g) => s + planStats(g).percent, 0) / goals.length
        );
    return {
      activeCount: active.length,
      behindCount: behind.length,
      minutesToday,
      dailyGoalTotal,
      overallPercent,
      total: goals.length,
    };
  }, [goals]);

  if (!hydrated) return <StudySkeleton />;

  const openAdd = () => {
    setEditingGoal(null);
    setPlanDialogOpen(true);
  };
  const openEdit = (g: StudyGoal) => {
    setEditingGoal(g);
    setPlanDialogOpen(true);
  };

  return (
    <div className="space-y-5">
      <ModuleHeader
        icon={<GraduationCap className="h-5 w-5" />}
        title="Study Planner"
        description="Commit to a daily time goal. Log sessions. Stay on track."
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" /> New plan
          </Button>
        }
      />

      {/* Featured overall */}
      <Card className="overflow-hidden">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              Overall progress
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl text-primary">
                {stats.overallPercent}%
              </span>
              <span className="text-sm text-muted-foreground">
                across {stats.total} plan{stats.total === 1 ? "" : "s"}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>
                <span className="font-bold text-foreground">
                  {formatDuration(stats.minutesToday)}
                </span>{" "}
                studied today
              </span>
              <span>
                goal:{" "}
                <span className="font-bold text-foreground">
                  {formatDuration(stats.dailyGoalTotal)}
                </span>
                /day
              </span>
              <span>
                <span className="font-bold text-destructive">
                  {stats.behindCount}
                </span>{" "}
                behind
              </span>
            </div>
          </div>
          <div className="w-full sm:w-64">
            <Progress value={stats.overallPercent} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Stat row */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="Today"
          value={formatDuration(stats.minutesToday)}
          tone="primary"
          display={false}
          sub={`goal ${formatDuration(stats.dailyGoalTotal)}/day`}
        />
        <StatCard
          icon={<Play className="h-4 w-4" />}
          label="Active"
          value={stats.activeCount}
          tone="teal"
          display
          sub={`${stats.total} total plans`}
        />
        <StatCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Behind"
          value={stats.behindCount}
          tone="rose"
          display
          sub="need a session"
        />
        <StatCard
          icon={<Flame className="h-4 w-4" />}
          label="Overall"
          value={`${stats.overallPercent}%`}
          tone="amber"
          display
          sub="all plans"
        />
      </div>

      {/* Plan cards */}
      {goals.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="h-5 w-5" />}
          title="No study plans yet"
          description="Create a plan like 'Learn DSA in 2 months' with a daily time goal. CampusFlow tracks your sessions and tells you if you're on track."
          action={
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4" /> Create your first plan
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {goals.map((g) => (
            <PlanCard
              key={g.id}
              goal={g}
              onEdit={() => openEdit(g)}
            />
          ))}
        </div>
      )}

      <PlanFormDialog
        open={planDialogOpen}
        onOpenChange={setPlanDialogOpen}
        editing={editingGoal}
      />
    </div>
  );
}

/* ----------------------------- Plan card ----------------------------- */

function PlanCard({ goal, onEdit }: { goal: StudyGoal; onEdit: () => void }) {
  const deleteGoal = useStudyStore((s) => s.deleteGoal);
  const [logOpen, setLogOpen] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const p = useMemo(() => planStats(goal), [goal]);

  const statusTone = p.isComplete
    ? { label: "Complete", cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30" }
    : p.onTrack
      ? { label: "On track", cls: "bg-primary/15 text-primary border-primary/30" }
      : { label: "Behind", cls: "bg-destructive/15 text-destructive border-destructive/30" };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 border-b-2 border-[var(--pixel-line)]">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold">{goal.subject}</h3>
            <Badge variant="outline" className={PRIORITY_STYLES[goal.priority].className}>
              <span className={`h-1.5 w-1.5 ${PRIORITY_STYLES[goal.priority].dot}`} />
              {goal.priority}
            </Badge>
            <Badge variant="outline" className={statusTone.cls}>
              {statusTone.label}
            </Badge>
          </div>
          <p className="truncate text-sm text-muted-foreground">{goal.topic}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 border-2 border-transparent hover:border-[var(--pixel-line)] hover:bg-muted"
            onClick={onEdit}
            aria-label="Edit plan"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <ConfirmDialog
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 border-2 border-transparent hover:border-[var(--pixel-line)] hover:bg-muted hover:text-destructive"
                aria-label="Delete plan"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            }
            title="Delete this study plan?"
            description={`"${goal.subject} — ${goal.topic}" and all its logged sessions will be removed.`}
            onConfirm={() => {
              deleteGoal(goal.id);
              toast.success("Plan deleted");
            }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* Timeline */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{formatDate(goal.startDate)}</span>
            <span className="font-bold">
              {p.isComplete
                ? "Finished"
                : p.hasStarted
                  ? `Day ${p.daysElapsed}/${p.totalDays}`
                  : "Starts " + relativeDay(goal.startDate)}
            </span>
            <span>{formatDate(goal.targetDate)}</span>
          </div>
          <div className="relative h-3 border-2 border-[var(--pixel-line)] bg-muted">
            {/* expected-by-today marker */}
            {p.hasStarted && !p.isComplete && p.totalDays > 0 && (
              <div
                className="absolute top-0 h-full w-[2px] bg-[var(--pixel-line)] opacity-60"
                style={{ left: `${(p.daysElapsed / p.totalDays) * 100}%` }}
                aria-hidden
              />
            )}
            <div
              className="h-full bg-primary"
              style={{ width: `${p.percent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">
              {p.daysRemaining > 0 ? `${p.daysRemaining} days left` : "Deadline passed"}
            </span>
            <span className="font-bold">{p.percent}% done</span>
          </div>
        </div>

        {/* Today + Log */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span className="font-bold">
                {formatDuration(p.minutesToday)}
              </span>
              <span className="text-muted-foreground">
                / {formatDuration(goal.dailyMinutesGoal)} today
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Daily goal: {formatHours(goal.dailyMinutesGoal)} ·{" "}
              {p.streak > 0 ? (
                <span className="font-bold text-amber-600 dark:text-amber-300">
                  <Flame className="mr-0.5 inline h-3 w-3" />
                  {p.streak}-day streak
                </span>
              ) : (
                "no streak yet"
              )}
            </div>
          </div>
          <Button size="sm" onClick={() => setLogOpen(true)}>
            <Plus className="h-4 w-4" /> Log session
          </Button>
        </div>

        {/* Total + deficit */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="border-2 border-[var(--pixel-line)] bg-muted/40 p-2">
            <div className="text-muted-foreground">Done</div>
            <div className="font-bold tabular-nums">
              {formatDuration(p.minutesDone)}
            </div>
            <div className="text-muted-foreground">
              of {formatDuration(p.totalMinutesGoal)}
            </div>
          </div>
          <div
            className={cn(
              "border-2 p-2",
              p.deficitMinutes > 0
                ? "border-destructive/40 bg-destructive/8"
                : "border-[var(--pixel-line)] bg-muted/40"
            )}
          >
            <div className="text-muted-foreground">
              {p.onTrack ? "Ahead by" : "Behind by"}
            </div>
            <div
              className={cn(
                "font-bold tabular-nums",
                p.onTrack ? "text-primary" : "text-destructive"
              )}
            >
              {formatDuration(
                p.onTrack
                  ? p.minutesDone - p.expectedMinutesByToday
                  : p.deficitMinutes
              )}
            </div>
            <div className="text-muted-foreground">vs daily plan</div>
          </div>
        </div>

        {/* Sessions log (collapsible) */}
        {goal.sessions.length > 0 ? (
          <Collapsible open={sessionsOpen} onOpenChange={setSessionsOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex w-full items-center justify-between border-2 border-[var(--pixel-line)] bg-card px-3 py-2 text-xs font-semibold transition-colors hover:bg-muted">
                <span className="flex items-center gap-2">
                  <History className="h-3.5 w-3.5 text-muted-foreground" />
                  {goal.sessions.length} session
                  {goal.sessions.length === 1 ? "" : "s"} logged
                </span>
                <span className="text-muted-foreground">
                  {sessionsOpen ? "Hide" : "View"}
                </span>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="mt-2 max-h-40 divide-y-2 divide-[var(--pixel-line)]/30 overflow-y-auto border-2 border-[var(--pixel-line)] bg-card">
                {goal.sessions.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between px-3 py-2 text-xs"
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-semibold">{formatDate(s.date)}</span>
                      <span className="text-muted-foreground">
                        {relativeDay(s.date)}
                      </span>
                      {s.note ? (
                        <span className="truncate text-muted-foreground">
                          · {s.note}
                        </span>
                      ) : null}
                    </span>
                    <span className="font-bold tabular-nums text-primary">
                      {formatDuration(s.minutes)}
                    </span>
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        ) : null}
      </CardContent>

      <LogSessionDialog
        open={logOpen}
        onOpenChange={setLogOpen}
        goalId={goal.id}
        subject={goal.subject}
        dailyGoal={goal.dailyMinutesGoal}
      />
    </Card>
  );
}

/* --------------------------- Plan form ------------------------------ */

function PlanFormDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: StudyGoal | null;
}) {
  const addGoal = useStudyStore((s) => s.addGoal);
  const updateGoal = useStudyStore((s) => s.updateGoal);

  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [startDate, setStartDate] = useState(todayISO());
  const [targetDate, setTargetDate] = useState(daysFromTodayISO(60));
  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(0);
  const [priority, setPriority] = useState<Priority>("Medium");
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    if (editing) {
      setSubject(editing.subject);
      setTopic(editing.topic);
      setStartDate(editing.startDate);
      setTargetDate(editing.targetDate);
      setHours(Math.floor(editing.dailyMinutesGoal / 60));
      setMinutes(editing.dailyMinutesGoal % 60);
      setPriority(editing.priority);
    } else {
      setSubject("");
      setTopic("");
      setStartDate(todayISO());
      setTargetDate(daysFromTodayISO(60));
      setHours(1);
      setMinutes(0);
      setPriority("Medium");
    }
    setError(null);
  }, [open, editing]);

  const dailyMinutes = hours * 60 + minutes;

  const submit = () => {
    if (!subject.trim()) return setError("Give your plan a subject (e.g. DSA).");
    if (!topic.trim()) return setError("Describe what you're learning.");
    if (!startDate || !targetDate)
      return setError("Pick a start and target date.");
    if (daysBetween(startDate, targetDate) <= 0)
      return setError("Target date must be after the start date.");
    if (dailyMinutes <= 0)
      return setError("Set a daily time goal (at least 15 minutes).");

    const input: StudyGoalInput = {
      subject: subject.trim(),
      topic: topic.trim(),
      startDate,
      targetDate,
      dailyMinutesGoal: dailyMinutes,
      priority,
    };
    if (editing) {
      updateGoal(editing.id, input);
      toast.success("Plan updated");
    } else {
      addGoal(input);
      toast.success("Study plan created", {
        description: `${subject} · ${formatHours(dailyMinutes)}/day for ${daysBetween(
          startDate,
          targetDate
        ) + 1} days`,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-base">
            {editing ? "Edit study plan" : "New study plan"}
          </DialogTitle>
          <DialogDescription>
            Commit to a daily time goal between two dates. Progress is computed
            from the sessions you log.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="plan-subject" className="text-xs font-semibold uppercase tracking-wider">
              Subject *
            </Label>
            <Input
              id="plan-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. DSA"
              maxLength={40}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="plan-topic" className="text-xs font-semibold uppercase tracking-wider">
              Goal / what you'll learn *
            </Label>
            <Input
              id="plan-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Learn DSA in 2 months"
              maxLength={80}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="plan-start" className="text-xs font-semibold uppercase tracking-wider">
                Start date
              </Label>
              <Input
                id="plan-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plan-target" className="text-xs font-semibold uppercase tracking-wider">
                Target date
              </Label>
              <Input
                id="plan-target"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider">
              Daily time goal
            </Label>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label htmlFor="plan-hours" className="text-[11px] text-muted-foreground">
                  Hours
                </Label>
                <Input
                  id="plan-hours"
                  type="number"
                  min={0}
                  max={16}
                  value={hours}
                  onChange={(e) =>
                    setHours(Math.max(0, Math.min(16, Number(e.target.value) || 0)))
                  }
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="plan-mins" className="text-[11px] text-muted-foreground">
                  Minutes
                </Label>
                <Select
                  value={String(minutes)}
                  onValueChange={(v) => setMinutes(Number(v))}
                >
                  <SelectTrigger id="plan-mins">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 15, 30, 45].map((m) => (
                      <SelectItem key={m} value={String(m)}>
                        {m}m
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <span className="pb-2 text-sm font-bold text-primary">
                {formatHours(dailyMinutes)}/day
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Total commitment:{" "}
              <span className="font-semibold text-foreground">
                {formatDuration(
                  dailyMinutes * (daysBetween(startDate, targetDate) + 1)
                )}
              </span>{" "}
              over {daysBetween(startDate, targetDate) + 1} days.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider">
              Priority
            </Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
              <SelectTrigger>
                <SelectValue />
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

          {error ? (
            <p role="alert" className="text-xs font-semibold text-destructive">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>
            {editing ? "Save plan" : "Create plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------- Log session ------------------------------- */

function LogSessionDialog({
  open,
  onOpenChange,
  goalId,
  subject,
  dailyGoal,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  goalId: string;
  subject: string;
  dailyGoal: number;
}) {
  const logSession = useStudyStore((s) => s.logSession);
  const [date, setDate] = useState(todayISO());
  const [minutes, setMinutes] = useState(dailyGoal);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setDate(todayISO());
      setMinutes(dailyGoal);
      setNote("");
      setError(null);
    }
  }, [open, dailyGoal]);

  const submit = () => {
    if (minutes <= 0) return setError("Log at least 1 minute.");
    logSession(goalId, { date, minutes, note: note.trim() || undefined });
    toast.success("Session logged", {
      description: `${subject} · ${formatDuration(minutes)} on ${formatDate(date)}`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-base">
            Log study session
          </DialogTitle>
          <DialogDescription>
            {subject} · daily goal {formatDuration(dailyGoal)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="log-date" className="text-xs font-semibold uppercase tracking-wider">
              Date
            </Label>
            <Input
              id="log-date"
              type="date"
              value={date}
              max={todayISO()}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="log-mins" className="text-xs font-semibold uppercase tracking-wider">
              Minutes studied
            </Label>
            <Input
              id="log-mins"
              type="number"
              min={1}
              max={720}
              value={minutes}
              onChange={(e) =>
                setMinutes(Math.max(0, Math.min(720, Number(e.target.value) || 0)))
              }
            />
            <div className="flex flex-wrap gap-1.5">
              {[15, 30, 45, 60, 90, 120].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMinutes(m)}
                  className="border-2 border-[var(--pixel-line)] bg-card px-2 py-1 text-xs font-semibold hover:bg-muted"
                >
                  {formatDuration(m)}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="log-note" className="text-xs font-semibold uppercase tracking-wider">
              Note (optional)
            </Label>
            <Textarea
              id="log-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What did you cover?"
              maxLength={160}
              rows={2}
            />
          </div>
          {error ? (
            <p role="alert" className="text-xs font-semibold text-destructive">
              {error}
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>
            <CheckCircle2 className="h-4 w-4" /> Log it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------- Skeleton ----------------------------- */

function StudySkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-12 w-48 animate-pulse border-2 border-[var(--pixel-line)] bg-muted pixel-shadow-sm" />
      <div className="h-24 animate-pulse border-2 border-[var(--pixel-line)] bg-muted pixel-shadow" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse border-2 border-[var(--pixel-line)] bg-muted pixel-shadow-sm"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="h-64 animate-pulse border-2 border-[var(--pixel-line)] bg-muted pixel-shadow"
          />
        ))}
      </div>
    </div>
  );
}
