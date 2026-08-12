"use client";

import * as React from "react";
import { useState } from "react";
import { Pencil, Check } from "lucide-react";
import { NAV_ITEMS } from "./nav-config";
import { PixelLogo } from "./pixel-logo";
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

  // Radix-free static skeleton during SSR + first client render so hydration
  // matches exactly; the interactive pixel app mounts after.
  if (!hydrated) {
    return <AppShellSkeleton />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pb-[calc(3.75rem+env(safe-area-inset-bottom))] lg:pb-0">
      {/* ---------- Mobile top bar ---------- */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-2 border-b-2 border-[var(--pixel-line)] bg-background px-4 py-2.5 lg:hidden">
        <Brand />
        <div className="flex items-center gap-2">
          <NotificationsPopover onNavigate={navigate} />
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1">
        {/* ---------- Desktop sidebar ---------- */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r-2 border-[var(--pixel-line)] bg-sidebar lg:flex">
          <div className="flex items-center gap-2.5 border-b-2 border-[var(--pixel-line)] px-5 py-4">
            <Brand />
          </div>

          <nav className="flex-1 space-y-1.5 overflow-y-auto p-3">
            <p className="px-2 pb-1 pt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
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
                    "flex w-full items-center gap-3 border-2 px-3 py-2.5 text-sm font-semibold transition-all",
                    isActive
                      ? "border-[var(--pixel-line)] bg-primary text-primary-foreground pixel-inset"
                      : "border-transparent text-sidebar-foreground hover:border-[var(--pixel-line)] hover:bg-sidebar-accent"
                  )}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isActive ? (
                    <span className="h-2 w-2 bg-primary-foreground" />
                  ) : null}
                </button>
              );
            })}
          </nav>

          <div className="border-t-2 border-[var(--pixel-line)] p-3">
            <div className="flex items-center justify-between gap-2">
              <EditNameButton />
              <ThemeToggle />
            </div>
            <p className="px-2 pt-2 text-[11px] leading-relaxed text-muted-foreground">
              Saved locally in your browser via localStorage.
            </p>
          </div>
        </aside>

        {/* ---------- Main column ---------- */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Desktop header */}
          <header className="sticky top-0 z-30 hidden items-center justify-between border-b-2 border-[var(--pixel-line)] bg-background px-6 py-3 lg:flex">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">CampusFlow</span>
              <span className="text-border">/</span>
              <span>{NAV_ITEMS.find((n) => n.key === active)?.label}</span>
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

          <footer className="border-t-2 border-[var(--pixel-line)] bg-background px-4 py-4 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-1 text-xs text-muted-foreground sm:flex-row">
              <span className="flex items-center gap-1.5">
                <PixelLogo size={14} />
                CampusFlow · Pixel Edition
              </span>
              <span>Data stays in your browser</span>
            </div>
          </footer>
        </div>
      </div>

      {/* ---------- Mobile bottom navigation ---------- */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 flex border-t-2 border-[var(--pixel-line)] bg-background lg:hidden"
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
                "flex flex-1 flex-col items-center justify-center gap-1 border-t-2 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors",
                isActive
                  ? "border-primary bg-primary/12 text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
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
      <span className="flex h-9 w-9 items-center justify-center border-2 border-[var(--pixel-line)] bg-primary pixel-shadow-sm">
        <PixelLogo size={20} className="text-primary-foreground" />
      </span>
      <span className="font-display text-sm tracking-wide">
        Campus<span className="text-primary">Flow</span>
      </span>
    </div>
  );
}

/**
 * Static, Radix-free loading shell rendered on the server and during the first
 * client render so hydration matches exactly. Mirrors the real layout's shape.
 */
function AppShellSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b-2 border-[var(--pixel-line)] px-4 py-2.5 lg:hidden">
        <Brand />
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 border-2 border-[var(--pixel-line)]" />
          <div className="h-9 w-9 border-2 border-[var(--pixel-line)]" />
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r-2 border-[var(--pixel-line)] bg-sidebar lg:flex">
          <div className="flex items-center gap-2.5 border-b-2 border-[var(--pixel-line)] px-5 py-4">
            <Brand />
          </div>
          <div className="flex-1 space-y-2 p-3">
            <div className="h-3 w-10 bg-muted" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 border-2 border-transparent px-3 py-2.5"
              >
                <div className="h-[18px] w-[18px] bg-muted" />
                <div className="h-3.5 w-20 bg-muted" />
              </div>
            ))}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="hidden h-[3.05rem] items-center justify-between border-b-2 border-[var(--pixel-line)] px-6 lg:flex">
            <div className="h-3.5 w-40 bg-muted" />
            <div className="h-9 w-9 border-2 border-[var(--pixel-line)]" />
          </header>
          <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            <div className="mx-auto w-full max-w-6xl space-y-5">
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
          </main>
          <footer className="h-14 border-t-2 border-[var(--pixel-line)]" />
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 border-t-2 border-[var(--pixel-line)] bg-background lg:hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-2"
          >
            <div className="h-5 w-5 bg-muted" />
            <div className="h-2 w-8 bg-muted" />
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
        className="flex min-w-0 flex-1 items-center gap-2 border-2 border-transparent px-2 py-1.5 text-left transition-colors hover:border-[var(--pixel-line)] hover:bg-sidebar-accent"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center border-2 border-[var(--pixel-line)] bg-primary/15 text-xs font-bold text-primary">
          {initial}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">
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
            <DialogTitle className="font-display text-base">
              Your name
            </DialogTitle>
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
