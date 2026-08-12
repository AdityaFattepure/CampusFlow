"use client";

import * as React from "react";
import { useRef, useState } from "react";
import {
  Settings as SettingsIcon,
  User,
  Palette,
  Database,
  Info,
  Download,
  Upload,
  Trash2,
  Sparkles,
  Sun,
  Moon,
  Check,
  HardDrive,
  CloudOff,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { useHydrated } from "@/hooks/use-hydrated";
import { useSettingsStore } from "@/lib/stores";
import { useTaskStore } from "@/lib/stores/task-store";
import { useExpenseStore } from "@/lib/stores/expense-store";
import { useStudyStore } from "@/lib/stores/study-store";
import { useNoteStore } from "@/lib/stores/note-store";
import {
  downloadBackup,
  restoreBackup,
  resetAllData,
  loadDemoData,
  APP_VERSION,
} from "@/lib/storage/backup";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function SettingsView() {
  const hydrated = useHydrated();

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <div className="h-12 w-48 animate-pulse border-2 border-[var(--pixel-line)] bg-muted pixel-shadow-sm" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-40 animate-pulse border-2 border-[var(--pixel-line)] bg-muted pixel-shadow"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-[var(--pixel-line)] bg-primary/15 text-primary pixel-shadow-sm">
          <SettingsIcon className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Profile, appearance, data and app information.
          </p>
        </div>
      </div>

      <ProfileSection />
      <AppearanceSection />
      <DataSection />
      <ApplicationSection />
    </div>
  );
}

/* ----------------------------- Profile ----------------------------- */

function ProfileSection() {
  const studentName = useSettingsStore((s) => s.studentName);
  const setStudentName = useSettingsStore((s) => s.setStudentName);
  const [value, setValue] = useState(studentName);
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    setValue(studentName);
  }, [studentName]);

  const dirty = value.trim() !== studentName && value.trim().length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b-2 border-[var(--pixel-line)]">
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="h-4 w-4 text-primary" />
          Profile
        </CardTitle>
        {saved ? (
          <Badge className="border-2 border-[var(--pixel-line)] bg-primary/15 text-primary">
            <Check className="h-3 w-3" /> Saved
          </Badge>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        <div className="space-y-2">
          <Label htmlFor="student-name" className="text-xs font-semibold uppercase tracking-wider">
            Student name
          </Label>
          <Input
            id="student-name"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setSaved(false);
            }}
            maxLength={40}
            placeholder="Your name"
            onKeyDown={(e) => {
              if (e.key === "Enter" && dirty) {
                setStudentName(value);
                setSaved(true);
                toast.success("Name updated", { description: value.trim() });
              }
            }}
          />
          <p className="text-xs text-muted-foreground">
            Used to greet you on the dashboard. Saved locally in your browser.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            disabled={!dirty}
            onClick={() => {
              setStudentName(value);
              setSaved(true);
              toast.success("Name updated", { description: value.trim() });
            }}
          >
            <Check className="h-4 w-4" /> Save name
          </Button>
          {dirty ? (
            <Button
              variant="outline"
              onClick={() => {
                setValue(studentName);
                setSaved(false);
              }}
            >
              Reset
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

/* --------------------------- Appearance ---------------------------- */

function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b-2 border-[var(--pixel-line)]">
        <CardTitle className="flex items-center gap-2 text-base">
          <Palette className="h-4 w-4 text-primary" />
          Appearance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider">
            Theme
          </Label>
          <div className="grid grid-cols-2 gap-2 sm:max-w-sm">
            <ThemeOption
              active={!isDark}
              onClick={() => setTheme("light")}
              icon={<Sun className="h-4 w-4" />}
              label="Light"
              desc="Dawn"
            />
            <ThemeOption
              active={isDark}
              onClick={() => setTheme("dark")}
              icon={<Moon className="h-4 w-4" />}
              label="Dark"
              desc="Night"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Your choice is remembered on this device.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ThemeOption({
  active,
  onClick,
  icon,
  label,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-3 border-2 p-3 text-left transition-all",
        active
          ? "border-[var(--pixel-line)] bg-primary text-primary-foreground pixel-inset"
          : "border-[var(--pixel-line)] bg-card hover:bg-muted"
      )}
    >
      <span className="flex h-8 w-8 items-center justify-center border-2 border-[var(--pixel-line)] bg-background/40">
        {icon}
      </span>
      <span className="flex-1">
        <span className="block text-sm font-bold">{label}</span>
        <span
          className={cn(
            "block text-xs",
            active ? "text-primary-foreground/80" : "text-muted-foreground"
          )}
        >
          {desc}
        </span>
      </span>
      {active ? <Check className="h-4 w-4" /> : null}
    </button>
  );
}

/* ------------------------------ Data ------------------------------- */

function DataSection() {
  const fileRef = useRef<HTMLInputElement>(null);
  const tasks = useTaskStore((s) => s.tasks);
  const expenses = useExpenseStore((s) => s.expenses);
  const goals = useStudyStore((s) => s.goals);
  const notes = useNoteStore((s) => s.notes);

  const totalRecords =
    tasks.length + expenses.length + goals.length + notes.length;

  const handleExport = () => {
    downloadBackup();
    toast.success("Backup exported", {
      description: "Downloaded as campusflow-backup-<date>.json",
    });
  };

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const result = restoreBackup(text);
      if (!result.ok) {
        toast.error("Import failed", { description: result.error });
        return;
      }
      const c = result.counts;
      toast.success("Backup restored", {
        description: `${c?.tasks ?? 0} tasks · ${c?.expenses ?? 0} expenses · ${
          c?.studyGoals ?? 0
        } goals · ${c?.notes ?? 0} notes`,
      });
    };
    reader.onerror = () =>
      toast.error("Import failed", { description: "Could not read the file." });
    reader.readAsText(file);
  };

  const handleImport = () => fileRef.current?.click();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b-2 border-[var(--pixel-line)]">
        <CardTitle className="flex items-center gap-2 text-base">
          <Database className="h-4 w-4 text-primary" />
          Data management
        </CardTitle>
        <Badge variant="outline" className="font-mono">
          {totalRecords} records
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <p className="text-sm text-muted-foreground">
          Everything is stored locally in this browser. Export a backup to move
          your data to another device, or restore from a previous backup.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DataAction
            icon={<Download className="h-5 w-5" />}
            title="Export data"
            desc="Download a JSON backup"
            actionLabel="Export"
            onClick={handleExport}
          />
          <DataAction
            icon={<Upload className="h-5 w-5" />}
            title="Import data"
            desc="Restore from a backup file"
            actionLabel="Import"
            onClick={handleImport}
          />
          <DataAction
            icon={<Sparkles className="h-5 w-5" />}
            title="Load demo data"
            desc="Populate with sample content"
            actionLabel="Load demo"
            onClick={() => toast.info("Confirm below to load demo data")}
            confirm={{
              title: "Load demo data?",
              description:
                "This replaces your current tasks, expenses, goals and notes with the bundled demo dataset.",
              confirmLabel: "Load demo",
              onConfirm: () => {
                loadDemoData();
                toast.success("Demo data loaded", {
                  description: "Workspace populated with sample content.",
                });
              },
            }}
          />
          <DataAction
            icon={<Trash2 className="h-5 w-5" />}
            title="Reset all data"
            desc="Wipe everything from this browser"
            actionLabel="Reset"
            danger
            onClick={() => toast.info("Confirm below to reset")}
            confirm={{
              title: "Reset all data?",
              description:
                "This permanently deletes all tasks, expenses, study goals and notes from this browser. Export a backup first if you want to keep it.",
              confirmLabel: "Reset everything",
              onConfirm: () => {
                resetAllData();
                toast.success("All data reset", {
                  description: "Your workspace is now empty.",
                });
              },
            }}
          />
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleImportFile(f);
            e.target.value = "";
          }}
        />
      </CardContent>
    </Card>
  );
}

function DataAction({
  icon,
  title,
  desc,
  actionLabel,
  onClick,
  danger,
  confirm,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  actionLabel: string;
  onClick: () => void;
  danger?: boolean;
  confirm?: {
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void;
  };
}) {
  const button = (
    <Button
      type="button"
      variant={danger ? "destructive" : "default"}
      size="sm"
      className="w-full"
    >
      {actionLabel}
    </Button>
  );

  const actionEl = confirm ? (
    <ConfirmDialog
      trigger={button}
      title={confirm.title}
      description={confirm.description}
      confirmLabel={confirm.confirmLabel}
      onConfirm={confirm.onConfirm}
    />
  ) : (
    <span className="block w-full" onClick={onClick}>
      {button}
    </span>
  );

  return (
    <div
      className={cn(
        "flex h-full flex-col gap-3 border-2 border-[var(--pixel-line)] bg-card p-4 transition-colors",
        danger ? "hover:bg-destructive/5" : "hover:bg-muted"
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center border-2 border-[var(--pixel-line)]",
          danger
            ? "bg-destructive/12 text-destructive"
            : "bg-primary/12 text-primary"
        )}
      >
        {icon}
      </span>
      <div className="flex-1">
        <p className="text-sm font-bold">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
      </div>
      {actionEl}
    </div>
  );
}

/* -------------------------- Application ---------------------------- */

function ApplicationSection() {
  const tasks = useTaskStore((s) => s.tasks);
  const expenses = useExpenseStore((s) => s.expenses);
  const goals = useStudyStore((s) => s.goals);
  const notes = useNoteStore((s) => s.notes);

  const rows = [
    { label: "Version", value: `v${APP_VERSION}` },
    {
      label: "Storage",
      value: "Local browser",
      icon: <HardDrive className="h-4 w-4 text-primary" />,
    },
    {
      label: "Backend sync",
      value: "Not enabled",
      icon: <CloudOff className="h-4 w-4 text-muted-foreground" />,
    },
    {
      label: "Records",
      value: `${tasks.length + expenses.length + goals.length + notes.length} items`,
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b-2 border-[var(--pixel-line)]">
        <CardTitle className="flex items-center gap-2 text-base">
          <Info className="h-4 w-4 text-primary" />
          Application
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <dl className="divide-y-2 divide-[var(--pixel-line)]/40">
          {rows.map((r) => (
            <div
              key={r.label}
              className="flex items-center justify-between py-2.5"
            >
              <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                {r.icon}
                {r.label}
              </dt>
              <dd className="text-sm font-semibold tabular-nums">{r.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex items-start gap-2 border-2 border-[var(--pixel-line)] bg-muted/40 p-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            CampusFlow stores your data only in this browser&apos;s
            localStorage — nothing is sent to a server. Use{" "}
            <span className="font-semibold text-foreground">Export</span> to
            back up or move your data between devices.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
