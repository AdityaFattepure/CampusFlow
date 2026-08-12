"use client";

import * as React from "react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  ListTodo,
  NotebookPen,
  Wallet,
  CalendarDays,
  AlertTriangle,
  Sparkles,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  useTaskStore,
  useExpenseStore,
  useStudyStore,
  useNoteStore,
  useSettingsStore,
} from "@/lib/stores";
import {
  EXPENSE_CATEGORY_META,
  PRIORITY_STYLES,
  TASK_CATEGORY_STYLES,
  formatDate,
  formatINR,
  isSameMonth,
  relativeDay,
  todayISO,
  daysFromTodayISO,
} from "@/lib/format";
import type { ModuleKey, ExpenseCategory } from "@/lib/types";
import { useHydrated } from "@/hooks/use-hydrated";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { loadDemoData } from "@/lib/storage/backup";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

/** A row of pixel "HP" blocks representing a 0-100 value in N segments. */
function PixelBar({
  value,
  segments = 10,
  className,
}: {
  value: number;
  segments?: number;
  className?: string;
}) {
  const lit = Math.round((Math.max(0, Math.min(100, value)) / 100) * segments);
  return (
    <div className={cn("pixel-segments", className)} aria-hidden>
      {Array.from({ length: segments }).map((_, i) => (
        <i key={i} className={i < lit ? "on" : ""} />
      ))}
    </div>
  );
}

export function DashboardView({
  onNavigate,
}: {
  onNavigate: (m: ModuleKey) => void;
}) {
  const hydrated = useHydrated();
  const studentName = useSettingsStore((s) => s.studentName);
  const tasks = useTaskStore((s) => s.tasks);
  const toggleTask = useTaskStore((s) => s.toggleTask);
  const expenses = useExpenseStore((s) => s.expenses);
  const goals = useStudyStore((s) => s.goals);
  const notes = useNoteStore((s) => s.notes);

  const stats = useMemo(() => {
    const today = todayISO();
    const pending = tasks.filter((t) => !t.completed);
    const completed = tasks.filter((t) => t.completed);
    const dueTodayOrOverdue = pending
      .filter((t) => t.dueDate && t.dueDate <= today)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const overdueCount = pending.filter(
      (t) => t.dueDate && t.dueDate < today
    ).length;

    const monthExpenses = expenses.filter((e) => isSameMonth(e.date));
    const monthTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);
    const catTotals = new Map<ExpenseCategory, number>();
    for (const e of monthExpenses) {
      catTotals.set(e.category, (catTotals.get(e.category) ?? 0) + e.amount);
    }
    const catRows = [...catTotals.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amt]) => ({
        category: cat,
        amount: amt,
        fill: EXPENSE_CATEGORY_META[cat].color,
      }));

    const activeGoals = goals.filter((g) => !g.completed);
    const overallProgress =
      goals.length === 0
        ? 0
        : Math.round(
            goals.reduce((s, g) => s + g.progress, 0) / goals.length
          );
    const topGoals = [...activeGoals]
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 4);

    const recentNotes = [...notes]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 3);

    // --- Daily overview (dynamic "today" stats) ---
    const tasksDueToday = pending.filter((t) => t.dueDate === today).length;
    const weekStart = daysFromTodayISO(-7);
    const spentThisWeek = expenses
      .filter((e) => e.date >= weekStart && e.date <= today)
      .reduce((s, e) => s + e.amount, 0);
    const notesUpdatedToday = notes.filter(
      (n) => n.updatedAt.slice(0, 10) === today
    ).length;

    // --- Priority alert: next upcoming (or overdue) pending task ---
    const upcoming = [...pending]
      .filter((t) => t.dueDate)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const priorityAlert = upcoming[0]
      ? {
          title: upcoming[0].title,
          dueDate: upcoming[0].dueDate,
          priority: upcoming[0].priority,
          category: upcoming[0].category,
          overdue: upcoming[0].dueDate < today,
        }
      : null;

    const isEmpty =
      tasks.length === 0 &&
      expenses.length === 0 &&
      goals.length === 0 &&
      notes.length === 0;

    return {
      pending,
      completed,
      dueTodayOrOverdue,
      overdueCount,
      monthTotal,
      catRows,
      overallProgress,
      activeGoals,
      topGoals,
      recentNotes,
      totalTasks: tasks.length,
      notesCount: notes.length,
      tasksDueToday,
      spentThisWeek,
      notesUpdatedToday,
      priorityAlert,
      isEmpty,
    };
  }, [tasks, expenses, goals, notes]);

  const chartConfig: ChartConfig = useMemo(() => {
    const c: ChartConfig = {};
    for (const row of stats.catRows) {
      c[row.category] = {
        label: row.category,
        color: EXPENSE_CATEGORY_META[row.category].color,
      };
    }
    return c;
  }, [stats.catRows]);

  if (!hydrated) {
    return <DashboardSkeleton />;
  }

  const todayLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="space-y-5">
      {/* ---------- Pixelscape hero ---------- */}
      <div
        className="relative overflow-hidden border-2 border-[var(--pixel-line)] pixel-shadow"
        style={{
          background:
            "linear-gradient(to bottom, var(--accent) 0 38%, var(--primary) 38% 68%, var(--chart-4) 68% 100%)",
        }}
      >
        {/* pixel sun (square + inner block) */}
        <div
          className="pointer-events-none absolute right-7 top-5 h-12 w-12 border-2 border-[var(--pixel-line)] bg-background"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-10 top-8 h-6 w-6 border-2 border-[var(--pixel-line)] bg-accent"
          aria-hidden
        />
        {/* dither transition bands (pixel color steps) */}
        <div
          className="pixel-dither pointer-events-none absolute inset-x-0 top-[34%] h-2 opacity-70"
          aria-hidden
        />
        <div
          className="pixel-dither pointer-events-none absolute inset-x-0 top-[64%] h-2 opacity-70"
          aria-hidden
        />
        {/* horizon line */}
        <div
          className="pointer-events-none absolute inset-x-0 top-[68%] h-[2px] bg-[var(--pixel-line)]"
          aria-hidden
        />
        {/* dithered ground strip */}
        <div
          className="pixel-dither pointer-events-none absolute inset-x-0 bottom-0 h-7"
          aria-hidden
        />
        <div className="relative flex flex-col gap-4 p-6 text-background sm:p-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 border-2 border-[var(--pixel-line)] bg-background px-3 py-1 text-xs font-semibold text-foreground pixel-shadow-sm">
              <CalendarDays className="h-3.5 w-3.5 text-primary" />
              {todayLabel}
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {greeting()}, {studentName}
            </h1>
            {/* Dynamic "Today's Overview" */}
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-background/90">
              <span className="flex items-center gap-1.5">
                <span className="font-display text-base">{stats.tasksDueToday}</span>
                task{stats.tasksDueToday === 1 ? "" : "s"} due today
              </span>
              <span className="flex items-center gap-1.5">
                <span className="font-display text-base">{formatINR(stats.spentThisWeek)}</span>
                spent this week
              </span>
              <span className="flex items-center gap-1.5">
                <span className="font-display text-base">{stats.activeGoals.length}</span>
                active study goal{stats.activeGoals.length === 1 ? "" : "s"}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="font-display text-base">{stats.notesUpdatedToday}</span>
                note{stats.notesUpdatedToday === 1 ? "" : "s"} updated today
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="bg-background text-foreground hover:bg-background/90"
              onClick={() => onNavigate("tasks")}
            >
              <ListTodo className="h-4 w-4" /> Add task
            </Button>
            <Button
              size="sm"
              className="bg-background text-foreground hover:bg-background/90"
              onClick={() => onNavigate("expenses")}
            >
              <Wallet className="h-4 w-4" /> Add expense
            </Button>
          </div>
        </div>
      </div>

      {/* ---------- Empty-workspace getting started CTA ---------- */}
      {stats.isEmpty ? (
        <div className="border-2 border-[var(--pixel-line)] bg-card p-6 pixel-shadow">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Sparkles className="h-5 w-5 text-primary" />
                Your workspace is empty
              </h2>
              <p className="text-sm text-muted-foreground">
                Start fresh by adding your first task, or load demo data to look
                around.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => onNavigate("tasks")}>
                <Plus className="h-4 w-4" /> Add your first task
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  loadDemoData();
                  toast.success("Demo data loaded");
                }}
              >
                <Sparkles className="h-4 w-4" /> Load demo data
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ---------- Priority alert ---------- */}
      {stats.priorityAlert ? (
        <button
          onClick={() => onNavigate("tasks")}
          className={cn(
            "flex w-full items-center gap-3 border-2 p-4 text-left transition-all pixel-shadow-sm hover:-translate-x-0.5 hover:-translate-y-0.5",
            stats.priorityAlert.overdue
              ? "border-[var(--pixel-line)] bg-destructive/10"
              : "border-[var(--pixel-line)] bg-accent/15"
          )}
          aria-label="Priority alert — go to tasks"
        >
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center border-2 border-[var(--pixel-line)]",
              stats.priorityAlert.overdue
                ? "bg-destructive text-white"
                : "bg-accent text-accent-foreground"
            )}
          >
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Priority alert
            </p>
            <p className="truncate text-sm font-bold">
              {stats.priorityAlert.title}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge
              variant="outline"
              className={PRIORITY_STYLES[stats.priorityAlert.priority].className}
            >
              <span
                className={`h-1.5 w-1.5 ${PRIORITY_STYLES[stats.priorityAlert.priority].dot}`}
              />
              {stats.priorityAlert.priority}
            </Badge>
            <span
              className={cn(
                "text-xs font-bold",
                stats.priorityAlert.overdue
                  ? "text-destructive"
                  : "text-muted-foreground"
              )}
            >
              {stats.priorityAlert.overdue
                ? relativeDay(stats.priorityAlert.dueDate)
                : `due ${relativeDay(stats.priorityAlert.dueDate)}`}
            </span>
          </div>
        </button>
      ) : null}

      {/* ---------- Stat cards ---------- */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <button
          className="text-left"
          onClick={() => onNavigate("tasks")}
          aria-label="Go to tasks"
        >
          <StatCard
            icon={<ListTodo className="h-4 w-4" />}
            label="Tasks"
            value={stats.pending.length}
            tone="amber"
            display
            sub={`${stats.totalTasks} total · ${stats.completed.length} done`}
            className="h-full"
          />
        </button>
        <button
          className="text-left"
          onClick={() => onNavigate("expenses")}
          aria-label="Go to expenses"
        >
          <StatCard
            icon={<Wallet className="h-4 w-4" />}
            label="Spent / month"
            value={formatINR(stats.monthTotal)}
            tone="primary"
            sub={`${stats.catRows.length} categories`}
            className="h-full"
          />
        </button>
        <button
          className="text-left"
          onClick={() => onNavigate("study")}
          aria-label="Go to study planner"
        >
          <StatCard
            icon={<GraduationCap className="h-4 w-4" />}
            label="Study"
            value={`${stats.overallProgress}%`}
            tone="teal"
            display
            sub={`${stats.activeGoals.length} active goals`}
            className="h-full"
          />
        </button>
        <button
          className="text-left"
          onClick={() => onNavigate("notes")}
          aria-label="Go to notes"
        >
          <StatCard
            icon={<NotebookPen className="h-4 w-4" />}
            label="Notes"
            value={stats.notesCount}
            tone="violet"
            display
            sub="Quick capture"
            className="h-full"
          />
        </button>
      </div>

      {/* ---------- Today's tasks + expense overview ---------- */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between border-b-2 border-[var(--pixel-line)]">
            <CardTitle className="flex items-center gap-2 text-base">
              <ListTodo className="h-4 w-4 text-primary" />
              Today&apos;s tasks
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-muted-foreground"
              onClick={() => onNavigate("tasks")}
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {stats.dueTodayOrOverdue.length === 0 ? (
              <div className="px-6 py-8">
                <EmptyState
                  icon={<CheckCircle2 className="h-5 w-5" />}
                  title="Nothing due today"
                  description="Enjoy the breather — or plan ahead in Tasks."
                />
              </div>
            ) : (
              <ScrollArea className="max-h-80 scroll-area-thin">
                <ul className="divide-y-2 divide-[var(--pixel-line)]/40">
                  {stats.dueTodayOrOverdue.slice(0, 8).map((t) => {
                    const overdue = t.dueDate < todayISO();
                    return (
                      <li
                        key={t.id}
                        className="flex items-center gap-3 px-6 py-3"
                      >
                        <Checkbox
                          checked={t.completed}
                          onCheckedChange={() => {
                            toggleTask(t.id);
                            toast.success("Task completed", {
                              description: t.title,
                            });
                          }}
                          aria-label={`Mark "${t.title}" complete`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {t.title}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <Badge
                              variant="outline"
                              className={TASK_CATEGORY_STYLES[t.category]}
                            >
                              {t.category}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={PRIORITY_STYLES[t.priority].className}
                            >
                              <span
                                className={`h-1.5 w-1.5 ${PRIORITY_STYLES[t.priority].dot}`}
                              />
                              {t.priority}
                            </Badge>
                            <span
                              className={cn(
                                "text-xs",
                                overdue
                                  ? "font-bold text-destructive"
                                  : "text-muted-foreground"
                              )}
                            >
                              {relativeDay(t.dueDate)}
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b-2 border-[var(--pixel-line)]">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="h-4 w-4 text-primary" />
              Expenses
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-muted-foreground"
              onClick={() => onNavigate("expenses")}
            >
              Details <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.catRows.length === 0 ? (
              <EmptyState
                icon={<Wallet className="h-5 w-5" />}
                title="No expenses this month"
                description="Add one to see the breakdown."
              />
            ) : (
              <>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    This month
                  </span>
                  <span className="font-display text-lg">
                    {formatINR(stats.monthTotal)}
                  </span>
                </div>
                <ChartContainer
                  config={chartConfig}
                  className="aspect-auto h-44 w-full"
                >
                  <BarChart
                    data={stats.catRows}
                    layout="vertical"
                    margin={{ left: 0, right: 8, top: 0, bottom: 0 }}
                  >
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="category"
                      tickLine={false}
                      axisLine={false}
                      width={92}
                      tick={{ fontSize: 11 }}
                    />
                    <ChartTooltip
                      cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                      content={
                        <ChartTooltipContent
                          formatter={(v) => formatINR(Number(v))}
                          hideLabel
                        />
                      }
                    />
                    <Bar dataKey="amount" radius={0}>
                      {stats.catRows.map((row) => (
                        <Cell key={row.category} fill={row.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
                <ul className="space-y-1.5">
                  {stats.catRows.slice(0, 4).map((row) => {
                    const pct =
                      stats.monthTotal > 0
                        ? Math.round((row.amount / stats.monthTotal) * 100)
                        : 0;
                    return (
                      <li
                        key={row.category}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 border-2 border-[var(--pixel-line)]"
                            style={{ backgroundColor: row.fill }}
                          />
                          <span className="text-muted-foreground">
                            {EXPENSE_CATEGORY_META[row.category].label}
                          </span>
                        </span>
                        <span className="font-semibold tabular-nums">
                          {formatINR(row.amount)}
                          <span className="ml-1.5 text-xs text-muted-foreground">
                            {pct}%
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ---------- Study progress + recent notes ---------- */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between border-b-2 border-[var(--pixel-line)]">
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="h-4 w-4 text-primary" />
              Study progress
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-muted-foreground"
              onClick={() => onNavigate("study")}
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-5 pt-4">
            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Overall
                </span>
                <span className="font-display text-2xl text-primary">
                  {stats.overallProgress}%
                </span>
              </div>
              <PixelBar value={stats.overallProgress} segments={20} />
            </div>
            {stats.topGoals.length === 0 ? (
              <EmptyState
                icon={<GraduationCap className="h-5 w-5" />}
                title="No active study goals"
                description="Add a goal to start tracking progress."
              />
            ) : (
              <ul className="space-y-3.5">
                {stats.topGoals.map((g) => (
                  <li key={g.id} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex items-center gap-2 font-semibold">
                        <span className="text-muted-foreground">
                          {g.subject}
                        </span>
                        <span>·</span>
                        <span className="truncate">{g.topic}</span>
                      </span>
                      <span className="font-bold tabular-nums text-primary">
                        {g.progress}%
                      </span>
                    </div>
                    <Progress value={g.progress} className="h-3" />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b-2 border-[var(--pixel-line)]">
            <CardTitle className="flex items-center gap-2 text-base">
              <NotebookPen className="h-4 w-4 text-primary" />
              Recent notes
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-muted-foreground"
              onClick={() => onNavigate("notes")}
            >
              All <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {stats.recentNotes.length === 0 ? (
              <div className="px-6 py-8">
                <EmptyState
                  icon={<NotebookPen className="h-5 w-5" />}
                  title="No notes yet"
                  description="Capture a quick note to get started."
                />
              </div>
            ) : (
              <ul className="divide-y-2 divide-[var(--pixel-line)]/40">
                {stats.recentNotes.map((n) => (
                  <li
                    key={n.id}
                    className="cursor-pointer px-6 py-3 transition-colors hover:bg-muted/50"
                    onClick={() => onNavigate("notes")}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{n.title}</p>
                      <Badge variant="outline">{n.category}</Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 whitespace-pre-line text-xs text-muted-foreground">
                      {n.content}
                    </p>
                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                      Updated {formatDate(n.updatedAt.slice(0, 10))}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-40 animate-pulse border-2 border-[var(--pixel-line)] bg-muted pixel-shadow" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse border-2 border-[var(--pixel-line)] bg-muted pixel-shadow-sm"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="h-72 animate-pulse border-2 border-[var(--pixel-line)] bg-muted pixel-shadow lg:col-span-2" />
        <div className="h-72 animate-pulse border-2 border-[var(--pixel-line)] bg-muted pixel-shadow" />
      </div>
    </div>
  );
}
