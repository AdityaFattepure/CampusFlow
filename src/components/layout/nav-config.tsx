"use client";

import * as React from "react";
import {
  LayoutDashboard,
  ListTodo,
  Wallet,
  GraduationCap,
  NotebookPen,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { ModuleKey } from "@/lib/types";

export interface NavItem {
  key: ModuleKey;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  description: string;
}

/** Primary nav — shown in the desktop sidebar and the mobile bottom tab bar. */
export const NAV_ITEMS: NavItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    shortLabel: "Home",
    icon: LayoutDashboard,
    description: "Overview of everything",
  },
  {
    key: "tasks",
    label: "Tasks",
    shortLabel: "Tasks",
    icon: ListTodo,
    description: "Assignments & to-dos",
  },
  {
    key: "expenses",
    label: "Expenses",
    shortLabel: "Money",
    icon: Wallet,
    description: "Track your spending",
  },
  {
    key: "study",
    label: "Study",
    shortLabel: "Study",
    icon: GraduationCap,
    description: "Goals & progress",
  },
  {
    key: "notes",
    label: "Notes",
    shortLabel: "Notes",
    icon: NotebookPen,
    description: "Quick notes",
  },
];

/** Secondary nav — Settings lives at the sidebar bottom + mobile top-bar gear. */
export const SETTINGS_NAV: NavItem = {
  key: "settings",
  label: "Settings",
  shortLabel: "Settings",
  icon: Settings,
  description: "Profile, data & app",
};

/** All nav items including Settings (for breadcrumb lookups etc.). */
export const ALL_NAV_ITEMS: NavItem[] = [...NAV_ITEMS, SETTINGS_NAV];

