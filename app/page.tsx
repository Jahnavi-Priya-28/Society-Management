import Link from "next/link";
import { ArrowRight, Bell, ClipboardList, Plus, Settings2, Star } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { CategoryChart, MonthlyTrendChart, StatusChart } from "@/features/dashboard/dashboard-charts";
import { MetricCard } from "@/features/dashboard/metric-card";
import { ComplaintList } from "@/features/complaints/complaint-list";
import { getDashboardData } from "@/services/dashboard-service";
import { formatStatus } from "@/lib/utils";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

async function loadDashboard() {
  try {
    return await getDashboardData();
  } catch {
    return {
      metrics: [
        { label: "Total complaints", value: 0, helper: "Connect PostgreSQL to load live data" },
        { label: "Open", value: 0, helper: "Awaiting admin triage" },
        { label: "In progress", value: 0, helper: "Currently being handled" },
        { label: "Resolved", value: 0, helper: "Ready for resident rating" },
        { label: "Overdue", value: 0, helper: "Past expected due date" },
      ],
      categoryChart: [],
      statusChart: [],
      monthlyTrend: Array.from({ length: 12 }, (_, month) => ({
        month: new Date(new Date().getFullYear(), month, 1).toLocaleString("en", { month: "short" }),
        complaints: 0,
      })),
      averageRating: 0,
      ratingCount: 0,
      recentComplaints: [],
      recentActivity: [],
      notices: [],
    };
  }
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const data = await loadDashboard();

  return (
    <AppShell active="/" user={user}>
      <PageHeader
        title="Society operations dashboard"
        description="Track complaint flow, overdue work, resident satisfaction, notices, and operational trends from one focused workspace."
        action={
          <Link
            href="/resident"
            className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New complaint
          </Link>
        }
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {data.metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>
      <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="flex flex-col justify-between gap-5 !bg-slate-950 [background-image:none] text-white dark:!bg-white dark:text-slate-950 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium opacity-70">Operational health</p>
            <div className="mt-2 flex items-end gap-3">
              <p className="text-4xl font-semibold">{Math.max(0, 100 - data.metrics.at(-1)!.value * 8)}%</p>
              <p className="pb-1 text-sm opacity-70">based on overdue work</p>
            </div>
          </div>
          <Link href="/admin" className="focus-ring inline-flex items-center gap-2 rounded-md border border-white/20 px-3 py-2 text-sm font-medium hover:bg-white/10 dark:border-slate-200 dark:hover:bg-slate-100">
            Review queue <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--muted)]">Resident satisfaction</p>
              <p className="mt-2 text-3xl font-semibold">{data.averageRating.toFixed(1)}</p>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-md bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300"><Star className="h-5 w-5" aria-hidden="true" /></span>
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">Across {data.ratingCount} submitted ratings</p>
        </Card>
      </section>
      <section className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Monthly trend</h2>
              <p className="mt-1 text-xs text-[var(--muted)]">Complaint volume across the current year</p>
            </div>
            <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700 dark:bg-teal-950 dark:text-teal-200">{data.ratingCount} ratings / {data.averageRating.toFixed(1)} avg</span>
          </div>
          <MonthlyTrendChart data={data.monthlyTrend} />
        </Card>
        <Card>
          <h2 className="mb-4 font-semibold">Status mix</h2>
          {data.statusChart.length ? <StatusChart data={data.statusChart} /> : <EmptyState title="No status data" description="Complaint status analytics will appear here." />}
        </Card>
      </section>
      <section className="mt-6 grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <h2 className="mb-4 font-semibold">Complaints by category</h2>
          {data.categoryChart.length ? <CategoryChart data={data.categoryChart} /> : <EmptyState title="No category data" description="Category analytics will appear after residents submit complaints." />}
        </Card>
        <Card>
          <h2 className="mb-4 font-semibold">Recent complaints</h2>
          <ComplaintList complaints={data.recentComplaints} />
        </Card>
      </section>
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-semibold">Recent activity</h2>
          {data.recentActivity.length ? (
            <div className="space-y-4">
              {data.recentActivity.map((item) => (
                <div key={item.id} className="border-l-2 border-teal-500 pl-3">
                  <p className="text-sm font-medium">
                    {item.actor.name} moved &quot;{item.complaint.title}&quot; to {formatStatus(item.toStatus)}
                  </p>
                  <p className="text-xs text-[var(--muted)]">{item.note ?? "No note added"}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No activity yet" description="Timeline updates will be shown here." />
          )}
        </Card>
        <Card>
          <h2 className="mb-4 font-semibold">Notice board</h2>
          {data.notices.length ? (
            <div className="space-y-3">
              {data.notices.map((notice) => (
                <article key={notice.id} className="rounded-md border border-[var(--border)] p-3">
                  <h3 className="text-sm font-medium">{notice.title}</h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">{notice.body}</p>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="No notices" description="Pinned society notices will appear here." />
          )}
        </Card>
      </section>
      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { href: "/resident", label: "New complaint", icon: Plus },
            { href: "/admin", label: "Complaint queue", icon: ClipboardList },
            { href: "/notices", label: "Announcements", icon: Bell },
            { href: "/settings", label: "Settings", icon: Settings2 },
          ].map((action) => (
            <Link key={action.href} href={action.href} className="focus-ring group flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 text-sm font-medium shadow-sm transition hover:border-blue-300 hover:shadow-md dark:hover:border-blue-700">
              <span className="flex items-center gap-3"><action.icon className="h-4 w-4 text-blue-600" aria-hidden="true" />{action.label}</span>
              <ArrowRight className="h-4 w-4 text-[var(--muted)] transition group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
