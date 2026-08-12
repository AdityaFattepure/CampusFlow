"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

/**
 * Pixel KPI card: hard 2px outline, offset block shadow, square icon chip,
 * big tabular value. Used on the dashboard and module headers.
 */
export function StatCard({
  icon,
  label,
  value,
  sub,
  tone = "primary",
  display = false,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: "primary" | "amber" | "rose" | "violet" | "teal";
  /** When true, render the value in the chunky Press Start 2P display font. */
  display?: boolean;
  className?: string;
}) {
  const toneMap: Record<string, string> = {
    primary: "bg-primary/15 text-primary border-[var(--pixel-line)]",
    amber: "bg-accent/20 text-accent-foreground border-[var(--pixel-line)]",
    rose: "bg-destructive/15 text-destructive border-[var(--pixel-line)]",
    violet:
      "bg-chart-5/15 text-chart-5 border-[var(--pixel-line)]",
    teal: "bg-chart-4/15 text-chart-4 border-[var(--pixel-line)]",
  };

  return (
    <Card className={cn("gap-0 p-5", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center border-2",
            toneMap[tone]
          )}
        >
          {icon}
        </span>
      </div>
      <div
        className={cn(
          "mt-3 font-semibold tracking-tight tabular-nums",
          display ? "font-display text-2xl" : "text-3xl"
        )}
      >
        {value}
      </div>
      {sub ? (
        <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
      ) : null}
    </Card>
  );
}
