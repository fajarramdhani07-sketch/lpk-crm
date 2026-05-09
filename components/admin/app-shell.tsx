"use client";

import {
  Activity,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Database,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Users,
  X
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";

export type AdminPage = "dashboard" | "candidates" | "cv-jobs" | "files" | "audit-logs" | "settings";

const navItems: Array<{ id: AdminPage; label: string; icon: typeof LayoutDashboard }> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "candidates", label: "Candidates", icon: Users },
  { id: "cv-jobs", label: "CV Jobs", icon: BriefcaseBusiness },
  { id: "files", label: "Files", icon: FileText },
  { id: "audit-logs", label: "Audit Logs", icon: ClipboardList },
  { id: "settings", label: "Settings", icon: Settings }
];

const pageTitles: Record<AdminPage, string> = {
  dashboard: "Dashboard",
  candidates: "Candidates",
  "cv-jobs": "CV Jobs",
  files: "Files",
  "audit-logs": "Audit Logs",
  settings: "Settings"
};

export function AppShell({
  page,
  setPage,
  userName,
  role,
  loading,
  onLogout,
  contextualAction,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  children
}: {
  page: AdminPage;
  setPage: (page: AdminPage) => void;
  userName: string;
  role: UserRole;
  loading: boolean;
  onLogout: () => void;
  contextualAction?: React.ReactNode;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function navigate(nextPage: AdminPage) {
    setPage(nextPage);
    setMobileOpen(false);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {mobileOpen ? <button aria-label="Tutup navigasi" className="fixed inset-0 z-30 bg-foreground/30 lg:hidden" onClick={() => setMobileOpen(false)} /> : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-card transition-all duration-200 lg:translate-x-0",
          collapsed ? "lg:w-[76px]" : "lg:w-64",
          mobileOpen ? "w-72 translate-x-0" : "w-72 -translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Database className="h-5 w-5" />
            </div>
            {!collapsed ? (
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">LPK Candidate CRM</div>
                <div className="truncate text-xs text-muted-foreground">Internal operations</div>
              </div>
            ) : null}
          </div>
          <Button className="lg:hidden" size="icon" variant="ghost" onClick={() => setMobileOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.id === page;
            return (
              <button
                key={item.id}
                className={cn(
                  "flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && "lg:justify-center lg:px-0"
                )}
                onClick={() => navigate(item.id)}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed ? <span className="truncate">{item.label}</span> : null}
              </button>
            );
          })}
        </nav>

        <div className="border-t p-3">
          <Button className={cn("hidden w-full lg:flex", collapsed && "px-0")} variant="ghost" size={collapsed ? "icon" : "sm"} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!collapsed ? "Collapse" : null}
          </Button>
        </div>
      </aside>

      <div className={cn("min-h-screen transition-all duration-200", collapsed ? "lg:pl-[76px]" : "lg:pl-64")}>
        <header className="sticky top-0 z-20 border-b bg-card/95 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
            <Button className="lg:hidden" size="icon" variant="ghost" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Activity className="h-3.5 w-3.5" />
                <span>CRM</span>
                <span>/</span>
                <span>{pageTitles[page]}</span>
              </div>
              <h1 className="truncate text-lg font-semibold">{pageTitles[page]}</h1>
            </div>
            {onSearchChange ? (
              <label className="relative hidden w-[min(34vw,420px)] xl:block">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input value={searchValue ?? ""} onChange={(event) => onSearchChange(event.target.value)} className="h-9 pl-9" placeholder={searchPlaceholder ?? "Search"} />
              </label>
            ) : null}
            {contextualAction}
            <div className="hidden min-w-0 text-right md:block">
              <div className="truncate text-sm font-medium">{userName}</div>
              <div className="text-xs capitalize text-muted-foreground">{role}</div>
            </div>
            <Button variant="outline" size="sm" disabled={loading} onClick={onLogout}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Keluar</span>
            </Button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1600px] px-4 py-5 lg:px-6">{children}</main>
      </div>
    </div>
  );
}
