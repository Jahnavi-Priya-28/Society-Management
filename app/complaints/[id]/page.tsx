import Image from "next/image";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { RatingForm } from "@/features/complaints/rating-form";
import { requireUser } from "@/lib/session";
import { formatStatus } from "@/lib/utils";
import { getComplaintDetail } from "@/services/dashboard-service";
import { CalendarClock, Camera, CheckCircle2, Home, MapPin, UserRound } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ComplaintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const complaint = await getComplaintDetail(id, user.id, user.role);

  if (!complaint) {
    notFound();
  }

  return (
    <AppShell active={user.role === "ADMIN" ? "/admin" : "/resident"} user={user}>
      <PageHeader title={complaint.title} description={complaint.description} />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="grid gap-6">
          <Card className="overflow-hidden p-0">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <span className="section-kicker"><CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />Lifecycle audit</span>
              <h2 className="mt-3 text-lg font-semibold">Status history</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">Every status change is timestamped with the actor and note.</p>
            </div>
            <ol className="space-y-0 p-5">
              {complaint.history.map((item) => (
                <li key={item.id} className="relative border-l border-[var(--border)] pb-5 pl-5 last:pb-0">
                  <span className="absolute -left-2 top-0 grid h-4 w-4 place-items-center rounded-full bg-[var(--accent)] ring-4 ring-white dark:ring-slate-950" />
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="blue">{formatStatus(item.toStatus)}</Badge>
                    <span className="text-sm font-semibold">{item.actor.name}</span>
                    <span className="text-xs text-[var(--muted)]">{item.createdAt.toLocaleString()}</span>
                  </div>
                  {item.note ? <p className="mt-1 text-sm text-[var(--muted)]">{item.note}</p> : null}
                </li>
              ))}
            </ol>
          </Card>
          <Card className="overflow-hidden p-0">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <span className="section-kicker"><Camera className="h-3.5 w-3.5" aria-hidden="true" />Evidence</span>
              <h2 className="mt-3 text-lg font-semibold">Photos</h2>
            </div>
            {complaint.attachments.length ? (
              <div className="grid gap-4 p-5 sm:grid-cols-2">
                {complaint.attachments.map((attachment) => (
                  <Image
                    key={attachment.id}
                    src={attachment.url}
                    alt={attachment.fileName}
                    width={640}
                    height={420}
                    className="aspect-[4/3] rounded-lg border border-[var(--border)] object-cover shadow-sm"
                  />
                ))}
              </div>
            ) : (
              <div className="p-5"><EmptyState title="No photos attached" description="This complaint was submitted without image evidence." /></div>
            )}
          </Card>
        </section>
        <aside className="grid gap-6 self-start">
          <Card>
            <h2 className="mb-4 flex items-center gap-2 font-semibold"><CheckCircle2 className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />Complaint details</h2>
            <dl className="grid gap-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-[var(--muted)]">Status</dt><dd>{formatStatus(complaint.status)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[var(--muted)]">Priority</dt><dd>{formatStatus(complaint.priority)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[var(--muted)]">Category</dt><dd>{formatStatus(complaint.category)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="flex items-center gap-1 text-[var(--muted)]"><MapPin className="h-3.5 w-3.5" aria-hidden="true" />Location</dt><dd>{complaint.location ?? "Not provided"}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[var(--muted)]">Due</dt><dd>{complaint.dueAt?.toLocaleDateString() ?? "Not set"}</dd></div>
            </dl>
          </Card>
          <Card>
            <h2 className="mb-4 flex items-center gap-2 font-semibold"><UserRound className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />Resident</h2>
            <p className="text-sm font-medium">{complaint.resident.name}</p>
            <p className="text-sm text-[var(--muted)]">{complaint.resident.email}</p>
            <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--muted)]"><Home className="h-3.5 w-3.5" aria-hidden="true" />{complaint.resident.flatNumber ?? "No flat number"}</p>
          </Card>
          {user.role === "RESIDENT" && complaint.status === "RESOLVED" && !complaint.rating ? (
            <Card>
              <h2 className="mb-4 font-semibold">Close complaint</h2>
              <RatingForm complaintId={complaint.id} />
            </Card>
          ) : null}
          {complaint.rating ? (
            <Card>
              <h2 className="mb-2 font-semibold">Resident rating</h2>
              <p className="text-2xl font-semibold">{complaint.rating.score}/5</p>
              {complaint.rating.comment ? <p className="mt-2 text-sm text-[var(--muted)]">{complaint.rating.comment}</p> : null}
            </Card>
          ) : null}
        </aside>
      </div>
    </AppShell>
  );
}
