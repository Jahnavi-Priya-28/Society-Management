"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bell,
  Building2,
  ChevronLeft,
  ChevronRight,
  Command,
  LayoutDashboard,
  Megaphone,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  Sun,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { LogoutButton } from "@/components/auth/logout-button";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types/domain";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/resident", label: "Resident", icon: Building2 },
  { href: "/admin", label: "Admin", icon: UsersRound },
  { href: "/notices", label: "Notices", icon: Megaphone },
  { href: "/settings", label: "Settings", icon: Settings },
];

const activeLabel = {
  "/": "Dashboard",
  "/resident": "Resident workspace",
  "/admin": "Admin command center",
  "/notices": "Notice board",
  "/settings": "Society settings",
};

function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("residentflow-theme");
    const shouldUseDark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(shouldUseDark);
    document.documentElement.classList.toggle("dark", shouldUseDark);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("residentflow-theme", next ? "dark" : "light");
  }

  const Icon = dark ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "focus-ring flex h-10 items-center gap-3 rounded-md border border-[var(--border)] bg-white/70 px-3 text-sm font-medium transition hover:bg-white dark:bg-white/10 dark:hover:bg-white/15",
        collapsed && "w-10 justify-center px-0",
      )}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span className={cn(collapsed && "sr-only")}>{dark ? "Light" : "Dark"}</span>
    </button>
  );
}

export function AppShell({
  children,
  active = "/",
  user,
}: {
  children: React.ReactNode;
  active?: string;
  user?: SessionUser | null;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const breadcrumb = useMemo(() => activeLabel[active as keyof typeof activeLabel] ?? "Workspace", [active]);

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/86 px-4 py-3 backdrop-blur-xl dark:bg-slate-950/82 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3" aria-label="ResidentFlow AI home">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--secondary)] text-white shadow-sm dark:bg-white dark:text-slate-950">
              <Building2 className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold">ResidentFlow AI</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle collapsed />
            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className="focus-ring grid h-10 w-10 place-items-center rounded-md border border-[var(--border)] bg-white/80 dark:bg-white/10"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {mobileOpen ? (
          <nav className="mt-3 grid gap-1 rounded-lg border border-[var(--border)] bg-white/92 p-2 shadow-xl dark:bg-slate-950/95" aria-label="Mobile navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "focus-ring flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-[var(--muted)] transition hover:bg-blue-50 hover:text-[var(--primary)] dark:hover:bg-white/10",
                    active === item.href && "bg-blue-600 text-white hover:bg-blue-600 hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        ) : null}
      </div>

      <motion.aside
        animate={{ width: collapsed ? 88 : 288 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="fixed inset-y-0 left-0 z-40 hidden border-r border-[var(--border)] bg-white/82 p-4 shadow-[18px_0_45px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:bg-slate-950/74 lg:block"
      >
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="ResidentFlow AI home">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[var(--secondary)] text-white shadow-md dark:bg-white dark:text-slate-950">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className={cn("min-w-0 transition-opacity", collapsed && "pointer-events-none opacity-0")}>
              <span className="block truncate text-base font-semibold">ResidentFlow AI</span>
              <span className="block truncate text-xs text-[var(--muted)]">Society management</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="focus-ring grid h-9 w-9 shrink-0 place-items-center rounded-md border border-[var(--border)] bg-white/70 transition hover:bg-white dark:bg-white/10 dark:hover:bg-white/15"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <div className={cn("mt-5 rounded-lg border border-blue-100 bg-blue-50/75 p-3 text-blue-950 dark:border-blue-900 dark:bg-blue-950/35 dark:text-blue-50", collapsed && "px-2 text-center")}>
          <div className={cn("flex items-center gap-2 text-xs font-semibold", collapsed && "justify-center")}>
            <Command className="h-4 w-4" aria-hidden="true" />
            <span className={cn(collapsed && "sr-only")}>Live operations</span>
          </div>
          <p className={cn("mt-1 text-xs leading-5 opacity-80", collapsed && "sr-only")}>Complaint queues, notices, ratings, and settings stay in one focused workspace.</p>
        </div>

        <nav className="mt-7 grid gap-1.5" aria-label="Primary navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "focus-ring group relative flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-[var(--muted)] transition hover:bg-blue-50 hover:text-[var(--primary)] dark:hover:bg-white/10",
                  collapsed && "justify-center px-0",
                  isActive && "bg-blue-600 text-white shadow-sm shadow-blue-600/20 hover:bg-blue-600 hover:text-white",
                )}
              >
                {isActive ? <span className="absolute left-0 top-2 h-7 w-1 rounded-r-full bg-white/90" /> : null}
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className={cn("truncate", collapsed && "sr-only")}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4 grid gap-3">
          <ThemeToggle collapsed={collapsed} />
          {user ? (
            <div className={cn("rounded-lg border border-[var(--border)] bg-white/72 p-3 shadow-sm dark:bg-white/10", collapsed && "grid place-items-center px-2")}>
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-900 text-xs font-semibold text-white dark:bg-white dark:text-slate-950">
                  {user.name.slice(0, 1).toUpperCase()}
                </span>
                <div className={cn("min-w-0", collapsed && "sr-only")}>
                  <p className="truncate text-sm font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-[var(--muted)]">{user.email}</p>
                </div>
              </div>
              <span className={cn("mt-3 inline-flex rounded-full bg-slate-950 px-2 py-1 text-[10px] font-semibold text-white dark:bg-white dark:text-slate-950", collapsed && "sr-only")}>
                {user.role}
              </span>
            </div>
          ) : (
            <Link href="/login" className="focus-ring flex h-10 items-center justify-center rounded-md border border-[var(--border)] text-sm font-medium hover:bg-white dark:hover:bg-white/10">
              <UserRound className="h-4 w-4" aria-hidden="true" />
              <span className={cn("ml-2", collapsed && "sr-only")}>Sign in</span>
            </Link>
          )}
          {user ? <div className={cn(collapsed && "[&_button]:justify-center [&_button]:px-0 [&_button]:text-transparent [&_svg]:text-[var(--muted)]")}><LogoutButton /></div> : null}
        </div>
      </motion.aside>

      <main
        className={cn(
          "px-4 py-5 transition-[margin-left] duration-200 lg:px-8 xl:px-10",
          collapsed ? "lg:ml-[88px]" : "lg:ml-72",
        )}
      >
        <header className="mb-6 hidden items-center justify-between gap-4 lg:flex">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">
              <Link href="/" className="hover:text-[var(--foreground)]">Home</Link>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="truncate text-[var(--foreground)]">{breadcrumb}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="relative hidden xl:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" aria-hidden="true" />
              <input
                aria-label="Search workspace"
                placeholder="Search residents, complaints, notices..."
                className="input-surface focus-ring h-10 w-80 rounded-md pl-9 pr-3 text-sm"
              />
            </label>
            <button type="button" className="focus-ring grid h-10 w-10 place-items-center rounded-md border border-[var(--border)] bg-white/75 transition hover:bg-white dark:bg-white/10 dark:hover:bg-white/15" aria-label="Notifications">
              <Bell className="h-4 w-4" aria-hidden="true" />
            </button>
            <ThemeToggle collapsed />
            <Link
              href={user ? (user.role === "ADMIN" ? "/admin" : "/resident") : "/login"}
              className="focus-ring flex h-10 items-center gap-2 rounded-md border border-[var(--border)] bg-white/75 px-3 text-sm font-medium transition hover:bg-white dark:bg-white/10 dark:hover:bg-white/15"
            >
              <UserRound className="h-4 w-4" aria-hidden="true" />
              {user ? user.role : "Sign in"}
            </Link>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
