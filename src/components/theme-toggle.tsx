"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/hooks/use-hydrated";

/**
 * Pixel-art theme toggle — a hard-edged block button whose shadow collapses
 * on press. Sun by day, moon by night.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const hydrated = useHydrated();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-label={hydrated ? `Switch to ${isDark ? "light" : "dark"} mode` : "Toggle theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "pixel-btn inline-flex h-9 w-9 items-center justify-center bg-card text-foreground",
        className
      )}
    >
      <Sun
        className={cn(
          "h-4 w-4 transition-all duration-150",
          isDark ? "scale-0 -rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
        )}
      />
      <Moon
        className={cn(
          "absolute h-4 w-4 transition-all duration-150",
          isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0"
        )}
      />
    </button>
  );
}
