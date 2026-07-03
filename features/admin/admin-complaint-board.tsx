"use client";

import { ComplaintCategory, ComplaintStatus, Priority } from "@prisma/client";
import { CalendarDays, ChevronLeft, ChevronRight, MoreHorizontal, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatStatus } from "@/lib/utils";

type AdminComplaint = {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: Priority;
  status: ComplaintStatus;
  createdAt: Date;
  resident: { name: string; flatNumber: string | null };
  _count: { followers: number };
  attachments: { id: string }[];
  rating: { score: number } | null;
};

const statuses = Object.values(ComplaintStatus);
const categories = Object.values(ComplaintCategory);
const priorities = Object.values(Priority);
const pageSize = 8;

export function AdminComplaintBoard({ complaints }: { complaints: AdminComplaint[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "priority" | "status" | "title">("newest");
  const [page, setPage] = useState(1);

  const sortedComplaints = useMemo(() => {
    const priorityRank = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    return [...complaints].sort((a, b) => {
      if (sortBy === "priority") {
        return priorityRank[b.priority] - priorityRank[a.priority];
      }
      if (sortBy === "status") {
        return a.status.localeCompare(b.status);
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [complaints, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedComplaints.length / pageSize));
  const visibleComplaints = sortedComplaints.slice((page - 1) * pageSize, page * pageSize);

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setPage(1);
    router.push(`/admin?${params.toString()}`);
  }

  async function updateStatus(complaintId: string, status: ComplaintStatus) {
    setPendingId(complaintId);
    await fetch("/api/complaints/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complaintId, status, note: `Admin changed status to ${formatStatus(status)}.` }),
    });
    setPendingId(null);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-5 rounded-lg border border-[var(--border)] bg-white/70 p-4 shadow-sm dark:bg-white/10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold">
              <SlidersHorizontal className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
              Queue controls
            </p>
            <p className="text-xs text-[var(--muted)]">Filter the live queue before assigning status updates.</p>
          </div>
          <Badge tone="blue">{complaints.length} visible</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <label className="relative xl:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" aria-hidden="true" />
            <input
              aria-label="Search complaints"
              placeholder="Search resident, flat, issue"
              defaultValue={searchParams.get("q") ?? ""}
              onBlur={(event) => setFilter("q", event.currentTarget.value)}
              className="input-surface focus-ring h-10 w-full rounded-md pl-9 pr-3 text-sm"
            />
          </label>
          <select aria-label="Filter by status" defaultValue={searchParams.get("status") ?? ""} onChange={(event) => setFilter("status", event.target.value)} className="input-surface focus-ring h-10 rounded-md px-3 text-sm">
            <option value="">All statuses</option>
            {statuses.map((status) => <option key={status} value={status}>{formatStatus(status)}</option>)}
          </select>
          <select aria-label="Filter by category" defaultValue={searchParams.get("category") ?? ""} onChange={(event) => setFilter("category", event.target.value)} className="input-surface focus-ring h-10 rounded-md px-3 text-sm">
            <option value="">All categories</option>
            {categories.map((category) => <option key={category} value={category}>{formatStatus(category)}</option>)}
          </select>
          <select aria-label="Filter by priority" defaultValue={searchParams.get("priority") ?? ""} onChange={(event) => setFilter("priority", event.target.value)} className="input-surface focus-ring h-10 rounded-md px-3 text-sm">
            <option value="">All priorities</option>
            {priorities.map((priority) => <option key={priority} value={priority}>{formatStatus(priority)}</option>)}
          </select>
          <label className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" aria-hidden="true" />
            <input aria-label="From date" type="date" defaultValue={searchParams.get("from") ?? ""} onBlur={(event) => setFilter("from", event.currentTarget.value)} className="input-surface focus-ring h-10 w-full rounded-md pl-9 pr-3 text-sm" />
          </label>
          <label className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" aria-hidden="true" />
            <input aria-label="To date" type="date" defaultValue={searchParams.get("to") ?? ""} onBlur={(event) => setFilter("to", event.currentTarget.value)} className="input-surface focus-ring h-10 w-full rounded-md pl-9 pr-3 text-sm" />
          </label>
          <select aria-label="Sort complaints" value={sortBy} onChange={(event) => { setSortBy(event.target.value as typeof sortBy); setPage(1); }} className="input-surface focus-ring h-10 rounded-md px-3 text-sm">
            <option value="newest">Newest first</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>
      {complaints.length ? (
        <div className="table-shell">
          <div className="sticky top-0 z-10 hidden grid-cols-[1.1fr_0.8fr_0.8fr_1.1fr_44px] gap-4 border-b border-[var(--border)] bg-slate-50/92 px-4 py-3 text-xs font-semibold uppercase text-[var(--muted)] backdrop-blur dark:bg-slate-900/92 lg:grid">
            <span>Issue</span>
            <span>Resident</span>
            <span>Status</span>
            <span>Actions</span>
            <span className="sr-only">Menu</span>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {visibleComplaints.map((complaint) => (
              <article key={complaint.id} className="grid gap-4 bg-white/50 px-4 py-4 transition hover:bg-white/85 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] lg:grid-cols-[1.1fr_0.8fr_0.8fr_1.1fr_44px] lg:items-start">
                <div>
                  <Link href={`/complaints/${complaint.id}`} className="focus-ring rounded-sm text-base font-semibold hover:text-[var(--primary)]">{complaint.title}</Link>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--muted)]">{complaint.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge>{formatStatus(complaint.category)}</Badge>
                    <Badge tone={complaint.priority === "URGENT" ? "red" : complaint.priority === "HIGH" ? "amber" : "neutral"}>{formatStatus(complaint.priority)}</Badge>
                    {complaint.attachments.length ? <Badge tone="green">Photo attached</Badge> : null}
                    {complaint.rating ? <Badge tone="green">{complaint.rating.score}/5 rating</Badge> : null}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">{complaint.resident.name}</p>
                  <p className="text-xs text-[var(--muted)]">{complaint.resident.flatNumber ? `Flat ${complaint.resident.flatNumber}` : "Flat not set"}</p>
                  <p className="mt-2 text-xs text-[var(--muted)]">{complaint._count.followers} followers</p>
                </div>
                <div className="flex flex-wrap gap-2 lg:block">
                  <Badge tone={complaint.status === "RESOLVED" ? "green" : complaint.status === "IN_PROGRESS" ? "blue" : "amber"}>{formatStatus(complaint.status)}</Badge>
                  <p className="mt-2 text-xs text-[var(--muted)]">{new Date(complaint.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-wrap items-start gap-2">
                  {statuses.map((status) => (
                    <Button
                      key={status}
                      type="button"
                      variant={status === complaint.status ? "primary" : "secondary"}
                      disabled={pendingId === complaint.id || status === complaint.status}
                      onClick={() => updateStatus(complaint.id, status)}
                      className="h-9 px-3 text-xs"
                    >
                      {formatStatus(status)}
                    </Button>
                  ))}
                </div>
                <button type="button" className="focus-ring hidden h-9 w-9 place-items-center rounded-md border border-[var(--border)] bg-white/70 text-[var(--muted)] transition hover:text-[var(--foreground)] dark:bg-white/10 lg:grid" aria-label={`More actions for ${complaint.title}`}>
                  <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                </button>
              </article>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] bg-slate-50/70 px-4 py-3 text-sm dark:bg-slate-900/60">
            <p className="text-[var(--muted)]">
              Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, sortedComplaints.length)} of {sortedComplaints.length}
            </p>
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" className="h-9 px-3" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Previous
              </Button>
              <Badge>Page {page} / {totalPages}</Badge>
              <Button type="button" variant="secondary" className="h-9 px-3" disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>
                Next
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState title="No complaints match" description="Try clearing filters or wait for resident submissions." />
      )}
    </div>
  );
}
