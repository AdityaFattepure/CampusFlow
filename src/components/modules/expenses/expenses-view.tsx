"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { PieChart, Pie, Cell } from "recharts";
import {
  Wallet,
  Plus,
  Search,
  Pencil,
  Trash2,
  IndianRupee,
  ArrowDownLeft,
  ArrowUpRight,
  HandCoins,
  Banknote,
  Check,
  RotateCcw,
  Scale,
} from "lucide-react";
import { toast } from "sonner";

import { useExpenseStore } from "@/lib/stores";
import { useHydrated } from "@/hooks/use-hydrated";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  TRANSACTION_KINDS,
  type Expense,
  type ExpenseInput,
  type ExpenseCategory,
  type IncomeCategory,
  type TransactionKind,
  type TransactionCategory,
} from "@/lib/types";
import {
  EXPENSE_CATEGORY_META,
  INCOME_CATEGORY_STYLES,
  TRANSACTION_KIND_META,
  formatINR,
  formatDate,
  isSameMonth,
  summarizeMoney,
  type TransactionKindMeta,
} from "@/lib/format";

import { ModuleHeader } from "@/components/shared/module-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const KIND_ICONS: Record<TransactionKindMeta["icon"], React.ReactNode> = {
  "arrow-down-left": <ArrowDownLeft className="h-3.5 w-3.5" />,
  "arrow-up-right": <ArrowUpRight className="h-3.5 w-3.5" />,
  "hand-coins": <HandCoins className="h-3.5 w-3.5" />,
  banknote: <Banknote className="h-3.5 w-3.5" />,
};

type KindFilter = "all" | TransactionKind;
type TimeFilter = "month" | "week" | "all";
type SortKey = "newest" | "oldest" | "amount_high" | "amount_low";

export function ExpensesView() {
  const hydrated = useHydrated();
  const expenses = useExpenseStore((s) => s.expenses);

  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("month");
  const [showSettled, setShowSettled] = useState(true);
  const [sort, setSort] = useState<SortKey>("newest");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const summary = useMemo(
    () => summarizeMoney(expenses),
    [expenses]
  );

  const filtered = useMemo(() => {
    const now = new Date();
    const today = new Date();
    const weekStart = new Date();
    weekStart.setDate(today.getDate() - 7);
    let list = expenses.filter((e) => {
      if (timeFilter === "month" && !isSameMonth(e.date, now)) return false;
      if (timeFilter === "week") {
        const d = new Date(e.date + "T00:00:00");
        if (d < weekStart || d > today) return false;
      }
      if (kindFilter !== "all" && e.kind !== kindFilter) return false;
      if (!showSettled && e.settled) return false;
      const q = search.trim().toLowerCase();
      if (q) {
        const hay = `${e.description} ${e.counterparty ?? ""} ${e.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "newest") return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
      if (sort === "oldest") return a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt);
      if (sort === "amount_high") return b.amount - a.amount;
      return a.amount - b.amount;
    });
    return list;
  }, [expenses, timeFilter, kindFilter, showSettled, search, sort]);

  // Expense-by-category breakdown (expenses only, current filter window).
  const categoryRows = useMemo(() => {
    const totals = new Map<ExpenseCategory, number>();
    for (const e of filtered) {
      if (e.kind !== "expense") continue;
      totals.set(
        e.category as ExpenseCategory,
        (totals.get(e.category as ExpenseCategory) ?? 0) + e.amount
      );
    }
    return [...totals.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amt]) => ({
        category: cat,
        amount: amt,
        fill: EXPENSE_CATEGORY_META[cat].color,
      }));
  }, [filtered]);

  const chartConfig: ChartConfig = useMemo(() => {
    const c: ChartConfig = {};
    for (const row of categoryRows) {
      c[row.category] = {
        label: row.category,
        color: EXPENSE_CATEGORY_META[row.category].color,
      };
    }
    return c;
  }, [categoryRows]);

  if (!hydrated) return <ExpensesSkeleton />;

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (e: Expense) => {
    setEditing(e);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-5">
      <ModuleHeader
        icon={<Wallet className="h-5 w-5" />}
        title="Money"
        description="Track spending, income, and who owes whom."
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add transaction
          </Button>
        }
      />

      {/* Balance / debt stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Scale className="h-4 w-4" />}
          label="Balance"
          value={formatINR(summary.balance)}
          tone={summary.balance >= 0 ? "primary" : "rose"}
          sub="income − expense"
        />
        <StatCard
          icon={<ArrowUpRight className="h-4 w-4" />}
          label="Income"
          value={formatINR(summary.incomeTotal)}
          tone="teal"
          display
          sub="received"
        />
        <StatCard
          icon={<HandCoins className="h-4 w-4" />}
          label="You owe"
          value={formatINR(summary.youOwe)}
          tone="amber"
          display
          sub={summary.youOwe === 0 ? "all settled" : "unsettled borrows"}
        />
        <StatCard
          icon={<Banknote className="h-4 w-4" />}
          label="Owed to you"
          value={formatINR(summary.owedToYou)}
          tone="violet"
          display
          sub={summary.owedToYou === 0 ? "nothing due" : "unsettled lends"}
        />
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search description, friend, category…"
              className="pl-9"
              aria-label="Search transactions"
            />
          </div>
          <Select value={kindFilter} onValueChange={(v) => setKindFilter(v as KindFilter)}>
            <SelectTrigger aria-label="Filter by kind">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All kinds</SelectItem>
              <SelectItem value="expense">Expenses</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="borrow">Borrowed</SelectItem>
              <SelectItem value="lend">Lent</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
            <SelectTrigger aria-label="Filter by time">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This month</SelectItem>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger aria-label="Sort transactions">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="amount_high">Amount: high → low</SelectItem>
              <SelectItem value="amount_low">Amount: low → high</SelectItem>
            </SelectContent>
          </Select>
          <label className="flex items-center gap-2 text-xs font-semibold lg:col-span-5">
            <Checkbox
              checked={showSettled}
              onCheckedChange={(v) => setShowSettled(v === true)}
              aria-label="Show settled debts"
            />
            Show settled debts
          </label>
        </CardContent>
      </Card>

      {/* Breakdown chart (expenses only) */}
      {categoryRows.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b-2 border-[var(--pixel-line)]">
              <CardTitle className="flex items-center gap-2 text-base">
                <Wallet className="h-4 w-4 text-primary" />
                Expenses by category
              </CardTitle>
              <Badge variant="outline" className="font-mono">
                {formatINR(categoryRows.reduce((s, r) => s + r.amount, 0))}
              </Badge>
            </CardHeader>
            <CardContent className="pt-4">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[220px]"
              >
                <PieChart>
                  <Pie
                    data={categoryRows}
                    dataKey="amount"
                    nameKey="category"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {categoryRows.map((row) => (
                      <Cell key={row.category} fill={row.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(v) => formatINR(Number(v))}
                        hideLabel
                      />
                    }
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b-2 border-[var(--pixel-line)]">
              <CardTitle className="flex items-center gap-2 text-base">
                <IndianRupee className="h-4 w-4 text-primary" />
                Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-4">
              <ul className="space-y-2">
                {categoryRows.map((row) => {
                  const total = categoryRows.reduce((s, r) => s + r.amount, 0);
                  const pct = total > 0 ? Math.round((row.amount / total) * 100) : 0;
                  return (
                    <li key={row.category} className="space-y-1">
                      <div className="flex items-center justify-between gap-2 text-sm">
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
                      </div>
                      <div className="h-2 border-2 border-[var(--pixel-line)] bg-muted">
                        <div
                          className="h-full"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: row.fill,
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
      ) : null}

      {/* Transaction history */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b-2 border-[var(--pixel-line)]">
          <CardTitle className="flex items-center gap-2 text-base">
            <Receipt /> History
          </CardTitle>
          <Badge variant="outline" className="font-mono">
            {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<Wallet className="h-5 w-5" />}
                title="No transactions match"
                description="Adjust the filters or add a new transaction."
                action={
                  <Button onClick={openAdd}>
                    <Plus className="h-4 w-4" /> Add transaction
                  </Button>
                }
              />
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow className="[&_th]:border-2 [&_th]:border-[var(--pixel-line)]/30">
                      <TableHead>Date</TableHead>
                      <TableHead>Kind</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((t) => (
                      <TableRow key={t.id} className="[&_td]:border-2 [&_td]:border-[var(--pixel-line)]/20">
                        <TableCell className="whitespace-nowrap text-xs">
                          {formatDate(t.date)}
                        </TableCell>
                        <TableCell>
                          <KindBadge kind={t.kind} settled={t.settled} />
                        </TableCell>
                        <TableCell>
                          <div className="truncate text-sm font-semibold">
                            {t.description || "—"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {t.counterparty ? `with ${t.counterparty} · ` : ""}
                            {t.category}
                          </div>
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right font-bold tabular-nums",
                            t.kind === "expense" && "text-destructive",
                            t.kind === "income" && "text-primary"
                          )}
                        >
                          {t.kind === "expense" ? "−" : t.kind === "income" ? "+" : ""}
                          {formatINR(t.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <RowActions tx={t} onEdit={() => openEdit(t)} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Mobile cards */}
              <ul className="divide-y-2 divide-[var(--pixel-line)]/30 sm:hidden">
                {filtered.map((t) => (
                  <li key={t.id} className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <KindBadge kind={t.kind} settled={t.settled} />
                          <span className="text-xs text-muted-foreground">
                            {formatDate(t.date)}
                          </span>
                        </div>
                        <div className="mt-1 truncate text-sm font-semibold">
                          {t.description || "—"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t.counterparty ? `with ${t.counterparty} · ` : ""}
                          {t.category}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={cn(
                            "font-bold tabular-nums",
                            t.kind === "expense" && "text-destructive",
                            t.kind === "income" && "text-primary"
                          )}
                        >
                          {t.kind === "expense" ? "−" : t.kind === "income" ? "+" : ""}
                          {formatINR(t.amount)}
                        </div>
                        <div className="mt-1">
                          <RowActions tx={t} onEdit={() => openEdit(t)} />
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardContent>
      </Card>

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
      />
    </div>
  );
}

/* --------------------------- Kind badge ----------------------------- */

function KindBadge({ kind, settled }: { kind: TransactionKind; settled?: boolean }) {
  const meta = TRANSACTION_KIND_META[kind];
  return (
    <Badge variant="outline" className={cn("gap-1", meta.badge)}>
      {KIND_ICONS[meta.icon]}
      {meta.label}
      {settled ? " · settled" : ""}
    </Badge>
  );
}

function Receipt({ className }: { className?: string }) {
  return <Wallet className={cn("h-4 w-4 text-primary", className)} />;
}

/* --------------------------- Row actions ---------------------------- */

function RowActions({ tx, onEdit }: { tx: Expense; onEdit: () => void }) {
  const deleteExpense = useExpenseStore((s) => s.deleteExpense);
  const settle = useExpenseStore((s) => s.settleTransaction);
  const unsettle = useExpenseStore((s) => s.unsettleTransaction);
  const isDebt = tx.kind === "borrow" || tx.kind === "lend";

  return (
    <div className="inline-flex items-center gap-1">
      {isDebt ? (
        tx.settled ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 border-2 border-transparent px-2 hover:border-[var(--pixel-line)] hover:bg-muted"
            onClick={() => {
              unsettle(tx.id);
              toast.success("Debt reopened");
            }}
            aria-label="Reopen debt"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reopen
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 border-2 border-transparent px-2 text-primary hover:border-[var(--pixel-line)] hover:bg-muted"
            onClick={() => {
              settle(tx.id);
              toast.success("Marked as settled", {
                description: `${tx.counterparty ?? ""} ${formatINR(tx.amount)}`.trim(),
              });
            }}
            aria-label="Mark debt settled"
          >
            <Check className="h-3.5 w-3.5" /> Settle
          </Button>
        )
      ) : null}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 border-2 border-transparent hover:border-[var(--pixel-line)] hover:bg-muted"
        onClick={onEdit}
        aria-label="Edit transaction"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <ConfirmDialog
        trigger={
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 border-2 border-transparent hover:border-[var(--pixel-line)] hover:bg-muted hover:text-destructive"
            aria-label="Delete transaction"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        }
        title="Delete this transaction?"
        description="This cannot be undone."
        onConfirm={() => {
          deleteExpense(tx.id);
          toast.success("Transaction deleted");
        }}
      />
    </div>
  );
}

/* ----------------------- Add / edit dialog -------------------------- */

function TransactionDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: Expense | null;
}) {
  const addExpense = useExpenseStore((s) => s.addExpense);
  const updateExpense = useExpenseStore((s) => s.updateExpense);

  const [kind, setKind] = useState<TransactionKind>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>("Food");
  const [description, setDescription] = useState("");
  const [counterparty, setCounterparty] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    if (editing) {
      setKind(editing.kind);
      setAmount(String(editing.amount));
      setCategory(editing.category);
      setDescription(editing.description);
      setCounterparty(editing.counterparty ?? "");
      setDate(editing.date);
    } else {
      setKind("expense");
      setAmount("");
      setCategory("Food");
      setDescription("");
      setCounterparty("");
      setDate(new Date().toISOString().slice(0, 10));
    }
    setError(null);
  }, [open, editing]);

  // category options depend on kind
  const categoryOptions: readonly string[] =
    kind === "income" ? INCOME_CATEGORIES : kind === "expense" ? EXPENSE_CATEGORIES : ["Transfer"];
  const needsCounterparty = kind === "borrow" || kind === "lend";

  React.useEffect(() => {
    // keep category valid when kind changes
    if (!categoryOptions.includes(category)) {
      setCategory(categoryOptions[0]);
    }
  }, [kind, category, categoryOptions]);

  const submit = () => {
    const amt = Number(amount);
    if (!amount || isNaN(amt) || amt <= 0)
      return setError("Enter an amount greater than ₹0.");
    if (needsCounterparty && !counterparty.trim())
      return setError("Add the friend's name for borrow/lend.");
    if (!date) return setError("Pick a date.");

    const input: ExpenseInput = {
      kind,
      amount: amt,
      category: category as TransactionCategory,
      description: description.trim(),
      date,
      counterparty: needsCounterparty ? counterparty.trim() : undefined,
      settled: editing?.settled ?? false,
    };
    if (editing) {
      updateExpense(editing.id, input);
      toast.success("Transaction updated");
    } else {
      addExpense(input);
      toast.success(TRANSACTION_KIND_META[kind].label + " added", {
        description: `${formatINR(amt)}${needsCounterparty ? " · " + counterparty.trim() : ""}`,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-base">
            {editing ? "Edit transaction" : "Add transaction"}
          </DialogTitle>
          <DialogDescription>
            Track an expense, income, or money borrowed / lent to a friend.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1">
          {/* Kind selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider">
              Type
            </Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TRANSACTION_KINDS.map((k) => {
                const meta = TRANSACTION_KIND_META[k];
                const active = kind === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setKind(k)}
                    aria-pressed={active}
                    className={cn(
                      "flex flex-col items-center gap-1 border-2 p-2 text-xs font-semibold transition-all",
                      active
                        ? "border-[var(--pixel-line)] bg-primary text-primary-foreground pixel-inset"
                        : "border-[var(--pixel-line)] bg-card hover:bg-muted"
                    )}
                  >
                    {KIND_ICONS[meta.icon]}
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="tx-amount" className="text-xs font-semibold uppercase tracking-wider">
                Amount (₹) *
              </Label>
              <Input
                id="tx-amount"
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tx-date" className="text-xs font-semibold uppercase tracking-wider">
                Date
              </Label>
              <Input
                id="tx-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
              />
            </div>
          </div>

          {needsCounterparty ? (
            <div className="space-y-1.5">
              <Label htmlFor="tx-friend" className="text-xs font-semibold uppercase tracking-wider">
                Friend's name *
              </Label>
              <Input
                id="tx-friend"
                value={counterparty}
                onChange={(e) => setCounterparty(e.target.value)}
                placeholder="e.g. Rahul"
                maxLength={40}
              />
            </div>
          ) : null}

          {!needsCounterparty ? (
            <div className="space-y-1.5">
              <Label htmlFor="tx-category" className="text-xs font-semibold uppercase tracking-wider">
                Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="tx-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="tx-desc" className="text-xs font-semibold uppercase tracking-wider">
              Description
            </Label>
            <Textarea
              id="tx-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                kind === "borrow"
                  ? "What did you borrow for?"
                  : kind === "lend"
                    ? "What did you lend for?"
                    : "Optional note"
              }
              rows={2}
              maxLength={120}
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
            {editing ? "Save" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------- Skeleton ----------------------------- */

function ExpensesSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-12 w-48 animate-pulse border-2 border-[var(--pixel-line)] bg-muted pixel-shadow-sm" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse border-2 border-[var(--pixel-line)] bg-muted pixel-shadow-sm"
          />
        ))}
      </div>
      <div className="h-20 animate-pulse border-2 border-[var(--pixel-line)] bg-muted pixel-shadow-sm" />
      <div className="h-72 animate-pulse border-2 border-[var(--pixel-line)] bg-muted pixel-shadow" />
    </div>
  );
}
