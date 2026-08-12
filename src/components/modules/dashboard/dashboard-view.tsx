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
  Circle,
  GraduationCap,
  ListTodo,
  NotebookPen,
  Wallet,
  Sparkles,
  CalendarDays,
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
} from "@/lib/store";
import {
  EXPENSE_CATEGORY_META,
  PRIORITY_STYLES,
  TASK_CATEGORY_STYLES,
  formatDate,
  formatINR,
  isSameMonth,
  relativeDay,
  todayISO,
} from "@/lib/format";
import type { ModuleKey, ExpenseCategory } from "@/lib/types";
import { useHydrated } from "@/hooks/use-hydrated";
import { toast } from "sonner";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
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
    };
  }, [tasks, expenses, goals, notes]);

  // Chart config derived from categories present this month.
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
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-6 text-white shadow-sm sm:p-7">
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-teal-300/20 blur-2xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <CalendarDays className="h-3.5 w-3.5" />
              {todayLabel}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {greeting()}, {studentName} 👋
            </h1>
            <p className="max-w-xl text-sm text-white/85">
              {stats.dueTodayOrOverdue.length > 0 ? (
                <>
                  You have{" "}
                  <span className="font-semibold">
                    {stats.dueTodayOrOverdue.length} task
                    {stats.dueTodayOrOverdue.length === 1 ? "" : "s"}
                  </span>{" "}
                  due today
                  {stats.overdueCount > 0
                    ? ` · ${stats.overdueCount} overdue`
                    : ""}
                  .
                </>
              ) : (
                "You're all caught up for today. Nice work!"
              )}{" "}
              Spent{" "}
              <span className="font-semibold">{formatINR(stats.monthTotal)}</span>{" "}
              this month.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/15 text-white hover:bg-white/25 hover:text-white"
              onClick={() => onNavigate("tasks")}
            >
              <ListTodo className="h-4 w-4" /> Add task
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/15 text-white hover:bg-white/25 hover:text-white"
              onClick={() => onNavigate("expenses")}
            >
              <Wallet className="h-4 w-4" /> Add expense
            </Button>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <button
          className="text-left"
          onClick={() => onNavigate("tasks")}
          aria-label="Go to tasks"
        >
          <StatCard
            icon={<ListTodo className="h-4 w-4" />}
            label="Pending tasks"
            value={stats.pending.length}
            tone="amber"
            sub={`${stats.totalTasks} total · ${stats.completed.length} done`}
            className="h-full transition-shadow hover:shadow-md"
          />
        </button>
        <button
          className="text-left"
          onClick={() => onNavigate("expenses")}
          aria-label="Go to expenses"
        >
          <StatCard
            icon={<Wallet className="h-4 w-4" />}
            label="Spent this month"
            value={formatINR(stats.monthTotal)}
            tone="primary"
            sub={`${stats.catRows.length} categories`}
            className="h-full transition-shadow hover:shadow-md"
          />
        </button>
        <button
          className="text-left"
          onClick={() => onNavigate("study")}
          aria-label="Go to study planner"
        >
          <StatCard
            icon={<GraduationCap className="h-4 w-4" />}
            label="Study progress"
            value={`${stats.overallProgress}%`}
            tone="teal"
            sub={`${stats.activeGoals.length} active goals`}
            className="h-full transition-shadow hover:shadow-md"
          />
        </button>
        <button
          className="text-left"
          onClick={() => onNavigate("notes")}
          aria-label="Go to notes"
        >
          <StatCard
            icon={<NotebookPen className="h-4 w-4" />}
            label="Notes saved"
            value={stats.notesCount}
            tone="violet"
            sub="Quick capture"
            className="h-full transition-shadow hover:shadow-md"
          />
        </button>
      </div>

      {/* Today's tasks + expense overview */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Today's tasks */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between border-b">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Today&apos;s tasks</CardTitle>
            </div>
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
                <ul className="divide-y">
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
                          <p className="truncate text-sm font-medium">
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
                                className={`h-1.5 w-1.5 rounded-full ${PRIORITY_STYLES[t.priority].dot}`}
                              />
                              {t.priority}
                            </Badge>
                            <span
                              className={`text-xs ${
                                overdue
                                  ? "font-medium text-rose-600 dark:text-rose-300"
                                  : "text-muted-foreground"
                              }`}
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

        {/* Expense overview */}
        <Card>
          <CardHeader className="flex-row items-center justify-between border-b">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Expense overview</CardTitle>
            </div>
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
                  <span className="text-sm text-muted-foreground">
                    Total this month
                  </span>
                  <span className="text-xl font-semibold tabular-nums">
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
                    <CartesianGrid
                      horizontal={false}
                      strokeDasharray="3 3"
                    />
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
                    <Bar dataKey="amount" radius={4}>
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
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: row.fill }}
                          />
                          <span className="text-muted-foreground">
                            {EXPENSE_CATEGORY_META[row.category].label}
                          </span>
                        </span>
                        <span className="tabular-nums font-medium">
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

      {/* Study progress + recent notes */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Study progress */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between border-b">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Study progress</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-muted-foreground"
              onClick={() => onNavigate("study")}
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <div className="text-3xl font-semibold tabular-nums text-primary">
                  {stats.overallProgress}%
                </div>
                <span className="text-xs text-muted-foreground">
                  overall
                </span>
              </div>
              <Progress
                value={stats.overallProgress}
                className="h-2.5 flex-1"
              />
            </div>
            {stats.topGoals.length === 0 ? (
              <EmptyState
                icon={<GraduationCap className="h-5 w-5" />}
                title="No active study goals"
                description="Add a goal to start tracking progress."
              />
            ) : (
              <ul className="space-y-3">
                {stats.topGoals.map((g) => (
                  <li key={g.id} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex items-center gap-2 font-medium">
                        <span className="text-muted-foreground">{g.subject}</span>
                        <span className="text-foreground">·</span>
                        <span className="truncate">{g.topic}</span>
                      </span>
                      <span className="tabular-nums text-muted-foreground">
                        {g.progress}%
                      </span>
                    </div>
                    <Progress value={g.progress} className="h-1.5" />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent notes */}
        <Card>
          <CardHeader className="flex-row items-center justify-between border-b">
            <div className="flex items-center gap-2">
              <NotebookPen className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Recent notes</CardTitle>
            </div>
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
              <ul className="divide-y">
                {stats.recentNotes.map((n) => (
                  <li
                    key={n.id}
                    className="cursor-pointer px-6 py-3 transition-colors hover:bg-muted/50"
                    onClick={() => onNavigate("notes")}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-medium">{n.title}</p>
                      <Badge variant="outline" className="shrink-0">
                        {n.category}
                      </Badge>
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
      <div className="h-32 animate-pulse rounded-2xl bg-muted" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-xl bg-muted"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="h-72 animate-pulse rounded-xl bg-muted lg:col-span-2" />
        <div className="h-72 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  );
}
