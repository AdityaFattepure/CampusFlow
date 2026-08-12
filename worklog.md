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

---
Task ID: P-1
Agent: main (orchestrator)
Task: Redesign the entire CampusFlow into a calm, minimal "Pixelscape" — pixel-art
aesthetic that stays mindful/readable to use.

Work Log:
- `src/app/globals.css` — full Pixelscape theme:
  - Fonts mapped: `--font-sans` / `--font-mono` → `var(--font-pixel)` (Pixelify
    Sans). New `--font-display` → Press Start 2P.
  - `--radius: 0` everywhere (sm/md/lg/xl all 0).
  - Two palettes: light "Dawn" (warm parchment canvas, deep ink lines, sage
    primary, amber/rose/violet/teal accents) and dark "Night" (warm charcoal
    canvas, cream lines, glowing sage). No blue/indigo chrome.
  - New pixel tokens: `--pixel-line` (high-contrast outline), `--pixel-shadow`
    (hard offset shadow color), `--pixel-line-soft`.
  - Pixel utility classes: `.pixel-border`, `.pixel-shadow`, `.pixel-shadow-sm`,
    `.pixel-shadow-primary`, `.pixel-inset`, `.pixel-btn` (interactive: shadow
    collapses on press), `.font-display`, `.pixel-dither` (4px checker), 
    `.pixel-segments` (HP-bar blocks).
  - Global `.pixelscape *` rule forces `border-radius:0 !important` (unlayered +
    important → beats Tailwind rounded-* utilities) so EVERY element is sharp.
  - Global pixel styling for shadcn slots: card (2px border + 4px block shadow),
    input/textarea/select-trigger (2px border + 2px shadow), badge (2px border),
    checkbox (square), progress (segmented fill via repeating gradient), tabs
    (underline), dialog/alert/popover/sheet content (2px border + 6px shadow) +
    overlays, buttons (pixel border + block shadow + press animation; ghost/link
    excluded via `data-variant`), select content/items, slider (square thumb),
    tooltip, scrollbars, recharts axis text, sonner toasts.
- `src/components/ui/button.tsx` — added `data-variant={variant ?? "default"}` so
  the global button CSS can exclude ghost/link from the pixel border/shadow.
- `src/app/layout.tsx` — loads `Pixelify_Sans` (--font-pixel) + `Press_Start_2P`
  (--font-press) via next/font; wraps children in `<div className="pixelscape">`.
  Metadata → "CampusFlow — Pixel Edition".
- `src/components/layout/pixel-logo.tsx` — NEW. SVG pixel graduation cap
  (crispEdges, 14×14 grid) in primary + amber tassel.
- `src/components/theme-toggle.tsx` — pixel-btn block toggle (sun/moon crossfade).
- `src/components/layout/app-shell.tsx` — pixel chrome: 2px borders everywhere,
  Brand = pixel cap tile (border + shadow) + Press Start 2P wordmark; nav
  buttons use border-2 + inset active state (primary fill, pixel-inset shadow);
  pixel footer with PixelLogo; mobile bottom nav with border-t-2 active marker;
  pixel skeleton mirrors the layout.
- `src/components/layout/notifications-popover.tsx` — trigger = pixel-btn with
  square destructive count badge; reminder icon chips = 2px border squares.
- Shared components pixelized:
  - `stat-card.tsx` — hard border (via Card global), square 2px icon chip, big
    value; new `display` prop renders value in Press Start 2P.
  - `module-header.tsx` — square icon tile with pixel-shadow-sm.
  - `empty-state.tsx` — 2px dashed border + blocky icon tile.
- `src/components/modules/dashboard/dashboard-view.tsx` — Pixelscape hero: dawn
  gradient (amber→sage→teal) with a pixel sun (square + inner block) + dithered
  ground strip, hard border + shadow; 4 stat cards with Press Start 2P numbers;
  "Today's tasks" + "Expenses" pixel cards (square category dots, divide-y-2);
  "Study progress" card with a 20-segment PixelBar (HP blocks) for overall +
  per-goal Progress bars; "Recent notes" pixel list. Pixel skeleton.

Stage Summary:
- Core Pixelscape design system is in place and propagates to ALL module views
  via the global `.pixelscape *` radius override + per-slot CSS (cards, buttons,
  inputs, selects, dialogs, popovers, sliders, tooltips, toasts, scrollbars).
- The 4 CRUD module views (tasks/expenses/study/notes) will inherit sharp
  corners, pixel fonts, pixel borders/shadows automatically. A focused pixel-
  polish pass on each (via parallel subagents) follows to swap residual soft
  shadows/rounded chips for pixel treatments and ensure cohesion.

---
Task ID: P-2d
Agent: notes-pixel-polish
Task: Pixel-style polish pass on the Notes module view.

Work Log:
- Read worklog P-1 entry to confirm the Pixelscape design system (tokens,
  utility classes, global shadcn overrides) and verified `StatCard` exposes
  the `display` prop for Press Start 2P numeric rendering.
- `src/components/modules/notes/notes-view.tsx` — surgical visual edits only;
  store logic, types, imports, hydration guard, toasts, search/filter/sort,
  CRUD handlers, and dialog form are untouched.
  - Stat cards: added `display` to all three numeric stat cards (Total notes,
    Academics count, Updated today) so counts render in Press Start 2P.
  - Note cards: title bumped from `font-medium` → `font-bold`; removed the
    soft `transition-shadow hover:shadow-md` on the `Card` so the global
    pixel block shadow is the only shadow. `line-clamp-4` content +
    muted "Updated" footer preserved.
  - Category quick-filter chips: rewrote as pixel tiles —
    `border-2 border-[var(--pixel-line)] px-2.5 py-1 text-xs font-semibold`;
    active state = `bg-primary text-primary-foreground pixel-inset`,
    inactive = `bg-card hover:bg-muted`. Removed `rounded-full` from both
    the chip and the inner count badge.
  - Action icon buttons (Edit / Delete) on each card: added
    `border-2 border-transparent hover:border-[var(--pixel-line)] hover:bg-muted`
    so they read as pixel tiles on hover; kept the existing
    `hover:text-foreground` (Edit) and `hover:text-destructive` (Delete).
  - Search input trailing clear (X) button: converted from `rounded-md` soft
    button to a pixel tile (`border-2 border-[var(--pixel-line)] bg-card
    hover:bg-muted`). Leading Search icon was already an uncontained,
    non-rounded absolutely-positioned icon — left as-is (no rounded-full).
  - Skeleton block: replaced `rounded-xl`/`rounded-md` with
    `border-2 border-[var(--pixel-line)] pixel-shadow-sm` on every placeholder
    so the loading state matches real pixel cards.
  - No gradients exist in this view, so no header/banner swap was needed.
  - Verified no `shadow-sm`/`shadow-md` utility remains on any button/card.
  - No blue/indigo introduced; palette stays sage/amber/teal.

Stage Summary:
- File edited: `src/components/modules/notes/notes-view.tsx` (only file touched).
- Changes: stat cards now use Press Start 2P display numerals; note titles
  are bolder; note cards rely solely on the global pixel shadow; category
  chips + count badges are sharp pixel tiles with `pixel-inset` active state;
  Edit/Delete icon buttons become pixel tiles on hover; search clear button
  is a pixel tile; skeletons now mirror the real pixel card chrome. All
  functionality (CRUD, search, category filter + chips, stats, hydration
  guard, toasts) preserved; no logic/types/imports changed.

---
Task ID: P-2a
Agent: tasks-pixel-polish
Task: Pixel-style polish pass on the Tasks module view.

Work Log:
- Read worklog P-1 entry to confirm Pixelscape design system (global radius:0
  override, pixel utility classes, StatCard `display` prop, palette tokens).
- Audited `tasks-view.tsx` for residual soft styling; found no `shadow-*`
  utilities on buttons/cards (global pixel CSS handles shadows) — clean.
- StatCards: added `display` prop to all four KPI cards (Total, Pending,
  Completed, Overdue) so the numeric values render in Press Start 2P chunky
  pixel digits while label/subtext stay in Pixelify Sans.
- Task rows: bumped title `<p>` from `font-medium` → `font-bold` (Pixelify Sans
  bold reads better at small sizes); changed list `<ul>` from bare `divide-y`
  to `divide-y-2 divide-[var(--pixel-line)]/40` for crisp 2px pixel dividers
  (matched in skeleton Card too).
- Priority dot inside priority Badge: changed `size-1.5 rounded-full` →
  `h-2 w-2` (crisp square, no rounded-full) for pixel consistency.
- Action icon buttons (Edit + Delete ghost Buttons): added
  `border-2 border-transparent hover:border-[var(--pixel-line)] hover:bg-muted`
  so they read as pixel tiles on hover instead of bare ghost icons. Delete
  button retains its `hover:text-destructive` tint.
- Search-clear X button: swapped `rounded p-1 hover:bg-accent` for
  `border-2 border-transparent p-1 hover:border-[var(--pixel-line)]
  hover:bg-muted` — matches the pixel-tile hover treatment of the action
  buttons.
- Skeleton (pre-hydration): stripped every explicit `rounded-*` class
  (cleanliness, even though global radius:0 already flattens them) and gave
  block-level placeholders a pixel outline so the skeleton mirrors the real
  pixel cards/buttons:
  - header icon tile (`h-11 w-11`) + header button (`h-9 w-28`) →
    `border-2 border-[var(--pixel-line)] pixel-shadow-sm`.
  - stat-card icon chips (`h-9 w-9`) → `border-2 border-[var(--pixel-line)]`
    (matches real StatCard icon chip which has border-2 only, no shadow).
  - controls-bar select/input placeholders (`h-9 w-full`) →
    `border-2 border-[var(--pixel-line)] pixel-shadow-sm` (matches pixel
    select border + 2px shadow).
  - per-row checkbox (`size-4`) → `border-2 border-[var(--pixel-line)]`.
  - per-row action buttons (`h-8 w-8`) → `border-2 border-[var(--pixel-line)]`.
  - tiny text-bar Skeletons left borderless (just shimmer) to avoid noisy
    borders around shimmering text placeholders.
  - skeleton task-list Card switched to `divide-y-2 divide-[var(--pixel-line)]/40`
    to mirror the real list Card.
- Verified: no `shadow-sm`/`shadow-md`/`shadow-none`/custom box-shadow classes
  remain on any button or Card; no `rounded-*` classes remain anywhere in the
  file; no blue/indigo introduced.
- Preserved ALL existing functionality: store hooks (addTask/updateTask/
  deleteTask/toggleTask/clearCompleted), FormState types, imports, search/
  filter/sort logic, stats math, hydration guard (`if (!hydrated) return
  <TasksSkeleton />`), toasts, ConfirmDialog for delete, both named and
  default exports.

Stage Summary:
- File edited: src/components/modules/tasks/tasks-view.tsx
- Changes:
  • 4 StatCards → `display` (Press Start 2P numeric values).
  • Task title → `font-bold`; list dividers → `divide-y-2 divide-[var(--pixel-line)]/40`.
  • Priority dot → square `h-2 w-2` (no rounded-full).
  • Edit/Delete ghost icon buttons → pixel-tile hover (`border-2 border-transparent
    hover:border-[var(--pixel-line)] hover:bg-muted`).
  • Search-clear button → matching pixel-tile hover treatment.
  • Skeleton: removed all `rounded-*`; added `border-2 border-[var(--pixel-line)]`
    (+ `pixel-shadow-sm` where it mirrors Card/button blocks) so the loading
    state visually matches the real pixel cards/selects/buttons.
  • Skeleton task-list Card uses the same `divide-y-2 divide-[var(--pixel-line)]/40`
    divider style as the hydrated list.
- No logic/types/store/hydration/toast changes; file still starts with
  `"use client";`; strict-TS clean (no `any`); responsive + a11y preserved.

---
Task ID: P-2c
Agent: study-pixel-polish
Task: Pixel-style polish pass on the Study Planner module view.

Work Log:
- Read P-1 worklog entry + globals.css to absorb the Pixelscape design system
  (Pixelify Sans body, Press Start 2P `.font-display`, --radius:0 enforced
  globally, pixel tokens `--pixel-line`/`--pixel-shadow`/`--pixel-line-soft`, and
  the `.pixel-segments` HP-bar / `.pixel-shadow` / `.pixel-shadow-sm` /
  `.pixel-border` utility classes).
- Audited `study-view.tsx` for residual soft styling: featured card had a
  `rounded-full` semi-transparent chip + a `text-4xl font-semibold` overall %,
  StatCards were not opting into the Press Start 2P `display` value, the
  GoalCard priority dot was `size-1.5 rounded-full` (round, not pixel),
  the subject was `font-semibold`, the overdue chip was not bolded, the icon
  ghost buttons had no pixel-tile hover affordance, and the skeleton used
  `rounded-xl`/`rounded-md`/`rounded` soft placeholders.
- Featured "Overall Study Progress" Card: switched the big overall %% number
  to `font-display text-3xl text-primary` (chunky Press Start 2P), promoted
  the TrendingUp "done" chip from `rounded-full bg-primary/12` to a true
  pixel tile (`border-2 border-[var(--pixel-line)] bg-primary/15
  pixel-shadow-sm`, `font-bold` label), and ADDED a 20-segment PixelBar
  (`<div className="pixel-segments">…<i className={i<Math.round(overall/5)?"on":""}/>`) 
  below the segmented Progress bar — a strong pixel HP-bar motif mirroring
  the dashboard. Per-goal Progress bars left untouched (global segmented
  fill already applies).
- StatCards: passed `display` to all four (Overall %%, Active count,
  Completed count, Due-this-week count) so their values render in Press
  Start 2P, matching the dashboard stat row.
- GoalCard: subject bumped `font-semibold` -> `font-bold`; priority dot
  changed from `size-1.5 rounded-full` to `h-2 w-2` (square pixel block,
  no longer relying on the global radius override); overdue target-date
  chip now keeps `font-bold` on the rose text; completed-goal `opacity-70`
  dim preserved as-is.
- Action icon buttons (Edit pencil, Delete trash via ConfirmDialog trigger):
  added `border-2 border-transparent hover:border-[var(--pixel-line)]
  hover:bg-muted` so hover reveals a pixel-tile outline. The "Mark
  complete / Reopen" button was left as a normal Button (global pixel
  styling applies to default/secondary/outline variants).
- Skeleton: swapped every card-sized placeholder from `rounded-xl border
  bg-card` / `rounded-md bg-muted` / `rounded bg-muted` to
  `border-2 border-[var(--pixel-line)] bg-card pixel-shadow-sm` (icon tile,
  button placeholder, featured + stat rows) / `pixel-shadow` (taller goal
  card placeholders), matching real pixel cards; tiny text-line placeholders
  dropped their `rounded` and stay as `bg-muted` bars (no border needed).
- Verified no residual Tailwind `shadow-*` utilities, no `rounded-full/xl/md/lg`
  classes, no gradients, no blue/indigo/sky/cyan colors remain in the file.
  No store logic, types, imports, hydration guard, toasts, or slider logic
  were touched.

Stage Summary:
- File edited: `src/components/modules/study/study-view.tsx` (in place).
- Changes: featured Overall % now Press Start 2P + new 20-segment PixelBar
  HP row + pixel-bordered "done" chip; 4 StatCards opt into `display`; goal
  subject bold, priority dot square (`h-2 w-2`), overdue chip bold; Edit/
  Delete icon buttons gain pixel-tile hover borders; skeleton placeholders
  pixel-bordered + pixel-shadowed. All functionality (CRUD, slider progress,
  per-goal Progress, filters, hydration guard, toasts) unchanged.

---
Task ID: P-2b
Agent: expenses-pixel-polish
Task: Pixel-style polish pass on the Expenses module view.

Work Log:
- Read `worklog.md` (P-1 entry) to understand the Pixelscape design system
  (global `.pixelscape *` radius:0, pixel tokens, shared StatCard `display`
  prop for Press Start 2P, category colors from EXPENSE_CATEGORY_META).
- Edited `src/components/modules/expenses/expenses-view.tsx` ONLY — surgical
  visual updates; no store/types/imports/hydration/toast/chart-data logic
  changes.
- Stat cards:
  - "This Month" total, "All-time" total, and "Transactions" count →
    added `display` prop so the value renders in Press Start 2P.
  - "Top Category" (string value) intentionally left on the default font
    so wide category names don't overflow.
- Donut chart:
  - Pie already had `strokeWidth={0}` + `paddingAngle={2}`; added
    `cornerRadius={0}` explicitly for pixel cohesion.
  - Center overlay total → switched from `text-lg font-semibold` to
    `font-display text-base leading-none tabular-nums` (Press Start 2P).
  - Breakdown list dots → square `h-3 w-3 border-2 border-[var(--pixel-line)]`
    (was `size-2.5 rounded-full`).
  - Breakdown per-category bars → outer track now
    `h-2.5 w-full border-2 border-[var(--pixel-line)] bg-muted`, inner fill
    dropped `rounded-full`/`overflow-hidden` for crisp pixel blocks.
- History table:
  - Added `[&_td]:border-2 [&_td]:border-[var(--pixel-line)]/30
    [&_th]:border-2 [&_th]:border-[var(--pixel-line)]/30` on the shadcn
    Table so all cells/headers get crisp 2px pixel dividers.
  - Category badge dots in cells → square `size-2 border-2
    border-[var(--pixel-line)]` (was `size-2 rounded-full`).
  - Amount cell → `text-right font-bold tabular-nums`
    (was `font-medium`).
- Action icon buttons (Edit/Delete, desktop + mobile) → added
  `border-2 border-transparent hover:border-[var(--pixel-line)] hover:bg-muted`
  so ghost icon buttons get a pixel-tile-on-hover feel (default ghost
  styling is excluded from global pixel border).
- Mobile card list:
  - `<li>` row → `border-2 border-[var(--pixel-line)] p-3` (was
    `rounded-lg border`).
  - Category dot → square `h-3 w-3 border-2 border-[var(--pixel-line)]`
    (was `size-2.5 rounded-full`).
  - Amount → `font-bold tabular-nums` (was `font-semibold`).
- Skeleton: swapped every `rounded-xl` placeholder for
  `border-2 border-[var(--pixel-line)] pixel-shadow-sm` so the loading
  state mirrors the real pixel cards (radius:0 globally already flattens
  them, but the explicit border + offset shadow makes the skeleton read
  as a true pixel card grid).
- Verified: no `shadow-*` utilities left on buttons/cards (global
  handles pixel shadows), no `rounded-*` left anywhere, no gradients
  present. The primary "Add Expense" `<Button>` has no overrides and
  inherits the global pixel button styling.

Stage Summary:
- File edited: `src/components/modules/expenses/expenses-view.tsx`
- Changes: StatCard `display` prop on the 3 numeric cards; Pie chart
  `cornerRadius={0}` + Press Start 2P center total; square bordered
  breakdown dots and pixel-bordered progress bars; crisp 2px Table
  dividers, square category dots, bold tabular amounts; pixel-tile
  hover state on Edit/Delete ghost icon buttons (desktop + mobile);
  mobile rows use 2px pixel borders + square dots + bold amount; pixel
  skeleton with `pixel-shadow-sm`. All functionality (CRUD, search /
  filter / sort, donut chart, breakdown, history table, mobile card
  list, hydration guard, toasts) preserved unchanged.

---
Task ID: P-3
Agent: main (orchestrator)
Task: Verify the Pixelscape redesign end-to-end and finalize.

Work Log:
- Dispatched 4 parallel subagents (P-2a/b/c/d) to pixel-polish the Tasks,
  Expenses, Study, Notes views (display-font stat numbers, square dots/tiles,
  divide-y-2 dividers, pixel-tile hover on icon buttons, removed soft shadows,
  pixel skeletons). All completed in place.
- Fixed dashboard hero: replaced the smooth gradient with a hard-banded pixel
  sky (amber → sage → teal in 3 discrete bands) + dither transition strips +
  horizon line + dithered ground, for a true "pixelscape" landscape.
- Fixed all 4 dashboard CardHeaders: added `flex` so `items-center` actually
  vertically centers the section title vs. the "View all" ghost button (the
  shadcn CardHeader base is `grid`, so `flex-row` alone had no effect).
- `bun run lint` → clean.
- Agent Browser verification (clean localStorage reload):
  * No page errors, no console errors, no hydration mismatches.
  * Dashboard renders the banded pixel hero, 4 stat cards (Press Start 2P
    numbers), today's tasks, expense bar chart, 20-segment pixel HP study bar,
    recent notes.
  * Dark mode: toggled light→dark, reloaded → "dark" persisted. No errors.
  * Add task: dialog → validation (submit disabled until title) → task added
    with toast → row appears. ✓
  * Add expense: ₹300 "Pixel lunch" → total updated ₹4,500 → ₹4,800 live, new
    row + toast. ✓
  * Mobile (390×844): bottom tab nav present, sidebar hidden, footer_bottom
    (784) vs nav_top (785) → no overlap (sticky footer correct). ✓
- VLM (Playwright screenshots) assessment: dashboard redesign rated 9/10 —
  "highly cohesive and successful... finished product from a high-end indie
  game interface." Confirmed sharp corners, hard offset shadows, pixel
  typography, banded/dithered hero (no smooth gradient), calm + readable.

Stage Summary:
- Pixelscape redesign complete and browser-verified. All 5 modules share one
  cohesive pixel-art system (Pixelify Sans + Press Start 2P, radius:0, 2px
  hard borders, offset block shadows, dawn/night palettes) via global CSS that
  propagates to every shadcn primitive + the 4 module views.
- Screenshots: pixel-dash-light2.png, pixel-dash-dark.png,
  pixel-mobile-light.png, pixel-mobile-dark.png, pixel-tasks-final.png.

---
Task ID: V3
Agent: main (orchestrator)
Task: Implement the 6 user-requested improvements — data-layer refactor,
export/import, real Settings page, empty-start + Load Demo Data, dynamic
Daily Overview + Priority alert, and PWA installability.

Work Log:
- Refactored `src/lib/store.ts` (deleted) into a clean split:
  - `src/lib/stores/seed-data.ts` — demo-data FACTORIES (createSeedTasks/
    createSeedExpenses/createSeedGoals/createSeedNotes) returning fresh
    objects with dates relative to call time + DEFAULT_STUDENT_NAME/
    DEMO_STUDENT_NAME constants.
  - `src/lib/stores/{task,expense,study,note,settings}-store.ts` — one
    Zustand `persist` store per domain, each now EMPTY by default ([] /
    "Student") with added `loadDemo()` + `reset()` actions. Same localStorage
    keys + version:1 → existing user data hydrates fine.
  - `src/lib/stores/index.ts` — barrel re-export. Updated all 7 consumer
    imports `@/lib/store` → `@/lib/stores`.
- `src/lib/storage/backup.ts` — portable backup layer: buildBackup(),
  downloadBackup() (campusflow-backup-YYYY-MM-DD.json with
  tasks/expenses/studyGoals/notes/settings/theme), restoreBackup() (validates
  `app:"campusflow"` signature, setState on each store), resetAllData(),
  loadDemoData(), isWorkspaceEmpty(). APP_VERSION="1.0.0".
- `src/lib/types.ts` — added "settings" to ModuleKey.
- PWA layer:
  - `public/manifest.json` (name, short_name, standalone, theme_color
    #3a9d6f, background_color #f4ecd8, icons 192/512 any+maskable).
  - `public/sw.js` — offline-first SW (network-first navigations +
    stale-while-revalidate assets; precaches /, manifest, icons).
  - `scripts/gen-icons.mjs` (sharp) → `public/icon-512.png`, `icon-192.png`,
    `icon.svg` (pixel graduation cap on emerald, integer scale 23 for crisp
    pixels).
  - `src/components/pwa/register-sw.tsx` — registers SW on load.
  - `src/app/layout.tsx` — metadata.manifest, themeColor (#3a9d6f via
    viewport export), appleWebApp, icons; renders <RegisterSW/>.
- `src/components/modules/settings/settings-view.tsx` — NEW. 4 sections:
  Profile (name input + save), Appearance (Light/Dawn + Dark/Night pixel
  segmented control via useTheme), Data management (Export/Import/Load
  demo/Reset as 2x2 grid of pixel DataAction cards; Import uses hidden file
  input; Load demo + Reset wrapped in ConfirmDialog), Application (Version
  v1.0.0, Storage: Local browser, Backend sync: Not enabled, Records count +
  a ShieldCheck note explaining localStorage + export).
- Wired Settings into nav: `src/components/layout/nav-config.tsx` added
  SETTINGS_NAV + ALL_NAV_ITEMS. `app-shell.tsx`: desktop sidebar gets a
  "System" section with Settings; mobile top bar gets a Settings gear;
  renderModule switch handles "settings"; sidebar footer ProfileChip
  (avatar+name) navigates to Settings (replaced the old EditNameButton
  dialog).
- Dashboard Daily Overview: `dashboard-view.tsx` hero now shows 4 dynamic
  today-stats inline (tasks due today / spent this week / active study goals
  / notes updated today) in Press Start 2P. Added a Priority alert banner
  (full-width, amber for upcoming / rose for overdue, shows the earliest
  pending task title + priority + "due Today/Tomorrow/in Nd"/"Nd overdue").
  Added an empty-workspace CTA ("Your workspace is empty" + Add first task /
  Load demo data) shown only when all stores are empty. Stat card label
  "Spent" → "Spent / month" to disambiguate from hero "spent this week".
- Verification (Agent Browser, clean localStorage):
  * Empty-start: fresh user sees "Good Morning, Student" + empty-workspace
    CTA with "Load demo data". ✓
  * Load demo data (dashboard CTA): workspace populates, hero shows
    "Good Morning, Aditya" + "1 task due today / ₹4,500 spent this week /
    3 active study goals / 3 notes updated today" + Priority alert
    "Study DBMS chapter 6 due Today". ✓
  * Settings: all 4 sections render (Profile name=Aditya, Appearance Light/
    Dark, Data 17 records + Export/Import/Load demo/Reset, Application
    Version v1.0.0 / Storage Local browser / Backend sync Not enabled).
    VLM-confirmed. ✓
  * Export: downloaded campusflow-backup-2026-08-12.json (5024 bytes) with
    correct {app:"campusflow",version:1,data:{tasks,expenses,studyGoals,
    notes,settings,theme}} structure + toast. ✓
  * Reset: confirm dialog → all stores wiped to empty arrays, studentName→
    "Student", "All data reset" toast, localStorage confirmed empty. ✓
  * Import: uploaded the backup file → data restored (17 records, 4 tasks,
    studentName→"Aditya") + "Backup restored" toast. Full round-trip ✓
  * PWA: /manifest.json (200), /sw.js (200), /icon-192.png (200), SW
    registered (1 registration, scope localhost:3000/), manifest link +
    theme-color #3a9d6f + apple-touch-icon in <head>. ✓
  * Dark mode: toggles + persists. Mobile (390×844): gear in top bar, 5-item
    bottom nav, footer no overlap (784 vs 785). ✓
  * `bun run lint` clean. No console/page errors after clean reload.

Stage Summary:
- All 6 improvements shipped and browser-verified. CampusFlow now: starts
  empty for genuine users, has a portable JSON export/import (solves
  localStorage's biggest weakness), a real Settings page making the
  architecture transparent, a dynamic Daily Overview + Priority alert tying
  the modules together, a clean stores/ + storage/ data layer, and is an
  installable offline PWA. Screenshots: v3-final-dashboard.png,
  v3-settings-dark.png, v3-mobile-dark.png.

---
Task ID: V4
Agent: main (orchestrator)
Task: Redesign the Study Planner to model real study plans (daily time goal +
session logging + on-track tracking + reminders), and add an animated
pixel-landscape loop to the dashboard hero.

Work Log:
- StudyGoal type redesigned (src/lib/types.ts): replaced progress/completed
  with startDate + targetDate + dailyMinutesGoal + sessions: StudySession[].
  Added StudyGoalInput + StudySessionInput.
- format.ts: added daysBetween, formatDuration (2h 30m), formatHours (2h),
  planStats(goal) computing totalDays/daysElapsed/daysRemaining/
  totalMinutesGoal/minutesDone/minutesToday/expectedMinutesByToday/
  deficitMinutes/onTrack/percent/streak/isComplete/hasStarted, segmentsFor().
- study-store.ts rewritten: new model + logSession/updateSession/deleteSession;
  persist bumped to v2 with a migrate() that carries v1 goals into the new
  shape (sessions: []).
- seed-data.ts createSeedGoals rewritten: DSA "Learn DSA in 2 months" 2h/day
  with 12 days of sessions (some skipped → behind), DBMS exam prep 1h/day
  on-track, React mastery sprint completed. buildSessions() helper generates
  deterministic sessions with relative dates.
- study-view.tsx full rewrite: ModuleHeader + "New plan" button; featured
  Overall Progress card (today minutes vs daily goal total, behind count,
  overall %); 4 StatCards (Today/Active/Behind/Overall); plan cards each
  showing timeline (start → Day X/N → target) with an expected-by-today
  marker, today vs daily-goal, streak flame, Done/Behind boxes (deficit),
  collapsible sessions log, Log session button; PlanFormDialog (subject,
  goal/topic, start+target dates, hours+minutes daily goal, priority, live
  "total commitment" preview); LogSessionDialog (date, minutes with quick-pick
  chips 15m/30m/45m/1h/1.5h/2h, optional note).
- PixelLandscape component (src/components/pixel-landscape.tsx): an infinite
  seamless parallax pixel-art scene — banded dawn sky, bobbing pixel sun,
  drifting pixel clouds, 3 scrolling mountain layers (far/mid/near at 60s/
  36s/20s for parallax), dithered ground. Each layer is a doubled row
  translated 0→-50% (px-scroll keyframe in globals.css) so it loops with no
  seam. Respects prefers-reduced-motion. Pure CSS/SVG — no video file.
- globals.css: added px-scroll / px-sun-bob / px-cloud keyframes + reduced-
  motion guard. (Also restored the accidentally-truncated pixel scrollbar
  block.)
- Dashboard: hero background replaced with <PixelLandscape> (animated).
  Daily overview now includes "Xh studied today" + a "⚠ N study plans behind"
  inline note. Study-progress section rewritten to use planStats (per-plan
  percent, today vs goal, On track / Behind Xh).
- Notifications popover: study check-in reminders now computed from the new
  plan model — "DSA — behind by 6h" (rose, when deficit > 0) or "DSA — 0h of
  2h today" (amber, when on track but no session today).
- Verification (Agent Browser):
  * Clean reload: empty workspace → "Load demo data" CTA → dashboard shows
    animated pixel landscape (VLM: "golden sky, bright sun, layered green
    mountains, parallax depth... very cool").
  * Study planner with demo data: DSA plan "Behind · Day 12/60 · Daily goal
    2h · 1-day streak · Behind by Xh"; DBMS + React plans render.
  * Created a new "DSA — Learn DSA in 2 months" plan (2h/day, 61 days, total
    commitment "122h over 61 days" computed live) → appears as "Day 1/61".
  * Logged a 120min session → plan flipped from "Behind" to "On track" with
    "1-day streak". On-track math verified.
  * Notifications popover shows 4 items: 2 task reminders + 2 study reminders
    ("DSA — behind by 6h", "DBMS — behind by 15m").
  * `bun run lint` clean. No console/page errors after clean reload.
- VLM (study planner): "Each plan card clearly displays a timeline, daily time
  goal, today's progress vs daily goal, total hours vs commitment, and an
  On-track/Behind/Complete status. It is now very clear how to model a plan
  like 'Learn DSA in 2 months, 2h/day.'"

Stage Summary:
- Study Planner is now a genuine study-planning tool: you commit to a daily
  time goal between two dates, log sessions, and the app truthfully computes
  whether you're on track or behind (with a deficit) — plus streaks and
  in-app check-in reminders.
- Dashboard hero now plays an infinite animated pixel-mountain parallax
  landscape (sky + sun + clouds + 3 scrolling mountain layers + dithered
  ground) — the "cool loop video" effect, pure CSS/SVG, no asset weight.
- Screenshots: v4-dashboard-animated.png, v4-study-planner.png.

---
Task ID: V5
Agent: main (orchestrator)
Task: (1) Turn the expense tracker into a full money manager (income, borrow,
lend with settle logic + balances). (2) Redesign dark mode to a smooth
matte-black Batman-night aesthetic where the hero landscape becomes a night
scene (moon + stars + dark mountain silhouettes).

Work Log:
- Types (src/lib/types.ts): extended Expense with kind (expense|income|borrow|
  lend), counterparty?, settled?; added TransactionKind, TRANSACTION_KINDS,
  INCOME_CATEGORIES (Pocket Money/Stipend/Refund/Gift/Other), IncomeCategory,
  TransactionCategory (ExpenseCategory | IncomeCategory | "Transfer").
  ExpenseInput now omits settled (defaults to false on add).
- format.ts: added TRANSACTION_KIND_META (label/badge/sign/icon per kind),
  INCOME_CATEGORY_STYLES, MoneySummary interface + summarizeMoney() helper
  computing balance (income−expense), incomeTotal, expenseTotal, youOwe
  (unsettled borrows), owedToYou (unsettled lends), netDebt.
- expense-store.ts: added settleTransaction(id)/unsettleTransaction(id);
  bumped persist to v2 with migrate() that carries v1 expenses (no kind)
  into kind:"expense" + settled:false.
- seed-data.ts createSeedExpenses rewritten: ₹5000 Pocket Money + ₹1500 Refund
  (income), 6 expenses, ₹300 borrow from Rahul (unsettled), ₹150 lend to Priya
  (unsettled), ₹200 lend to Aman (settled).
- expenses-view.tsx full rewrite → "Money" module: 4 stat cards (Balance /
  Income / You owe / Owed to you), controls (search + kind filter All/Expenses/
  Income/Borrowed/Lent + time filter + sort + "Show settled debts" toggle),
  expense-by-category donut chart + breakdown (expenses only), history Table
  (desktop) + card list (mobile) with kind badges + Settle/Reopen button for
  debts + edit/delete, Add-transaction dialog with 4-kind selector (pixel
  segmented) + conditional "Friend's name" field for borrow/lend.
- Dashboard: Balance stat card (income−expense, tone primary/rose), expense
  overview now shows a 3-cell Balance/You-owe/Owed-to-you strip above the
  category chart; monthTotal/monthIncome computed from kind-filtered expenses.
- Dark palette (globals.css .dark): rewritten to smooth matte-black Batman
  night — background oklch(0.135 0.006 260) matte near-black with a faint
  cool tint, charcoal cards (0.165), soft slate pixel-line (0.34, not harsh
  cream), near-pure-black pixel-shadow (0.04), desaturated chart hues, amber
  (0.8 0.14 75) kept as the single "bat-signal" accent. Calm, not colourful.
- PixelLandscape (src/components/pixel-landscape.tsx): now theme-aware via
  useTheme. Night mode renders a banded deep-navy→black sky, a pixel moon
  (disc + crescent shadow cut + craters) instead of the sun, 12 twinkling
  pixel stars (px-twinkle keyframe), dark mountain silhouettes (oklch 0.1–0.2),
  and NO clouds. Day mode keeps the sun + clouds + green mountains. Added
  px-twinkle keyframe + reduced-motion guard in globals.css.
- Verification (Agent Browser):
  * Clean reload: no errors. Load demo data → dashboard Balance ₹2,000
    (income ₹6,500 − expense ₹4,500), You owe ₹300 (Rahul), Owed to you ₹150
    (Priya). ✓
  * Money module: all 4 stat cards render with correct numbers; transaction
    table shows Expense/Income/Borrowed/Lent rows with kind badges + Settle
    buttons on debts. ✓
  * Settle: clicked Settle on Rahul's ₹300 borrow → "You owe" dropped to ₹0
    ("all settled"). ✓
  * Add borrow: opened Add transaction → selected Borrowed → "Friend's name"
    field appeared → added ₹500 borrow "For pizza" with Aman → appears in
    list, "You owe" updated to ₹500. ✓
  * Dark mode night landscape: toggled dark → class="dark" → dashboard hero
    shows moon (true), 12 stars, 0 clouds (clouds correctly hidden at night).
    VLM 9/10: "smooth matte black, night scene with moon/stars/dark mountain
    silhouettes, calm/Batman-night-like, retro terminal / stealth-game UI."
  * `bun run lint` clean. No console/page errors.

Stage Summary:
- The tracker is now a complete money manager: record expenses, income
  (pocket money, stipend, refunds), money borrowed from friends, and money
  lent to friends — each debt carries a counterparty + settled flag with
  one-click Settle/Reopen, and the dashboard shows a live Balance + You-owe +
  Owed-to-you summary.
- Dark mode is a smooth matte-black Batman-night, and the hero landscape
  transforms into a night scene (moon + twinkling stars + dark mountain
  silhouettes) when dark mode is on.
- Screenshots: v5-dashboard-light.png, v5-dashboard-night.png,
  v5-money-light.png.
