import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { OverdueSettingsForm } from "@/features/settings/overdue-settings-form";
import { requireUser } from "@/lib/session";
import { getOverdueThresholdDays } from "@/services/settings-service";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser(["ADMIN"]);
  const days = await getOverdueThresholdDays();

  return (
    <AppShell active="/settings" user={user}>
      <PageHeader title="Society settings" description="Configure operational thresholds used by dashboards and admin workflows." />
      <Card className="max-w-2xl">
        <span className="section-kicker">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Admin controls
        </span>
        <h2 className="mt-4 text-xl font-semibold">Overdue detection</h2>
        <p className="mb-5 mt-2 text-sm leading-6 text-[var(--muted)]">Open and in-progress complaints older than this threshold are flagged as overdue across admin reporting and queue views.</p>
        <OverdueSettingsForm days={days} />
      </Card>
    </AppShell>
  );
}
