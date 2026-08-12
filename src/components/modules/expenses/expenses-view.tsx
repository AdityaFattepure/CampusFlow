"use client";

import * as React from "react";
import { PieChart, Pie, Cell } from "recharts";
import {
  Wallet,
  Plus,
  Search,
  Pencil,
  Trash2,
  TrendingDown,
  CalendarDays,
  Receipt,
  IndianRupee,
  PieChart as PieChartIcon,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

import { useExpenseStore } from "@/lib/store";
import { useHydrated } from "@/hooks/use-hydrated";
import {
  EXPENSE_CATEGORIES,
  type Expense,
  type ExpenseCategory,
  type ExpenseInput,
} from "@/lib/types";
import {
  EXPENSE_CATEGORY_META,
  formatINR,
  formatINRCompact,
  formatDate,
  todayISO,
  isSameMonth,
  monthLabel,
} from "@/lib/format";

import { ModuleHeader } from "@/components/shared/module-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

// ----------------------------- helpers ----------------------------------

type TimeFilter = "month" | "week" | "all";
type SortKey = "newest" | "oldest" | "amount-desc" | "amount-asc";
type CategoryFilter = "all" | ExpenseCategory;

/** Whether an ISO yyyy-mm-dd falls within the last 7 calendar days (inclusive of today). */
function withinThisWeek(iso: string, ref: Date = new Date()): boolean {
  if (!iso) return false;
  const target = new Date(iso + "T00:00:00");
  const today = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const diffDays = Math.round(
    (today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diffDays >= 0 && diffDays <= 6;
}

function matchesTimeFilter(iso: string, filter: TimeFilter): boolean {
  if (filter === "all") return true;
  if (filter === "month") return isSameMonth(iso);
  return withinThisWeek(iso);
}

function sortExpenses(list: Expense[], key: SortKey): Expense[] {
  const copy = [...list];
  switch (key) {
    case "oldest":
      copy.sort(
        (a, b) =>
          a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt)
      );
      break;
    case "amount-desc":
      copy.sort((a, b) => b.amount - a.amount);
      break;
    case "amount-asc":
      copy.sort((a, b) => a.amount - b.amount);
      break;
    case "newest":
    default:
      copy.sort(
        (a, b) =>
          b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)
      );
      break;
  }
  return copy;
}

// --------------------------- expense form -------------------------------

interface FormState {
  amount: string;
  category: ExpenseCategory;
  description: string;
  date: string;
}

function buildFormState(expense?: Expense): FormState {
  return expense
    ? {
        amount: String(expense.amount),
        category: expense.category,
        description: expense.description,
        date: expense.date,
      }
    : {
        amount: "",
        category: "Food",
        description: "",
        date: todayISO(),
      };
}

function ExpenseFormDialog({
  trigger,
  initial,
  onSubmit,
  submitLabel,
  title,
  description,
}: {
  trigger: React.ReactNode;
  initial?: Expense;
  onSubmit: (input: ExpenseInput) => void;
  submitLabel: string;
  title: string;
  description: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<FormState>(() =>
    buildFormState(initial)
  );

  // Reset the form whenever the dialog is reopened so it reflects the latest
  // `initial` value (important for the edit use case).
  React.useEffect(() => {
    if (open) setForm(buildFormState(initial));
  }, [open, initial]);

  const amountNum = Number(form.amount);
  const amountValid =
    form.amount.trim() !== "" && Number.isFinite(amountNum) && amountNum > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amountValid) {
      toast.error("Enter a valid amount");
      return;
    }
    onSubmit({
      amount: Math.round(amountNum),
      category: form.category,
      description: form.description.trim(),
      date: form.date || todayISO(),
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exp-amount">Amount</Label>
            <div className="relative">
              <IndianRupee className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="exp-amount"
                type="number"
                min={1}
                step="1"
                inputMode="numeric"
                placeholder="0"
                className="pl-8"
                value={form.amount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amount: e.target.value }))
                }
                autoFocus
                aria-invalid={!amountValid && form.amount !== ""}
              />
            </div>
            {!amountValid && form.amount !== "" ? (
              <p className="text-xs text-destructive">
                Enter an amount greater than zero.
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="exp-category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category: v as ExpenseCategory }))
                }
              >
                <SelectTrigger id="exp-category" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="exp-date">Date</Label>
              <Input
                id="exp-date"
                type="date"
                value={form.date}
                max={todayISO()}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exp-desc">Description</Label>
            <Textarea
              id="exp-desc"
              placeholder="Optional note about this expense..."
              rows={2}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>

          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!amountValid}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ------------------------------ skeleton --------------------------------

function ExpensesSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-14 w-full border-2 border-[var(--pixel-line)] pixel-shadow-sm" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-28 w-full border-2 border-[var(--pixel-line)] pixel-shadow-sm"
          />
        ))}
      </div>
      <Skeleton className="h-10 w-full border-2 border-[var(--pixel-line)] pixel-shadow-sm" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-72 w-full border-2 border-[var(--pixel-line)] pixel-shadow-sm" />
        <Skeleton className="h-72 w-full border-2 border-[var(--pixel-line)] pixel-shadow-sm" />
      </div>
      <Skeleton className="h-72 w-full border-2 border-[var(--pixel-line)] pixel-shadow-sm" />
    </div>
  );
}

// ------------------------------ main view -------------------------------

export function ExpensesView() {
  const hydrated = useHydrated();
  const { expenses, addExpense, updateExpense, deleteExpense } =
    useExpenseStore();

  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] =
    React.useState<CategoryFilter>("all");
  const [timeFilter, setTimeFilter] = React.useState<TimeFilter>("month");
  const [sortKey, setSortKey] = React.useState<SortKey>("newest");

  if (!hydrated) return <ExpensesSkeleton />;

  // --- filter + sort the visible set ---
  const q = search.trim().toLowerCase();
  const filtered = expenses.filter((e) => {
    if (!matchesTimeFilter(e.date, timeFilter)) return false;
    if (categoryFilter !== "all" && e.category !== categoryFilter) return false;
    if (q && !e.description.toLowerCase().includes(q)) return false;
    return true;
  });
  const sorted = sortExpenses(filtered, sortKey);

  // --- totals ---
  const filteredTotal = filtered.reduce((s, e) => s + e.amount, 0);
  const monthExpenses = expenses.filter((e) => isSameMonth(e.date));
  const monthTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const allTimeTotal = expenses.reduce((s, e) => s + e.amount, 0);

  // --- per-category breakdown for current filter set ---
  const byCategory = new Map<ExpenseCategory, number>();
  for (const e of filtered) {
    byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount);
  }
  const breakdown = [...byCategory.entries()]
    .map(([cat, value]) => ({ cat, value }))
    .sort((a, b) => b.value - a.value);

  // --- top category this month (for stat card) ---
  const monthByCategory = new Map<ExpenseCategory, number>();
  for (const e of monthExpenses) {
    monthByCategory.set(
      e.category,
      (monthByCategory.get(e.category) ?? 0) + e.amount
    );
  }
  const topMonthEntry = [...monthByCategory.entries()].sort(
    (a, b) => b[1] - a[1]
  )[0];

  // --- chart data + config (only categories present in filtered set) ---
  const chartData = breakdown.map(({ cat, value }) => ({
    name: cat,
    value,
    fill: EXPENSE_CATEGORY_META[cat].color,
  }));
  const chartConfig = {
    ...Object.fromEntries(
      breakdown.map(({ cat }) => [
        cat,
        {
          label: cat,
          color: EXPENSE_CATEGORY_META[cat].color,
        },
      ])
    ),
  } satisfies ChartConfig;

  const addTrigger = (
    <ExpenseFormDialog
      trigger={
        <Button>
          <Plus />
          Add Expense
        </Button>
      }
      title="Add Expense"
      description="Log a new spending entry."
      submitLabel="Add Expense"
      onSubmit={(input) => {
        addExpense(input);
        toast.success("Expense added");
      }}
    />
  );

  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={<Wallet className="h-5 w-5" />}
        title="Expenses"
        description="Track where your money goes"
        actions={addTrigger}
      />

      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={<Wallet className="h-4 w-4" />}
          label={`This Month — ${monthLabel()}`}
          value={formatINR(monthTotal)}
          sub={`${monthExpenses.length} transaction${
            monthExpenses.length === 1 ? "" : "s"
          }`}
          tone="primary"
          display
        />
        <StatCard
          icon={<IndianRupee className="h-4 w-4" />}
          label="All-time"
          value={formatINR(allTimeTotal)}
          sub={`${expenses.length} transaction${
            expenses.length === 1 ? "" : "s"
          }`}
          tone="teal"
          display
        />
        <StatCard
          icon={<Receipt className="h-4 w-4" />}
          label="Transactions"
          value={filtered.length}
          sub={
            timeFilter === "all"
              ? "All time view"
              : timeFilter === "month"
              ? "This month view"
              : "This week view"
          }
          tone="violet"
          display
        />
        <StatCard
          icon={<TrendingDown className="h-4 w-4" />}
          label="Top Category"
          value={topMonthEntry ? topMonthEntry[0] : "—"}
          sub={
            topMonthEntry
              ? `${formatINR(topMonthEntry[1])} this month`
              : "No spend yet"
          }
          tone="amber"
        />
      </div>

      {/* Controls bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by description..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search expenses"
          />
        </div>
        <Select
          value={categoryFilter}
          onValueChange={(v) => setCategoryFilter(v as CategoryFilter)}
        >
          <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filter by category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {EXPENSE_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={timeFilter}
          onValueChange={(v) => setTimeFilter(v as TimeFilter)}
        >
          <SelectTrigger className="w-full sm:w-[150px]" aria-label="Filter by time">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={sortKey}
          onValueChange={(v) => setSortKey(v as SortKey)}
        >
          <SelectTrigger className="w-full sm:w-[180px]" aria-label="Sort expenses">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="amount-desc">Amount: High → Low</SelectItem>
            <SelectItem value="amount-asc">Amount: Low → High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-5 w-5" />}
          title="No expenses match"
          description="Try adjusting your filters, or add a new expense to get started."
          action={addTrigger}
        />
      ) : (
        <>
          {/* Chart + Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <PieChartIcon className="size-4 text-muted-foreground" />
                  Spending by Category
                </CardTitle>
                <CardDescription>
                  {formatINR(filteredTotal)} across {breakdown.length} categor
                  {breakdown.length === 1 ? "y" : "ies"} in this view.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredTotal > 0 ? (
                  <div className="relative">
                    <ChartContainer
                      config={chartConfig}
                      className="mx-auto aspect-square max-h-[240px] w-full"
                    >
                      <PieChart>
                        <Pie
                          data={chartData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={62}
                          outerRadius={88}
                          paddingAngle={2}
                          cornerRadius={0}
                          strokeWidth={0}
                        >
                          {chartData.map((d) => (
                            <Cell key={d.name} fill={d.fill} />
                          ))}
                        </Pie>
                        <ChartTooltip
                          cursor={false}
                          content={
                            <ChartTooltipContent
                              nameKey="name"
                              formatter={(value, name) => (
                                <>
                                  <span className="text-muted-foreground">
                                    {name}
                                  </span>
                                  <span className="ml-auto font-mono font-medium tabular-nums">
                                    {formatINR(Number(value))}
                                  </span>
                                </>
                              )}
                            />
                          }
                        />
                      </PieChart>
                    </ChartContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Total
                      </span>
                      <span className="font-display text-base leading-none tabular-nums">
                        {formatINRCompact(filteredTotal)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
                    No data for this view.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="size-4 text-muted-foreground" />
                  Breakdown
                </CardTitle>
                <CardDescription>
                  Per-category spend, sorted high to low.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3.5">
                  {breakdown.map(({ cat, value }) => {
                    const meta = EXPENSE_CATEGORY_META[cat];
                    const pct =
                      filteredTotal > 0 ? (value / filteredTotal) * 100 : 0;
                    return (
                      <li key={cat} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className="inline-block h-3 w-3 shrink-0 border-2 border-[var(--pixel-line)]"
                              style={{ backgroundColor: meta.color }}
                              aria-hidden
                            />
                            <span className="font-medium">{cat}</span>
                          </div>
                          <div className="flex items-center gap-2 tabular-nums">
                            <span className="font-medium">
                              {formatINR(value)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {pct.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <div className="h-2.5 w-full border-2 border-[var(--pixel-line)] bg-muted">
                          <div
                            className="h-full transition-all"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: meta.color,
                            }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="size-4 text-muted-foreground" />
                History
              </CardTitle>
              <CardDescription>
                {sorted.length} transaction{sorted.length === 1 ? "" : "s"} in
                this view — totalling {formatINR(filteredTotal)}.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 sm:px-6">
              {/* Desktop: table */}
              <div className="hidden sm:block">
                <Table className="[&_td]:border-2 [&_td]:border-[var(--pixel-line)]/30 [&_th]:border-2 [&_th]:border-[var(--pixel-line)]/30">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="pr-6 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sorted.map((e) => {
                      const meta = EXPENSE_CATEGORY_META[e.category];
                      return (
                        <TableRow key={e.id}>
                          <TableCell className="pl-6 text-muted-foreground">
                            {formatDate(e.date)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="gap-1.5">
                              <span
                                className="inline-block size-2 border-2 border-[var(--pixel-line)]"
                                style={{ backgroundColor: meta.color }}
                                aria-hidden
                              />
                              {e.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[320px] truncate">
                            {e.description ? (
                              e.description
                            ) : (
                              <span className="italic text-muted-foreground">
                                No description
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-bold tabular-nums">
                            {formatINR(e.amount)}
                          </TableCell>
                          <TableCell className="pr-6">
                            <div className="flex justify-end gap-1">
                              <ExpenseFormDialog
                                trigger={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="border-2 border-transparent hover:border-[var(--pixel-line)] hover:bg-muted"
                                    aria-label={`Edit ${e.category} expense of ${formatINR(
                                      e.amount
                                    )}`}
                                  >
                                    <Pencil />
                                  </Button>
                                }
                                initial={e}
                                title="Edit Expense"
                                description="Update this expense entry."
                                submitLabel="Save Changes"
                                onSubmit={(input) => {
                                  updateExpense(e.id, input);
                                  toast.success("Expense updated");
                                }}
                              />
                              <ConfirmDialog
                                trigger={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="border-2 border-transparent hover:border-[var(--pixel-line)] hover:bg-muted"
                                    aria-label={`Delete ${e.category} expense of ${formatINR(
                                      e.amount
                                    )}`}
                                  >
                                    <Trash2 />
                                  </Button>
                                }
                                title="Delete this expense?"
                                description={`This permanently removes the ${e.category} expense of ${formatINR(
                                  e.amount
                                )} from ${formatDate(e.date)}.`}
                                confirmLabel="Delete"
                                onConfirm={() => {
                                  deleteExpense(e.id);
                                  toast.success("Expense deleted");
                                }}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile: card list */}
              <ul className="space-y-2 px-4 sm:hidden">
                {sorted.map((e) => {
                  const meta = EXPENSE_CATEGORY_META[e.category];
                  return (
                    <li
                      key={e.id}
                      className="flex items-start gap-3 border-2 border-[var(--pixel-line)] p-3"
                    >
                      <span
                        className="mt-1.5 inline-block h-3 w-3 shrink-0 border-2 border-[var(--pixel-line)]"
                        style={{ backgroundColor: meta.color }}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium">
                            {e.category}
                          </span>
                          <span className="text-sm font-bold tabular-nums">
                            {formatINR(e.amount)}
                          </span>
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {e.description || "No description"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(e.date)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <ExpenseFormDialog
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 border-2 border-transparent hover:border-[var(--pixel-line)] hover:bg-muted"
                              aria-label={`Edit ${e.category} expense`}
                            >
                              <Pencil />
                            </Button>
                          }
                          initial={e}
                          title="Edit Expense"
                          description="Update this expense entry."
                          submitLabel="Save Changes"
                          onSubmit={(input) => {
                            updateExpense(e.id, input);
                            toast.success("Expense updated");
                          }}
                        />
                        <ConfirmDialog
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 border-2 border-transparent hover:border-[var(--pixel-line)] hover:bg-muted"
                              aria-label={`Delete ${e.category} expense`}
                            >
                              <Trash2 />
                            </Button>
                          }
                          title="Delete this expense?"
                          description={`This permanently removes the ${e.category} expense of ${formatINR(
                            e.amount
                          )}.`}
                          confirmLabel="Delete"
                          onConfirm={() => {
                            deleteExpense(e.id);
                            toast.success("Expense deleted");
                          }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
