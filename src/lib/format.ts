import type {
  ExpenseCategory,
  NoteCategory,
  Priority,
  StudyGoal,
  TaskCategory,
} from "./types";

/** Generate a reasonably-unique id (crypto.randomUUID with fallback). */
export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Today's date as yyyy-mm-dd (local). */
export function todayISO(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}

/** A near-future date n days from today, as yyyy-mm-dd. */
export function daysFromTodayISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}

/** Format an amount as Indian Rupees, e.g. ₹4,250 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

/** Compact rupee for small stat chips, e.g. ₹4.2k */
export function formatINRCompact(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}k`;
  return formatINR(amount);
}

/** Human friendly date, e.g. "15 Aug 2026". */
export function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Relative day label for due dates: Today / Tomorrow / Yesterday / n days. */
export function relativeDay(iso: string): string {
  if (!iso) return "";
  const today = new Date(todayISO() + "T00:00:00");
  const target = new Date(iso + "T00:00:00");
  const diff = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  return `in ${diff}d`;
}

/** Whether a yyyy-mm-dd date is in the given calendar month (yyyy-mm). */
export function isSameMonth(iso: string, ref: Date = new Date()): boolean {
  if (!iso) return false;
  const d = new Date(iso + "T00:00:00");
  return (
    d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear()
  );
}

export function monthLabel(ref: Date = new Date()): string {
  return ref.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

// ---------- visual mapping helpers ----------

export const PRIORITY_STYLES: Record<
  Priority,
  { className: string; dot: string; label: string }
> = {
  High: {
    className:
      "bg-rose-500/12 text-rose-600 dark:text-rose-300 border-rose-500/25",
    dot: "bg-rose-500",
    label: "High",
  },
  Medium: {
    className:
      "bg-amber-500/12 text-amber-600 dark:text-amber-300 border-amber-500/25",
    dot: "bg-amber-500",
    label: "Medium",
  },
  Low: {
    className:
      "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300 border-emerald-500/25",
    dot: "bg-emerald-500",
    label: "Low",
  },
};

// Distinct, accessible chart hues per expense category (no flat blue chrome).
export const EXPENSE_CATEGORY_META: Record<
  ExpenseCategory,
  { color: string; label: string }
> = {
  Food: { color: "oklch(0.75 0.17 65)", label: "Food" },
  Transport: { color: "oklch(0.7 0.12 190)", label: "Transport" },
  Education: { color: "oklch(0.7 0.17 155)", label: "Education" },
  Shopping: { color: "oklch(0.65 0.2 15)", label: "Shopping" },
  Entertainment: { color: "oklch(0.62 0.19 300)", label: "Entertainment" },
  Bills: { color: "oklch(0.8 0.15 95)", label: "Bills" },
  Other: { color: "oklch(0.6 0.02 250)", label: "Other" },
};

export const NOTE_CATEGORY_STYLES: Record<NoteCategory, string> = {
  Academics:
    "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300 border-emerald-500/25",
  Personal:
    "bg-violet-500/12 text-violet-600 dark:text-violet-300 border-violet-500/25",
  Ideas:
    "bg-amber-500/12 text-amber-600 dark:text-amber-300 border-amber-500/25",
  Reference:
    "bg-teal-500/12 text-teal-600 dark:text-teal-300 border-teal-500/25",
  Other: "bg-muted text-muted-foreground border-border",
};

export const TASK_CATEGORY_STYLES: Record<TaskCategory, string> = {
  Academics:
    "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300 border-emerald-500/25",
  Personal:
    "bg-violet-500/12 text-violet-600 dark:text-violet-300 border-violet-500/25",
  Errands:
    "bg-amber-500/12 text-amber-600 dark:text-amber-300 border-amber-500/25",
  Health:
    "bg-teal-500/12 text-teal-600 dark:text-teal-300 border-teal-500/25",
  Other: "bg-muted text-muted-foreground border-border",
};

// ---------------------------------------------------------------------
// Study-plan helpers. A StudyGoal is a timed commitment: learn <subject>
// for `dailyMinutesGoal` every day between startDate and targetDate.
// Progress is derived from logged sessions — never hand-set.
// ---------------------------------------------------------------------

/** Whole-day difference toISO - fromISO (can be negative). */
export function daysBetween(fromISO: string, toISO: string): number {
  const a = new Date(fromISO + "T00:00:00").getTime();
  const b = new Date(toISO + "T00:00:00").getTime();
  return Math.round((b - a) / 86_400_000);
}

/** "2h 30m" / "90m" / "2h". Never shows decimals. */
export function formatDuration(minutes: number): string {
  const m = Math.max(0, Math.round(minutes || 0));
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h === 0) return `${m}m`;
  if (rem === 0) return `${h}h`;
  return `${h}h ${rem}m`;
}

/** Compact: 120 -> "2h", 90 -> "1.5h", 45 -> "0.75h". */
export function formatHours(minutes: number): string {
  const h = (minutes || 0) / 60;
  return `${h % 1 === 0 ? h : h.toFixed(1)}h`;
}

export interface PlanStats {
  totalDays: number; // startDate..targetDate inclusive span
  daysElapsed: number; // clamped 0..totalDays
  daysRemaining: number; // clamped >= 0
  totalMinutesGoal: number; // dailyMinutesGoal * totalDays
  minutesDone: number; // sum of sessions
  minutesToday: number; // sessions dated today
  minutesRemaining: number; // max(0, totalGoal - done)
  expectedMinutesByToday: number; // dailyGoal * daysElapsed (what you should have done)
  deficitMinutes: number; // max(0, expected - done) — how far behind
  onTrack: boolean; // done >= expected
  percent: number; // done / totalGoal * 100, clamped 0..100
  streak: number; // consecutive days (ending today or yesterday) with a session
  isComplete: boolean; // percent >= 100 OR today >= targetDate
  hasStarted: boolean; // today >= startDate
}

const dayKey = (d: Date) => {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
};

/** Compute every derived stat for a study plan relative to "today". */
export function planStats(goal: StudyGoal, ref: Date = new Date()): PlanStats {
  const today = dayKey(ref);
  const totalDays = Math.max(
    1,
    daysBetween(goal.startDate, goal.targetDate) + 1
  ); // inclusive
  const rawElapsed = daysBetween(goal.startDate, today) + 1;
  const daysElapsed = Math.max(0, Math.min(totalDays, rawElapsed));
  const daysRemaining = Math.max(0, daysBetween(today, goal.targetDate));

  const minutesDone = goal.sessions.reduce((s, x) => s + (x.minutes || 0), 0);
  const minutesToday = goal.sessions
    .filter((s) => s.date === today)
    .reduce((s, x) => s + (x.minutes || 0), 0);

  const totalMinutesGoal = goal.dailyMinutesGoal * totalDays;
  const minutesRemaining = Math.max(0, totalMinutesGoal - minutesDone);
  const expectedMinutesByToday = goal.dailyMinutesGoal * daysElapsed;
  const deficitMinutes = Math.max(0, expectedMinutesByToday - minutesDone);
  const onTrack = minutesDone >= expectedMinutesByToday;
  const percent =
    totalMinutesGoal > 0
      ? Math.max(0, Math.min(100, Math.round((minutesDone / totalMinutesGoal) * 100)))
      : 0;
  const hasStarted = today >= goal.startDate;
  const isComplete =
    percent >= 100 || (goal.targetDate && today > goal.targetDate);

  // streak: consecutive days ending today or yesterday with a session > 0
  const daySet = new Set(
    goal.sessions.filter((s) => s.minutes > 0).map((s) => s.date)
  );
  let streak = 0;
  let cursor = new Date(ref);
  if (!daySet.has(dayKey(cursor))) {
    // grace: if today has none, start from yesterday
    cursor.setDate(cursor.getDate() - 1);
    if (!daySet.has(dayKey(cursor))) streak = 0;
    else {
      while (daySet.has(dayKey(cursor))) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      }
    }
  } else {
    while (daySet.has(dayKey(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
  }

  return {
    totalDays,
    daysElapsed,
    daysRemaining,
    totalMinutesGoal,
    minutesDone,
    minutesToday,
    minutesRemaining,
    expectedMinutesByToday,
    deficitMinutes,
    onTrack,
    percent,
    streak,
    isComplete,
    hasStarted,
  };
}

/** Pixel HP-bar segments for a 0-100 percent value. */
export function segmentsFor(percent: number, segments = 20): number {
  return Math.round((Math.max(0, Math.min(100, percent)) / 100) * segments);
}
