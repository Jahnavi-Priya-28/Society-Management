import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { ComplaintForm } from "@/features/complaints/complaint-form";
import { ComplaintList } from "@/features/complaints/complaint-list";
import { getResidentDashboardData } from "@/services/dashboard-service";
import type { ComplaintSummary } from "@/types/domain";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ResidentPage() {
  const user = await requireUser(["RESIDENT"]);
  let complaints: ComplaintSummary[] = [];
  try {
    const data = await getResidentDashboardData(user.id);
    complaints = data.complaints;
  } catch {
    complaints = [];
  }

  return (
    <AppShell active="/resident" user={user}>
      <PageHeader
        title="Resident workspace"
        description="Raise maintenance requests, use smart suggestions, and review your complaint history with timeline-ready status updates."
      />
      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <span className="section-kicker">Smart complaint assistant</span>
          <h2 className="mt-4 text-2xl font-semibold">Describe the issue once. ResidentFlow suggests category and priority automatically.</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            It also checks similar active complaints so residents can follow existing issues instead of creating duplicates.
          </p>
        </Card>
        <Card className="bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
          <p className="text-sm opacity-70">Your active records</p>
          <p className="mt-4 text-5xl font-semibold">{complaints.length}</p>
          <p className="mt-2 text-sm opacity-75">Complaint history and timelines</p>
        </Card>
      </section>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <ComplaintForm />
        <Card>
          <h2 className="mb-4 font-semibold">Complaint history</h2>
          <ComplaintList complaints={complaints} />
        </Card>
      </div>
    </AppShell>
  );
}
