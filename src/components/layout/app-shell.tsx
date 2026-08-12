"use client";

import * as React from "react";
import { useState } from "react";
import { GraduationCap, Pencil, Check } from "lucide-react";
import { NAV_ITEMS } from "./nav-config";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationsPopover } from "./notifications-popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSettingsStore } from "@/lib/store";
import type { ModuleKey } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/hooks/use-hydrated";
import { DashboardView } from "@/components/modules/dashboard/dashboard-view";
import { TasksView } from "@/components/modules/tasks/tasks-view";
import { ExpensesView } from "@/components/modules/expenses/expenses-view";
import { StudyView } from "@/components/modules/study/study-view";
import { NotesView } from "@/components/modules/notes/notes-view";

export function AppShell() {
  const hydrated = useHydrated();
  const [active, setActive] = useState<ModuleKey>("dashboard");
  const navigate = (m: ModuleKey) => {
    setActive(m);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Render a static, Radix-free skeleton during SSR and the initial client
  // hydration render (matches the server output exactly), then swap in the
  // fully interactive app once mounted. This eliminates hydration mismatches
  // that Radix Popover/Tooltip/Dialog `useId` ids would otherwise trigger
  // between server and client, which is appropriate for a localStorage app.
  if (!hydrated) {
    return <AppShellSkeleton />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
      {/* ---------- Mobile top bar ---------- */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-2 border-b bg-background/85 px-4 py-2.5 backdrop-blur lg:hidden">
        <Brand />
        <div className="flex items-center gap-2">
          <NotificationsPopover onNavigate={navigate} />
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1">
        {/* ---------- Desktop sidebar ---------- */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-sidebar lg:flex">
          <div className="flex items-center gap-2.5 border-b px-5 py-4">
            <Brand />
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            <p className="px-2 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Menu
            </p>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => navigate(item.key)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/12 text-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isActive ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  ) : null}
                </button>
              );
            })}
          </nav>

          <div className="border-t p-3">
            <div className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5">
              <EditNameButton />
              <ThemeToggle />
            </div>
            <p className="px-2 pt-2 text-[11px] leading-relaxed text-muted-foreground">
              All data is saved locally in your browser via localStorage.
            </p>
          </div>
        </aside>

        {/* ---------- Main column ---------- */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Desktop header */}
          <header className="sticky top-0 z-30 hidden items-center justify-between border-b bg-background/85 px-6 py-3 backdrop-blur lg:flex">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>CampusFlow</span>
              <span className="text-border">/</span>
              <span className="font-medium text-foreground">
                {NAV_ITEMS.find((n) => n.key === active)?.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <NotificationsPopover onNavigate={navigate} />
            </div>
          </header>

          <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            <div className="mx-auto w-full max-w-6xl">
              {renderModule(active, navigate)}
            </div>
          </main>

          <footer className="border-t px-4 py-4 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-1 text-xs text-muted-foreground sm:flex-row">
              <span className="flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-primary" />
                CampusFlow — Student Productivity &amp; Expense Manager
              </span>
              <span>Built with Next.js · Data stays in your browser</span>
            </div>
          </footer>
        </div>
      </div>

      {/* ---------- Mobile bottom navigation ---------- */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 flex border-t bg-background/95 backdrop-blur lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Primary"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.key)}
              aria-current={isActive ? "page" : undefined}
              aria-label={item.label}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform",
                  isActive ? "scale-110" : ""
                )}
              />
              {item.shortLabel}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function renderModule(active: ModuleKey, navigate: (m: ModuleKey) => void) {
  switch (active) {
    case "dashboard":
      return <DashboardView onNavigate={navigate} />;
    case "tasks":
      return <TasksView />;
    case "expenses":
      return <ExpensesView />;
    case "study":
      return <StudyView />;
    case "notes":
      return <NotesView />;
    default:
      return <DashboardView onNavigate={navigate} />;
  }
}

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
        <GraduationCap className="h-[18px] w-[18px]" />
      </span>
      <span className="text-base font-semibold tracking-tight">
        Campus<span className="text-primary">Flow</span>
      </span>
    </div>
  );
}

/**
 * Static, Radix-free loading shell rendered on the server and during the first
 * client render so hydration matches exactly. No Popover/Tooltip/Dialog (which
 * use `useId`) appear here, so no id/attribute mismatches are possible.
 */
function AppShellSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Mobile bar */}
      <header className="flex items-center justify-between border-b px-4 py-2.5 lg:hidden">
        <Brand />
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full border" />
          <div className="h-9 w-9 rounded-full border" />
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-sidebar lg:flex">
          <div className="flex items-center gap-2.5 border-b px-5 py-4">
            <Brand />
          </div>
          <div className="flex-1 space-y-2 p-3">
            <div className="h-3 w-10 rounded bg-muted" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5"
              >
                <div className="h-[18px] w-[18px] rounded bg-muted" />
                <div className="h-3.5 w-20 rounded bg-muted" />
              </div>
            ))}
          </div>
          <div className="border-t p-3">
            <div className="flex items-center gap-2 px-2 py-1.5">
              <div className="h-7 w-7 rounded-full bg-muted" />
              <div className="h-3.5 w-16 rounded bg-muted" />
            </div>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="hidden h-14 items-center justify-between border-b px-6 lg:flex">
            <div className="h-3.5 w-40 rounded bg-muted" />
            <div className="h-9 w-9 rounded-full border" />
          </header>
          <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            <div className="mx-auto w-full max-w-6xl space-y-5">
              <div className="h-32 animate-pulse rounded-2xl bg-gradient-to-br from-emerald-500/80 to-teal-600/80" />
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-28 animate-pulse rounded-xl border"
                  />
                ))}
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="h-72 animate-pulse rounded-xl border lg:col-span-2" />
                <div className="h-72 animate-pulse rounded-xl border" />
              </div>
            </div>
          </main>
          <footer className="h-14 border-t px-6" />
        </div>
      </div>

      {/* Mobile bottom nav placeholder */}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 border-t bg-background lg:hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-2"
          >
            <div className="h-5 w-5 rounded bg-muted" />
            <div className="h-2 w-8 rounded bg-muted" />
          </div>
        ))}
      </nav>
    </div>
  );
}

function EditNameButton() {
  const studentName = useSettingsStore((s) => s.studentName);
  const setStudentName = useSettingsStore((s) => s.setStudentName);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(studentName);

  React.useEffect(() => {
    if (open) setValue(studentName);
  }, [open, studentName]);

  const initial = (studentName || "S").charAt(0).toUpperCase();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-sidebar-accent"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
          {initial}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">
            {studentName}
          </span>
          <span className="block text-[11px] text-muted-foreground">
            Student
          </span>
        </span>
        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Your name</DialogTitle>
            <DialogDescription>
              We use this to greet you on the dashboard. Saved locally.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-1">
            <Label htmlFor="student-name" className="text-xs">
              Name
            </Label>
            <Input
              id="student-name"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={40}
              placeholder="e.g. Aditya"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setStudentName(value);
                  setOpen(false);
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setStudentName(value);
                setOpen(false);
              }}
              disabled={!value.trim()}
            >
              <Check className="h-4 w-4" /> Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
