"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

/**
 * KPI card used on the dashboard (and reused in module headers).
 * `tone` tints the icon chip — keep to one of the semantic tones.
 */
export function StatCard({
  icon,
  label,
  value,
  sub,
  tone = "primary",
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: "primary" | "amber" | "rose" | "violet" | "teal";
  className?: string;
}) {
  const toneMap: Record<string, string> = {
    primary: "bg-primary/12 text-primary",
    amber: "bg-amber-500/12 text-amber-600 dark:text-amber-300",
    rose: "bg-rose-500/12 text-rose-600 dark:text-rose-300",
    violet: "bg-violet-500/12 text-violet-600 dark:text-violet-300",
    teal: "bg-teal-500/12 text-teal-600 dark:text-teal-300",
  };

  return (
    <Card className={cn("gap-0 p-5 py-5", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            toneMap[tone]
          )}
        >
          {icon}
        </span>
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">
        {value}
      </div>
      {sub ? (
        <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
      ) : null}
    </Card>
  );
}
