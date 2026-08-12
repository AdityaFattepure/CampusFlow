"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Pixel empty state — dashed pixel outline, blocky icon tile, message + CTA.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center border-2 border-dashed border-[var(--pixel-line)] bg-muted/40 px-6 py-12 text-center",
        className
      )}
    >
      {icon ? (
        <div className="mb-3 flex h-12 w-12 items-center justify-center border-2 border-[var(--pixel-line)] bg-card text-muted-foreground pixel-shadow-sm">
          {icon}
        </div>
      ) : null}
      <p className="text-sm font-semibold">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
