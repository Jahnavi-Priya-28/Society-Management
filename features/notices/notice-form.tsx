"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, BellRing, Pin, SendHorizonal } from "lucide-react";

export function NoticeForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/notices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.get("title"),
        body: formData.get("body"),
        pinned: formData.get("pinned") === "on",
        important: formData.get("important") === "on",
      }),
    });

    setPending(false);

    if (!response.ok) {
      const body = await response.json();
      setError(body.error ?? "Unable to publish notice.");
      return;
    }

    event.currentTarget.reset();
    router.refresh();
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-[var(--border)] px-5 py-4">
        <span className="section-kicker">
          <SendHorizonal className="h-3.5 w-3.5" aria-hidden="true" />
          Admin broadcast
        </span>
        <h2 className="mt-3 text-lg font-semibold">Publish notice</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Share updates with residents and mark critical items for email delivery.</p>
      </div>
      <form onSubmit={onSubmit} className="grid gap-4 p-5">
        <label className="field-label">
          Notice title
          <input name="title" required placeholder="e.g. Water supply maintenance" className="input-surface focus-ring h-11 rounded-md px-3" />
        </label>
        <label className="field-label">
          Notice details
          <textarea name="body" required placeholder="Write the update residents need to know." rows={4} className="input-surface focus-ring rounded-md px-3 py-2" />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="focus-within:outline-primary flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--border)] bg-white/60 p-3 text-sm shadow-sm transition hover:border-blue-300 dark:bg-white/[0.06]">
            <input type="checkbox" name="pinned" className="mt-1 h-4 w-4 accent-[var(--primary)]" />
            <span>
              <span className="flex items-center gap-2 font-semibold"><Pin className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />Pin to top</span>
              <span className="mt-1 block text-xs text-[var(--muted)]">Keep this notice visible above regular updates.</span>
            </span>
          </label>
          <label className="focus-within:outline-primary flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--border)] bg-white/60 p-3 text-sm shadow-sm transition hover:border-blue-300 dark:bg-white/[0.06]">
            <input type="checkbox" name="important" className="mt-1 h-4 w-4 accent-[var(--primary)]" />
            <span>
              <span className="flex items-center gap-2 font-semibold"><BellRing className="h-4 w-4 text-amber-600" aria-hidden="true" />Email residents</span>
              <span className="mt-1 block text-xs text-[var(--muted)]">Notify residents immediately when the notice is important.</span>
            </span>
          </label>
        </div>
        {error ? <p className="error-banner flex items-center gap-2" aria-live="polite"><AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />{error}</p> : null}
        <div className="flex justify-end border-t border-[var(--border)] pt-4">
          <Button type="submit" disabled={pending}>{pending ? "Publishing..." : "Publish notice"}</Button>
        </div>
      </form>
    </Card>
  );
}
