"use client";

import * as React from "react";
import { Bell, CheckCircle2, AlertTriangle, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTaskStore, useStudyStore } from "@/lib/stores";
import { todayISO, relativeDay, formatDate } from "@/lib/format";
import type { ModuleKey } from "@/lib/types";
import { useHydrated } from "@/hooks/use-hydrated";

interface Item {
  kind: "task" | "goal";
  title: string;
  meta: string;
  tone: "rose" | "amber" | "primary";
}

function computeItems(tasks: ReturnType<typeof useTaskStore.getState>["tasks"], goals: ReturnType<typeof useStudyStore.getState>["goals"]): Item[] {
  const today = todayISO();
  const out: Item[] = [];

  for (const t of tasks) {
    if (t.completed) continue;
    if (!t.dueDate) continue;
    const due = new Date(t.dueDate + "T00:00:00").getTime();
    const t0 = new Date(today + "T00:00:00").getTime();
    if (due <= t0) {
      out.push({
        kind: "task",
        title: t.title,
        meta: due < t0 ? `${relativeDay(t.dueDate)} · ${t.category}` : `Today · ${t.category}`,
        tone: "rose",
      });
    } else if (due - t0 <= 2 * 86400000) {
      out.push({
        kind: "task",
        title: t.title,
        meta: `${relativeDay(t.dueDate)} · ${t.category}`,
        tone: "amber",
      });
    }
  }

  for (const g of goals) {
    if (g.completed) continue;
    if (g.progress < 50) {
      out.push({
        kind: "goal",
        title: `${g.subject} — ${g.topic}`,
        meta: `${g.progress}% · due ${formatDate(g.targetDate)}`,
        tone: "amber",
      });
    }
  }

  return out.slice(0, 8);
}

export function NotificationsPopover({
  onNavigate,
}: {
  onNavigate: (m: ModuleKey) => void;
}) {
  const tasks = useTaskStore((s) => s.tasks);
  const goals = useStudyStore((s) => s.goals);
  const hydrated = useHydrated();
  const items = hydrated ? computeItems(tasks, goals) : [];
  const count = items.length;

  const toneClasses: Record<Item["tone"], string> = {
    rose: "bg-rose-500/12 text-rose-600 dark:text-rose-300",
    amber: "bg-amber-500/12 text-amber-600 dark:text-amber-300",
    primary: "bg-primary/12 text-primary",
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Notifications"
          className="pixel-btn relative h-9 w-9 bg-card"
        >
          <Bell className="h-4 w-4" />
          {hydrated && count > 0 ? (
            <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center border-2 border-[var(--pixel-line)] bg-destructive px-1 text-[10px] font-bold text-white">
              {count > 9 ? "9+" : count}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-semibold">Reminders</p>
          {hydrated && count > 0 ? (
            <Badge variant="secondary" className="font-medium">
              {count} {count === 1 ? "item" : "items"}
            </Badge>
          ) : null}
        </div>
        {!hydrated ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            Loading…
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-10 text-center">
            <CheckCircle2 className="mb-2 h-8 w-8 text-emerald-500" />
            <p className="text-sm font-medium">You&apos;re all caught up</p>
            <p className="mt-1 text-xs text-muted-foreground">
              No overdue tasks or stalled study goals.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-80 scroll-area-thin">
            <ul className="divide-y">
              {items.map((it, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border-2 border-[var(--pixel-line)] ${toneClasses[it.tone]}`}
                  >
                    {it.kind === "task" ? (
                      it.tone === "rose" ? (
                        <AlertTriangle className="h-3.5 w-3.5" />
                      ) : (
                        <Bell className="h-3.5 w-3.5" />
                      )
                    ) : (
                      <Target className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{it.title}</p>
                    <p className="text-xs text-muted-foreground">{it.meta}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => onNavigate("tasks")}
              >
                View all tasks
              </Button>
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
