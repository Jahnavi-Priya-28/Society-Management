import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatStatus } from "@/lib/utils";
import type { ComplaintSummary } from "@/types/domain";
import Link from "next/link";

const priorityTone = {
  LOW: "neutral",
  MEDIUM: "blue",
  HIGH: "amber",
  URGENT: "red",
} as const;

const statusTone = {
  OPEN: "amber",
  IN_PROGRESS: "blue",
  RESOLVED: "green",
  CLOSED: "neutral",
} as const;

export function ComplaintList({ complaints }: { complaints: ComplaintSummary[] }) {
  if (complaints.length === 0) {
    return <EmptyState title="No complaints yet" description="New maintenance requests will appear here." />;
  }

  return (
    <div className="grid gap-3">
      {complaints.map((complaint) => (
        <article key={complaint.id} className="grid gap-3 rounded-lg border border-[var(--border)] bg-white/62 p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-white dark:bg-white/[0.08] dark:hover:bg-white/[0.12] sm:grid-cols-[1fr_auto]">
          <div>
            <h3 className="font-semibold">
              <Link href={`/complaints/${complaint.id}`} className="focus-ring rounded-sm hover:text-teal-700 dark:hover:text-teal-300">
                {complaint.title}
              </Link>
            </h3>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--muted)]">{complaint.description}</p>
            <p className="mt-3 text-xs font-medium text-[var(--muted)]">
              {complaint.resident.name} {complaint.resident.flatNumber ? `- Flat ${complaint.resident.flatNumber}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-start gap-2 sm:justify-end">
            <Badge tone={statusTone[complaint.status]}>{formatStatus(complaint.status)}</Badge>
            <Badge tone={priorityTone[complaint.priority]}>{formatStatus(complaint.priority)}</Badge>
            <Badge>{formatStatus(complaint.category)}</Badge>
          </div>
        </article>
      ))}
    </div>
  );
}
