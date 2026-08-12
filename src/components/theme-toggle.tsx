"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useHydrated } from "@/hooks/use-hydrated";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const hydrated = useHydrated();
  const isDark = theme === "dark";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="relative h-9 w-9 rounded-full"
        >
          <Sun
            className={`h-4 w-4 transition-all ${
              isDark ? "scale-0 -rotate-90" : "scale-100 rotate-0"
            } absolute`}
          />
          <Moon
            className={`h-4 w-4 transition-all ${
              isDark ? "scale-100 rotate-0" : "scale-0 rotate-90"
            } absolute`}
          />
          <span className="sr-only">
            {hydrated ? `Switch to ${isDark ? "light" : "dark"} mode` : "Toggle theme"}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {hydrated ? `Switch to ${isDark ? "light" : "dark"} mode` : "Toggle theme"}
      </TooltipContent>
    </Tooltip>
  );
}
