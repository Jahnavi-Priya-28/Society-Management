"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock3, Save } from "lucide-react";

export function OverdueSettingsForm({ days }: { days: number }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/settings/overdue", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ days: Number(formData.get("days")) }),
    });
    setPending(false);

    if (!response.ok) {
      const body = await response.json();
      setError(body.error ?? "Unable to update setting.");
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:max-w-md">
      <label className="field-label">
        <span className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />Overdue threshold in days</span>
        <input
          name="days"
          type="number"
          min={1}
          max={30}
          defaultValue={days}
          className="input-surface focus-ring h-11 rounded-md px-3"
        />
        <span className="field-help">Complaints open beyond this limit are highlighted as overdue in the admin queue.</span>
      </label>
      {error ? <p className="error-banner flex items-center gap-2" aria-live="polite"><AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />{error}</p> : null}
      <div className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-4">
        <Button type="submit" disabled={pending} className="w-fit"><Save className="h-4 w-4" aria-hidden="true" />{pending ? "Saving..." : "Save settings"}</Button>
        <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--muted)]">Current: {days} days</span>
      </div>
    </form>
  );
}
