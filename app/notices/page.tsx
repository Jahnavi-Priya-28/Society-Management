import { BellRing, CalendarDays, Megaphone, Pin } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { prisma } from "@/lib/prisma";
import type { Notice } from "@prisma/client";
import { getCurrentUser } from "@/lib/session";
import { NoticeForm } from "@/features/notices/notice-form";

export const dynamic = "force-dynamic";

export default async function NoticesPage() {
  const user = await getCurrentUser();
  let notices: Notice[] = [];
  try {
    notices = await prisma.notice.findMany({ orderBy: [{ pinned: "desc" }, { createdAt: "desc" }], take: 20 });
  } catch {
    notices = [];
  }

  return (
    <AppShell active="/notices" user={user}>
      <PageHeader title="Notice board" description="Important announcements, planned maintenance, and society-wide communication." />
      {user?.role === "ADMIN" ? (
        <div className="mb-6">
          <NoticeForm />
        </div>
      ) : null}
      <Card className="overflow-hidden p-0">
        <div className="border-b border-[var(--border)] px-5 py-4">
          <span className="section-kicker">
            <Megaphone className="h-3.5 w-3.5" aria-hidden="true" />
            Resident updates
          </span>
          <h2 className="mt-3 text-lg font-semibold">Published notices</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Pinned and important notices stay easy to scan for every resident.</p>
        </div>
        {notices.length ? (
          <div className="grid gap-3 p-5">
            {notices.map((notice) => (
              <article key={notice.id} className="rounded-lg border border-[var(--border)] bg-white/65 p-4 shadow-sm transition hover:border-blue-200 hover:bg-white dark:bg-white/[0.06] dark:hover:bg-white/[0.09]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-200">
                      <Megaphone className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="font-semibold">{notice.title}</h2>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--muted)]">
                        <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                        {notice.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {notice.pinned ? <Badge tone="blue"><Pin className="h-3.5 w-3.5" aria-hidden="true" />Pinned</Badge> : null}
                    {notice.important ? <Badge tone="amber"><BellRing className="h-3.5 w-3.5" aria-hidden="true" />Important</Badge> : null}
                  </div>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{notice.body}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="p-5">
            <EmptyState title="No notices published" description="Admin announcements will appear here." />
          </div>
        )}
      </Card>
    </AppShell>
  );
}
