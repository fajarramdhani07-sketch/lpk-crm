"use client";

import type { LucideIcon } from "lucide-react";
import type React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function SummaryCard({
  icon: Icon,
  label,
  value,
  detail,
  tone = "neutral"
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  detail?: string;
  tone?: "neutral" | "primary" | "success" | "warning" | "danger";
}) {
  const toneClass = {
    neutral: "bg-muted text-muted-foreground",
    primary: "bg-primary text-primary-foreground",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-red-100 text-red-800"
  }[tone];

  return (
    <Card className="shadow-none">
      <CardContent className="flex items-center gap-3 p-4">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-md", toneClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase text-muted-foreground">{label}</div>
          <div className="mt-1 text-2xl font-semibold leading-none">{value}</div>
          {detail ? <div className="mt-1 truncate text-xs text-muted-foreground">{detail}</div> : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-md border border-dashed bg-card px-4 py-8 text-center">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-1 max-w-md text-sm text-muted-foreground">{description}</div>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function TableShell({ children, minWidth = 920 }: { children: React.ReactNode; minWidth?: number }) {
  return (
    <div className="overflow-x-auto rounded-md border bg-card">
      <table className="w-full text-left text-sm" style={{ minWidth }}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return <thead className="border-b bg-muted/70 text-xs uppercase text-muted-foreground">{children}</thead>;
}

export function FieldGroup({
  title,
  children,
  columns = 2
}: {
  title: string;
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
}) {
  const grid = columns === 3 ? "lg:grid-cols-3" : columns === 2 ? "md:grid-cols-2" : "grid-cols-1";
  return (
    <section className="rounded-md border bg-card">
      <div className="border-b bg-muted/40 px-4 py-3 text-sm font-semibold">{title}</div>
      <div className={cn("grid gap-px bg-border", grid)}>{children}</div>
    </section>
  );
}

export function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="min-w-0 bg-card px-4 py-3">
      <div className="text-xs font-medium uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 break-words text-sm font-medium">{value || "-"}</div>
    </div>
  );
}

export function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function dateOnly(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(date);
}

export function calculateAge(value?: string) {
  if (!value) return "-";
  const birth = new Date(value);
  if (Number.isNaN(birth.getTime())) return "-";
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1;
  return `${Math.max(0, age)} th`;
}
