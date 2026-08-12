import type { Task, Expense, StudyGoal, StudySession, Note } from "@/lib/types";
import { daysFromTodayISO, todayISO } from "@/lib/format";

/**
 * Demo / seed data factories.
 *
 * Each function returns a FRESH array (new object references) with dates
 * computed relative to "now" at call time — so "Load Demo Data" always
 * produces dates relative to the moment the user clicks it.
 *
 * The stores initialize EMPTY by default; this data is only loaded when the
 * user explicitly chooses "Load Demo Data" (Settings → Data, or the
 * dashboard's empty-state CTA).
 */

const nowISO = () => new Date().toISOString();

export function createSeedTasks(): Task[] {
  return [
    {
      id: "seed-task-1",
      title: "Complete Java Assignment",
      description: "Finish the OOP inheritance problem set and submit on portal.",
      category: "Academics",
      priority: "High",
      dueDate: daysFromTodayISO(2),
      completed: false,
      createdAt: nowISO(),
    },
    {
      id: "seed-task-2",
      title: "Study DBMS chapter 6",
      description: "Normalization + ACID properties revision.",
      category: "Academics",
      priority: "Medium",
      dueDate: todayISO(),
      completed: false,
      createdAt: nowISO(),
    },
    {
      id: "seed-task-3",
      title: "Complete Internship Report",
      description: "Compile Chapter 7 — Training + Mini Project.",
      category: "Academics",
      priority: "High",
      dueDate: daysFromTodayISO(-1),
      completed: true,
      createdAt: nowISO(),
    },
    {
      id: "seed-task-4",
      title: "Pay hostel mess bill",
      description: "",
      category: "Errands",
      priority: "Medium",
      dueDate: daysFromTodayISO(4),
      completed: false,
      createdAt: nowISO(),
    },
  ];
}

export function createSeedExpenses(): Expense[] {
  return [
    {
      id: "seed-exp-1",
      amount: 2000,
      category: "Food",
      description: "Mess + canteen (month)",
      date: daysFromTodayISO(-6),
      createdAt: nowISO(),
    },
    {
      id: "seed-exp-2",
      amount: 800,
      category: "Education",
      description: "DBMS reference book",
      date: daysFromTodayISO(-4),
      createdAt: nowISO(),
    },
    {
      id: "seed-exp-3",
      amount: 600,
      category: "Transport",
      description: "Metro recharge",
      date: daysFromTodayISO(-3),
      createdAt: nowISO(),
    },
    {
      id: "seed-exp-4",
      amount: 450,
      category: "Entertainment",
      description: "Movie night",
      date: daysFromTodayISO(-2),
      createdAt: nowISO(),
    },
    {
      id: "seed-exp-5",
      amount: 400,
      category: "Other",
      description: "Stationery",
      date: daysFromTodayISO(-1),
      createdAt: nowISO(),
    },
    {
      id: "seed-exp-6",
      amount: 250,
      category: "Food",
      description: "Dinner",
      date: todayISO(),
      createdAt: nowISO(),
    },
  ];
}

/** Build N study sessions across the last `days` (deterministic, varied minutes). */
function buildSessions(
  days: number,
  pattern: number[],
  startIndex = 0
): StudySession[] {
  const out: StudySession[] = [];
  for (let i = 0; i < days; i++) {
    const mins = pattern[(i + startIndex) % pattern.length];
    if (mins > 0) {
      out.push({
        id: `seed-sess-${startIndex}-${i}`,
        date: daysFromTodayISO(-(days - 1 - i)),
        minutes: mins,
      });
    }
  }
  return out;
}

export function createSeedGoals(): StudyGoal[] {
  // 1) The headline plan: "Learn DSA in 2 months", 2h/day, ~12 days in,
  //    slightly behind (a couple of skipped days) so the UI shows a deficit.
  const dsaDays = 12;
  const dsaSessions = buildSessions(dsaDays, [120, 120, 90, 0, 120, 120, 60], 0);

  // 2) DBMS exam prep, 1h/day, ~5 days in, on track.
  const dbmsDays = 5;
  const dbmsSessions = buildSessions(dbmsDays, [60, 60, 45, 60, 60], 7);

  // 3) A completed React plan (target date passed, sessions fill the span).
  const reactDays = 14;
  const reactSessions = buildSessions(
    reactDays,
    [30, 30, 30, 30, 30, 30, 30],
    14
  );

  return [
    {
      id: "seed-goal-1",
      subject: "DSA",
      topic: "Learn DSA in 2 months",
      startDate: daysFromTodayISO(-(dsaDays - 1)),
      targetDate: daysFromTodayISO(48),
      dailyMinutesGoal: 120, // 2h/day
      priority: "High",
      sessions: dsaSessions,
      createdAt: nowISO(),
    },
    {
      id: "seed-goal-2",
      subject: "DBMS",
      topic: "DBMS exam prep",
      startDate: daysFromTodayISO(-(dbmsDays - 1)),
      targetDate: daysFromTodayISO(20),
      dailyMinutesGoal: 60, // 1h/day
      priority: "Medium",
      sessions: dbmsSessions,
      createdAt: nowISO(),
    },
    {
      id: "seed-goal-3",
      subject: "React",
      topic: "React mastery sprint",
      startDate: daysFromTodayISO(-reactDays),
      targetDate: daysFromTodayISO(-1),
      dailyMinutesGoal: 30,
      priority: "Low",
      sessions: reactSessions,
      createdAt: nowISO(),
    },
  ];
}

export function createSeedNotes(): Note[] {
  return [
    {
      id: "seed-note-1",
      title: "DBMS Important Questions",
      content:
        "1. Explain normalization\n2. What is 2NF?\n3. Explain ACID properties\n4. Difference between INNER and OUTER join",
      category: "Academics",
      updatedAt: nowISO(),
      createdAt: nowISO(),
    },
    {
      id: "seed-note-2",
      title: "Java Collections — quick recap",
      content:
        "List → ArrayList (random access), LinkedList (insert/delete)\nSet → HashSet (no order), TreeSet (sorted)\nMap → HashMap, TreeMap",
      category: "Academics",
      updatedAt: nowISO(),
      createdAt: nowISO(),
    },
    {
      id: "seed-note-3",
      title: "Project ideas",
      content:
        "- Expense splitter for trips\n- Habit tracker with streaks\n- Campus event aggregator",
      category: "Ideas",
      updatedAt: nowISO(),
      createdAt: nowISO(),
    },
  ];
}

export const DEFAULT_STUDENT_NAME = "Student";
export const DEMO_STUDENT_NAME = "Aditya";
