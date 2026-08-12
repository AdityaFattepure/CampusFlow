# CampusFlow — Worklog

CampusFlow is a Student Productivity & Expense Management System (Next.js 16 +
TS + Tailwind 4 + shadcn/ui). All data is persisted client-side in `localStorage`
via Zustand `persist` stores. Single visible route: `/`.

---
Task ID: 1
Agent: main (orchestrator)
Task: Build the foundation — theme palette, domain types, localStorage-backed
Zustand stores with seed data, formatting helpers, theme provider/toggle,
hydration guard, and shared UI building blocks.

Work Log:
- Updated `src/app/globals.css` with an emerald "growth / productivity" palette
  (primary = emerald, no indigo/blue chrome). Defined chart hues + sidebar
  tokens for light & dark. Added a thin custom scrollbar utility.
- `src/lib/types.ts` — all domain types: `Task`, `Expense`, `StudyGoal`,
  `Note`, plus `TaskCategory`/`ExpenseCategory`/`NoteCategory`/`Priority`
  literal unions and `ModuleKey`. Exported the category literal arrays.
- `src/lib/format.ts` — `uid()`, date helpers (`todayISO`, `daysFromTodayISO`,
  `formatDate`, `relativeDay`, `isSameMonth`, `monthLabel`), INR currency
  formatting (`formatINR`, `formatINRCompact`), and visual meta maps
  (`PRIORITY_STYLES`, `EXPENSE_CATEGORY_META`, `NOTE_CATEGORY_STYLES`,
  `TASK_CATEGORY_STYLES`).
- `src/lib/store.ts` — 5 Zustand `persist` stores, each with its own
  localStorage key: `campusflow:tasks`, `campusflow:expenses`,
  `campusflow:studyGoals`, `campusflow:notes`, `campusflow:settings`.
  Initial state carries realistic SEED data (Java assignment, DBMS tasks,
  dinner expense, Java Collections goal, DBMS note, etc.) so the app is
  populated on first visit; user edits/deletions always win afterwards.
  Store APIs:
  - `useTaskStore`: tasks[], addTask, updateTask, deleteTask, toggleTask,
    setCompleted, clearCompleted
  - `useExpenseStore`: expenses[], addExpense, updateExpense, deleteExpense
  - `useStudyStore`: goals[], addGoal, updateGoal, deleteGoal, setProgress,
    toggleGoal  (setProgress auto-marks completed at 100%)
  - `useNoteStore`: notes[], addNote, updateNote, deleteNote
  - `useSettingsStore`: studentName ("Aditya" default), setStudentName
- `src/hooks/use-hydrated.ts` — `useHydrated()` mounted-flag hook to gate
  rendering of localStorage-sourced data and avoid SSR hydration mismatches.
- `src/components/theme-provider.tsx` + `src/components/theme-toggle.tsx` —
  next-themes provider (class strategy, default light, no system) and an
  animated sun/moon toggle button.
- Shared UI building blocks (in `src/components/shared/`):
  - `module-header.tsx` — `ModuleHeader({icon,title,description,actions})`
  - `stat-card.tsx` — `StatCard({icon,label,value,sub,tone})` tone in
    primary|amber|rose|violet|teal
  - `empty-state.tsx` — `EmptyState({icon,title,description,action})`
  - `confirm-dialog.tsx` — `ConfirmDialog({trigger,onConfirm,...})` (wraps
    shadcn AlertDialog for delete confirmations)
- `src/app/layout.tsx` — wrapped children in `<ThemeProvider>`, added
  Sonner toaster (top-center, richColors), CampusFlow metadata.
- Layout dir created: `src/components/layout`, `src/components/modules/*`.

Stage Summary:
- Foundation complete. Design language: emerald primary, rounded-xl cards with
  `p-5`/`p-6`, `ModuleHeader` at top of each module, `StatCard` for KPIs,
  `EmptyState` for empty lists, `ConfirmDialog` for deletes, toasts via
  `sonner` (`import { toast } from "sonner"`).
- Available shadcn/ui components (all in `src/components/ui/`): button, card,
  badge, input, textarea, label, select, checkbox, switch, dialog,
  alert-dialog, popover, tooltip, tabs, progress, slider, scroll-area,
  separator, dropdown-menu, sheet, command, table, calendar, form, chart,
  sidebar, etc. Icons: `lucide-react`.
- IMPORTANT for subagents: each module view MUST start with `"use client";`,
  read its store via the hooks above, gate data display with `useHydrated()`,
  use `toast` from `sonner` for feedback, and reuse the shared components.
  No new route files — only components under `src/components/modules/<name>/`.

---
Task ID: 4-d
Agent: notes-module-builder
Task: Build the Notes module view component.

Work Log:
- Read the foundation (types, format helpers, store, shared components, the
  shadcn ui components I planned to use: button, card, badge, input, textarea,
  label, select, dialog, skeleton) and confirmed exact export names + prop
  shapes before writing any code.
- Created `src/components/modules/notes/notes-view.tsx` — a single client
  component `NotesView()` (no props) that reads `useNoteStore()`.
- Implemented create/edit via a single shared `Dialog` whose mode is driven by
  `editingId` (null = create). Form state = `{ title, content, category }`,
  default category "Academics". Validation: trimmed title + content must be
  non-empty (also marked `required` on the inputs as a progressive-enhancement
  fallback). On submit → `addNote`/`updateNote` + toast "Note created" /
  "Note updated".
- Delete via the shared `ConfirmDialog` wrapping a per-card trash icon button;
  on confirm → `deleteNote` + toast "Note deleted".
- Search: case-insensitive match on title OR content; clearable (X button).
- Category filter: a `Select` ("All categories" + 5 categories) plus a
  quick-filter chip row showing per-category counts (and total for "All").
- Notes grid: `grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4`. Each card
  shows title (truncate 1 line) + tinted `NOTE_CATEGORY_STYLES` Badge +
  Edit/Delete icon buttons in the header, a `line-clamp-4 whitespace-pre-line`
  content preview, and a footer "Updated {formatDate(updatedAt)}". Picked the
  explicit-icon-button approach (consistent — no nested-button issues).
- Stats: 3 `StatCard`s — Total notes (primary), Academics count (teal),
  Updated today (amber). Computed via `useMemo` from store data.
- Sort: newest `updatedAt` first (lexicographic ISO compare).
- Hydration guard: `useHydrated()` → skeleton (header + 3 stat skeletons +
  controls skeleton + 6 card skeletons) until mounted; no SSR mismatch.
- Responsive + accessible: aria-labels on icon buttons / search / select,
  `aria-pressed` on filter chips, `Label htmlFor` pairings, form `onSubmit`
  with explicit submit button. Emerald design system throughout (primary +
  teal/amber accents, no blue/indigo chrome).

Stage Summary:
- File created: `src/components/modules/notes/notes-view.tsx` (single file,
  starts with `"use client";`, strict TS, no `any`).
- Features: create / edit / delete notes, search by title or content,
  filter by category (Select + count chips), responsive 3-col grid,
  line-clamped content previews, 3 stat cards, newest-first sort, hydration
  skeleton, sonner toasts for all mutations.
- Notes: Reused the shared `ModuleHeader` / `StatCard` / `EmptyState` /
  `ConfirmDialog` blocks verbatim. The dialog `onOpenChange` resets form +
  `editingId` on close so re-opening never shows stale state. EmptyState
  differentiates "no notes at all" (CTA: New Note) vs "no filter matches"
  (CTA: Clear filters). The `Pin` icon from the suggested list was not needed.
- Next: drop `<NotesView />` into the dashboard route's module switch.

---
Task ID: 4-a
Agent: tasks-module-builder
Task: Build the Tasks module view component (CRUD + search/filter/sort + stats).

Work Log:
- Read the foundation laid by Task 1: types (`Task`, `TaskInput`, `Priority`,
  `TASK_CATEGORIES`), `useTaskStore` API, `format.ts` helpers (`formatDate`,
  `relativeDay`, `todayISO`, `PRIORITY_STYLES`, `TASK_CATEGORY_STYLES`),
  `useHydrated` hook, and shared components `ModuleHeader`/`StatCard`/
  `EmptyState`/`ConfirmDialog`.
- Inspected shadcn/ui source for `select`, `dialog`, `checkbox`, `button`,
  `badge`, `input`, `textarea`, `label`, `card`, `skeleton`, `separator` to
  confirm exact exported subcomponents and prop signatures before use.
- Created `src/components/modules/tasks/tasks-view.tsx` as a single
  `"use client";` file. Self-contained: pulls everything from `@/lib`,
  `@/components/shared/*`, `@/components/ui/*`, `@/hooks/use-hydrated`,
  `lucide-react`, and `sonner`. No new helper files.
- Implemented a reusable `Field` wrapper (label + required marker + error
  slot) kept inside the same file per the spec.
- Implemented a `TaskFormDialog` (used for both Add and Edit) with controlled
  local state, `(Re)seed on open` effect so opening in edit mode prefills the
  form and opening in add mode resets it, inline title validation (disabled
  submit + error message on attempt), native `<input type="date">` defaulting
  to `todayISO()`, category & priority Selects, optional description textarea.
  Submits via form `onSubmit` (preventDefault), toasts on success.
- Implemented a `TasksSkeleton` (matches the layout — header, stats grid,
  controls bar, task list) shown until `useHydrated()` returns true, to avoid
  SSR/localStorage hydration mismatch.
- Implemented the main `TasksView` with:
  * `ModuleHeader` (icon, title "Tasks", description, Clear completed (ghost,
    only when completedCount>0) + Add task actions).
  * Stats row: `grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4` — Total
    (primary), Pending (amber, sub="N due today"), Completed (teal, sub=%),
    Overdue (rose). Overdue = `dueDate < todayISO() && !completed`.
  * Controls Card with mobile-first `grid grid-cols-1 sm:grid-cols-2
    lg:grid-cols-4 gap-2`: Search input (leading Search icon, clear "X" button,
    aria-label), Category filter Select ("All categories" + 5 categories),
    Priority filter Select ("All priorities" + Low/Medium/High), Sort Select
    (Due earliest / Due latest / Priority high→low / Recently added; default
    due-earliest which naturally surfaces overdue items first).
  * Active-filters indicator ("Showing N of M tasks" + "Reset filters"
    link) shown when search/category/priority are non-default.
  * Task list as a `Card` of `divide-y` rows. Each row: Checkbox (toggle
    complete), CheckCircle2/Circle status icon, title (line-through + muted when
    completed), optional 2-line description, badges row (category via
    TASK_CATEGORY_STYLES, priority via PRIORITY_STYLES with colored dot,
    due-date chip showing formatDate + relativeDay in parentheses with
    rose tone when overdue / amber when due today), edit icon button (opens
    the same dialog prefilled), delete via `ConfirmDialog`.
  * Two distinct empty states: "No tasks yet" (CTA = Add first task) when the
    store is empty, and "No tasks match" (CTA = Reset filters) when filters
    hide everything.
- Toggled `toast.success` on add / edit / delete / toggle-complete /
  toggle-pending / clear-completed. Strictly emerald palette; no blue/indigo.
  All icon buttons carry `aria-label`s; Selects carry `aria-label`; search
  input has `aria-label`.

Stage Summary:
- File created: `src/components/modules/tasks/tasks-view.tsx` (single file,
  `"use client";`, default + named export `TasksView`).
- Features implemented: Add / Edit / Delete / Toggle-complete (CRUD), text
  search (title+description, case-insensitive), category filter, priority
  filter, 4-way sort (default due-earliest), 4 StatCards (Total/Pending/
  Completed/Overdue) with appropriate tones, Clear-completed action in header
  (shown only when completed>0), active-filter indicator with reset, two
  empty states (no tasks at all vs no matches), hydration skeleton,
  responsive mobile-first layout (grid stacks 1→2→4 cols), accessibility
  (aria-labels, label htmlFor pairing, semantic list), toasts via sonner.
- Notes / decisions:
  * Used natural page scroll for the task list (not a `ScrollArea`) per the
    "Keep it simple" guidance in the spec.
  * Sort by due-earliest uses plain `String.localeCompare` on yyyy-mm-dd —
    overdue items (past dates) automatically bubble to the top.
  * The form is a controlled dialog component with a `useEffect` that re-seeds
    state whenever `open` flips to true; this avoids stale state between
    add/edit sessions and removes the need for a `key` remount.
  * Both `export function TasksView()` and `export default TasksView` are
    provided so any import style works for the orchestrator.

---
Task ID: 4-c
Agent: study-module-builder
Task: Build the Study Planner module view component.

Work Log:
- Read the foundation (types.ts, store.ts, format.ts, use-hydrated hook) and the
  shared components (module-header, stat-card, empty-state, confirm-dialog) plus
  the shadcn primitives actually consumed (button, card, badge, input, label,
  select, dialog, progress, slider) to confirm exact prop shapes — Slider is
  radix-based and takes `value={[n]}` + `onValueChange={(v)=>v[0]}`; Progress is
  `<Progress value={n} />`.
- Created `src/components/modules/study/study-view.tsx` (single client component
  file, starts with `"use client";`, strict TS, no `any`).
- Internal pieces (all in the same file):
  • `GoalFormDialog` — reused for Add & Edit. Fields: Subject (Input, required),
    Topic (Input, required), Priority (Select, default "Medium"), Target date
    (`<input type="date">`, default `daysFromTodayISO(7)`), Progress (Slider
    0-100, default 0). Local form state re-seeds from `initial` whenever the
    dialog opens (effect guarded on `open`); validation shows inline error for
    empty subject/topic. `initial` is memoised in the parent so typing is never
    wiped mid-edit.
  • `GoalCard` — header (subject + priority badge via PRIORITY_STYLES, edit +
    delete actions, delete wrapped in `ConfirmDialog`), topic line, progress
    row (`<Progress>` + % label, green CheckCircle2 "Completed" when done),
    interactive `Slider` (only when not completed, aria-labelled), footer with
    `formatDate` + `relativeDay` chip (rose when overdue) and a
    Mark complete / Reopen button wired to `toggleGoal`.
  • `StudySkeleton` — pulse placeholders shown until `useHydrated()` returns true.
- `StudyView` (exported):
  • `ModuleHeader` with GraduationCap icon + "Add Goal" primary action.
  • Featured "Overall Study Progress" Card (p-6) — big `text-4xl` %, sublabel
    "across N goals", a TrendingUp chip ("X/N done"), and a `<Progress>` bar.
  • 4 `StatCard`s: Overall Progress % (primary), Active Goals (amber),
    Completed (teal), Due This Week (rose — targetDate within next 7 days &
    not completed).
  • Controls row: subject filter Select ("All subjects" + unique subjects) and
    sort Select ("Target date" default, "Progress", "Priority").
  • Goal list: `grid grid-cols-1 md:grid-cols-2 gap-4` of `GoalCard`s, or
    `EmptyState` with an "Add Goal" CTA when none.
- Store wiring: `addGoal` (auto-sets `completed:true` when progress≥100),
  `updateGoal` (syncs completed with progress while preserving manual
  overrides), `setProgress` (live, no debounce), `toggleGoal`, `deleteGoal`.
- Toasts via sonner: "Goal added", "Goal updated", "Goal deleted",
  "Goal completed 🎉" (fired when the inline slider reaches 100 or when a goal
  is toggled complete).
- Accessibility: aria-labels on every icon button (edit/delete/toggle) and on
  both Slider instances + both filter Selects; form inputs use Label+htmlFor
  association; error messages carry `role="alert"`.
- Emerald design system only (primary = emerald); completed cards dimmed to
  opacity-70; rose tone reserved for overdue / due-this-week signals.

Stage Summary:
- File created: `src/components/modules/study/study-view.tsx`.
- Features: add/edit (dialog form w/ validation), delete (ConfirmDialog),
  live inline progress Slider with auto-complete at 100%, manual complete
  toggle, featured overall-progress card, 4 KPI StatCards, subject filter +
  3-way sort (default target date), empty state, hydration skeleton.
- Notes: no dev/build/lint run (per instructions). Slider/Progress props
  verified against the local shadcn sources. `BookOpen` icon was listed as
  available but unused — omitted to keep imports clean. The component reads
  `useStudyStore()` directly and takes no props, ready to be dropped into the
  dashboard / module switcher.

---
Task ID: 4-b
Agent: expenses-module-builder
Task: Build the Expenses module view component.

Work Log:
- Read the foundation worklog (Task 1) plus all the relevant source files:
  `src/lib/types.ts`, `src/lib/format.ts`, `src/lib/store.ts`,
  `src/hooks/use-hydrated.ts`, `src/components/shared/{module-header,
  stat-card, empty-state, confirm-dialog}.tsx`, and the shadcn primitives
  `chart.tsx`, `dialog.tsx`, `select.tsx`, `button.tsx`, `card.tsx`,
  `badge.tsx`, `input.tsx`, `textarea.tsx`, `label.tsx`, `table.tsx`,
  `separator.tsx`, `skeleton.tsx`. Confirmed exact exported subcomponents and
  the ChartContainer/ChartTooltip/ChartTooltipContent/ChartConfig API.
- Created `src/components/modules/expenses/expenses-view.tsx`
  (single client component, starts with `"use client";`).
- Implemented a reusable `ExpenseFormDialog` (used for both add & edit):
  - Amount (number input with ₹ glyph, validated > 0; inline error + disabled
    submit; toast.error("Enter a valid amount") on invalid submit).
  - Category Select (default "Food", all 7 EXPENSE_CATEGORIES).
  - Date `<input type="date">` defaulting to todayISO, capped to today.
  - Optional description Textarea.
  - Form state resets on dialog open via useEffect (so prefilled edit data is
    always fresh). Add path calls addExpense + toast.success("Expense added");
    edit path calls updateExpense + toast.success("Expense updated").
- Implemented the main `ExpensesView`:
  - Hydration guard via `useHydrated()` → renders a Skeleton layout until
    mounted (also covers the chart, since the chart only mounts post-hydrate).
  - ModuleHeader (Wallet icon, title "Expenses", description
    "Track where your money goes", primary "Add Expense" action).
  - Stat row: `grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4` with 4
    StatCards: This Month total (primary, sub = month transaction count),
    All-time total (teal), Transactions count in current filter (violet),
    Top Category this month (amber, sub = amount). Month label rendered via
    `monthLabel()`.
  - Controls bar (stacks on mobile, row on sm+): search input (with search
    icon, case-insensitive substring match on description), Category Select
    ("All categories" + 7), Time filter Select ("This Month" default,
    "This Week", "All Time"), Sort Select (Newest / Oldest / Amount High→Low /
    Amount Low→High).
  - Time-filter helpers: `matchesTimeFilter` uses `isSameMonth` for month and
    a `withinThisWeek` (last 7 calendar days incl. today) for week.
  - Two-column section (`grid grid-cols-1 lg:grid-cols-2 gap-4`):
    * Left card = donut chart (recharts PieChart with innerRadius 62 /
      outerRadius 88) wrapped in shadcn `ChartContainer`. ChartConfig is built
      dynamically from the categories present in the filtered set; each slice
      is filled with `EXPENSE_CATEGORY_META[cat].color`. ChartTooltip uses
      ChartTooltipContent with a custom formatter that renders
      `<category name> ... <formatINR(value)>`. A centered overlay shows
      "Total" + formatINRCompact(filteredTotal). Chart is only rendered when
      filteredTotal > 0 (guarded).
    * Right card = breakdown list: each row = colored dot (inline-style bg
      from meta.color) + category name + formatINR(amount) + percentage, plus
      a thin progress bar tinted with the same color. Sorted desc by amount.
  - History section: shadcn Table on `sm+` (Date / Category badge with
    tinted dot / Description (truncated, italic "No description" fallback) /
    right-aligned formatINR amount / Edit + Delete actions). Falls back to a
    compact card list on mobile. Sorted per the sortKey.
  - Delete uses the shared ConfirmDialog → deleteExpense + toast.success(
    "Expense deleted"). All action buttons have descriptive `aria-label`s.
  - Empty state (shared EmptyState component) when no expenses match the
    filter, with an inline "Add Expense" CTA.
- Strict TS throughout (typed FormState, TimeFilter, SortKey, CategoryFilter;
  no `any`). ChartConfig is declared via `satisfies ChartConfig`.
- Did NOT run dev/build/lint (per constraints). Only touched the one module
  file plus this worklog append.

Stage Summary:
- File created: `src/components/modules/expenses/expenses-view.tsx`
  (exports `ExpensesView`, no props, reads `useExpenseStore`).
- Features implemented: add/edit/delete expense with toasts; category filter
  (All + 7); time filter (Month default / Week / All Time); description search;
  4 StatCards (This Month, All-time, Transactions, Top Category); donut chart
  with center total + INR tooltip + dynamic ChartConfig; sorted breakdown list
  with colored progress bars; responsive history (table on desktop, card list
  on mobile); empty state; hydration skeleton; emerald/category-meta colors
  (no blue/indigo chrome).
- Notes: The form dialog resets via useEffect on open so edit prefills always
  reflect the latest expense. Chart and all data-driven UI are gated behind
  `useHydrated()` so there is no SSR mismatch. Recharts `PieChart`/`Pie`/`Cell`
  are imported from `"recharts"`; shadcn chart wrappers from
  `@/components/ui/chart`. The component is ready to be mounted on the
  dashboard / `/` route by the orchestrator.

---
Task ID: 5 + 6 + 7
Agent: main (orchestrator)
Task: Build the Dashboard view, assemble the responsive app shell, wire the
page, and perform end-to-end verification with Agent Browser.

Work Log:
- Built `src/components/modules/dashboard/dashboard-view.tsx`: emerald welcome
  banner (time-aware greeting using studentName + today's date + quick summary),
  4 clickable StatCards (Pending tasks / Spent this month / Study progress /
  Notes saved) that navigate to their modules, "Today's tasks" list with inline
  complete-toggle checkboxes, "Expense overview" with a recharts horizontal
  BarChart (per-category colors from EXPENSE_CATEGORY_META) + breakdown list,
  "Study progress" overall % + Progress bars for top goals, "Recent notes"
  preview. Gated with useHydrated + a DashboardSkeleton.
- Built `src/components/layout/app-shell.tsx`: desktop sticky sidebar (brand,
  nav, EditNameButton dialog for the student name, ThemeToggle), desktop sticky
  header (breadcrumb + NotificationsPopover), mobile top bar (brand + bell +
  theme), mobile fixed bottom tab nav (5 tabs), sticky footer. Module switching
  via a switch (Dashboard gets onNavigate, the 4 CRUD views are prop-less).
- `src/app/page.tsx` renders `<AppShell />`. `layout.tsx` already wired with
  ThemeProvider + Sonner toaster + metadata.
- Dispatched the 4 CRUD modules to parallel subagents (Tasks 4-a, Expenses 4-b,
  Study 4-c, Notes 4-d) — all delivered and integrated.
- FIXED hydration mismatch: Radix Popover/Tooltip/Dialog `useId` ids diverged
  between SSR and client (aria-controls mismatches). Gated the whole AppShell
  behind `useHydrated()` with a Radix-free `AppShellSkeleton` (plain divs,
  no useId) so SSR and the hydration render match exactly, then the interactive
  app mounts. Also rewrote `useHydrated` with `useSyncExternalStore`
  (lint-clean, no setState-in-effect).
- Verification with Agent Browser (Playwright Chromium):
  * Dashboard renders all sections with seed data; greeting, 4 stat cards,
    today's tasks, expense bar chart, study progress, recent notes.
  * Tasks: Add task dialog → form validation (submit disabled until title) →
    task added with toast → toggle complete → verified. Cleared localStorage
    confirmed `campusflow:tasks` persists "Submit Lab Report", completed:true.
  * Expenses: Add ₹500 expense → total updated ₹4,500 → ₹5,000 live, new row
    "Lunch ₹500" + donut chart + breakdown list.
  * Study: interactive slider moved Java Collections 70→80 via keyboard.
  * Notes: created "OS Scheduling Algorithms" note → card + toast.
  * Dark mode: toggled light→dark, reloaded → "dark" persisted (next-themes).
  * Mobile (390x844): bottom tab nav appears, sidebar hidden, layout adapts;
    footer_bottom(viewport)=780 vs nav_top=787 → no overlap (sticky footer
    correct on mobile). Desktop footer pushed to doc bottom on long content.
  * No console errors / no page errors after the hydration fix. `bun run lint`
    is clean.

Stage Summary:
- CampusFlow is complete and browser-verified. All 5 modules functional,
  cross-module dashboard reads live from the stores, localStorage persistence
  confirmed, dark mode persisted, responsive (desktop sidebar + mobile bottom
  nav), sticky footer on both layouts, hydration-clean.
- Screenshots saved: verify-desktop-light.png, verify-desktop-dark.png,
  verify-mobile-light.png, verify-mobile-dark.png.
