import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { CategoryChart, StatusChart } from "@/features/dashboard/dashboard-charts";
import { getAdminComplaints, getDashboardData } from "@/services/dashboard-service";
import { requireUser } from "@/lib/session";
import { AdminComplaintBoard } from "@/features/admin/admin-complaint-board";
import { ComplaintCategory, ComplaintStatus, Priority } from "@prisma/client";
import { AlertTriangle, CheckCircle2, Clock3 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; status?: string; priority?: string; q?: string; from?: string; to?: string }>;
}) {
  const user = await requireUser(["ADMIN"]);
  const params = await searchParams;
  let data;
  let complaints: Awaited<ReturnType<typeof getAdminComplaints>> = [];
  try {
    data = await getDashboardData();
    complaints = await getAdminComplaints({
      category: Object.values(ComplaintCategory).includes(params.category as ComplaintCategory) ? (params.category as ComplaintCategory) : undefined,
      status: Object.values(ComplaintStatus).includes(params.status as ComplaintStatus) ? (params.status as ComplaintStatus) : undefined,
      priority: Object.values(Priority).includes(params.priority as Priority) ? (params.priority as Priority) : undefined,
      q: params.q,
      from: params.from,
      to: params.to,
    });
  } catch {
    data = { recentComplaints: [], categoryChart: [], statusChart: [] };
    complaints = [];
  }

  return (
    <AppShell active="/admin" user={user}>
      <PageHeader
        title="Admin command center"
        description="Prioritize resident issues, spot overdue maintenance, and keep the society informed with operational clarity."
      />
      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--muted)]">Visible queue</p>
            <Clock3 className="h-5 w-5 text-blue-600" aria-hidden="true" />
          </div>
          <p className="mt-3 text-3xl font-semibold">{complaints.length}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Filtered complaints ready for action</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--muted)]">High urgency</p>
            <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden="true" />
          </div>
          <p className="mt-3 text-3xl font-semibold">{complaints.filter((item) => item.priority === "HIGH" || item.priority === "URGENT").length}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Needs closest admin attention</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--muted)]">Rated closures</p>
            <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
          </div>
          <p className="mt-3 text-3xl font-semibold">{complaints.filter((item) => item.rating).length}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Resolved work with resident feedback</p>
        </Card>
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <h2 className="mb-4 font-semibold">Complaint queue</h2>
          <AdminComplaintBoard complaints={complaints} />
        </Card>
        <div className="grid gap-4">
          <Card>
            <h2 className="mb-4 font-semibold">Category load</h2>
            {data.categoryChart.length ? <CategoryChart data={data.categoryChart} /> : <EmptyState title="No queue data" description="Complaint analytics will appear here." />}
          </Card>
          <Card>
            <h2 className="mb-4 font-semibold">Status load</h2>
            {data.statusChart.length ? <StatusChart data={data.statusChart} /> : <EmptyState title="No status data" description="Status analytics will appear here." />}
          </Card>
        </div>
      </section>
    </AppShell>
  );
}
