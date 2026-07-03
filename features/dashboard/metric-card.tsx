import { Card } from "@/components/ui/card";
import { toCurrencylessNumber } from "@/lib/utils";
import { Activity, AlertTriangle, CheckCircle2, Clock3, Inbox } from "lucide-react";

const metricStyle = {
  "Total complaints": { icon: Inbox, accent: "text-sky-700 bg-sky-50 dark:bg-sky-950 dark:text-sky-200" },
  Open: { icon: AlertTriangle, accent: "text-amber-700 bg-amber-50 dark:bg-amber-950 dark:text-amber-200" },
  "In progress": { icon: Activity, accent: "text-blue-700 bg-blue-50 dark:bg-blue-950 dark:text-blue-200" },
  Resolved: { icon: CheckCircle2, accent: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-200" },
  Overdue: { icon: Clock3, accent: "text-rose-700 bg-rose-50 dark:bg-rose-950 dark:text-rose-200" },
};

export function MetricCard({ label, value, helper }: { label: string; value: number; helper: string }) {
  const style = metricStyle[label as keyof typeof metricStyle] ?? metricStyle["Total complaints"];
  const Icon = style.icon;

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-[var(--muted)]">{label}</p>
        <span className={`grid h-9 w-9 place-items-center rounded-md ${style.accent}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 text-4xl font-semibold tracking-normal">{toCurrencylessNumber(value)}</p>
      <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{helper}</p>
    </Card>
  );
}
