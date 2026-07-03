"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Star } from "lucide-react";

export function RatingForm({ complaintId }: { complaintId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/complaints/rating", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        complaintId,
        score: Number(formData.get("score")),
        comment: formData.get("comment") || undefined,
      }),
    });
    setPending(false);

    if (!response.ok) {
      const body = await response.json();
      setError(body.error ?? "Unable to submit rating.");
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <label className="field-label">
        <span className="flex items-center gap-2"><Star className="h-4 w-4 text-amber-500" aria-hidden="true" />Satisfaction rating</span>
        <select name="score" defaultValue="5" className="input-surface focus-ring h-11 rounded-md px-3">
          {[5, 4, 3, 2, 1].map((score) => (
            <option key={score} value={score}>{score} stars</option>
          ))}
        </select>
      </label>
      <label className="field-label">
        Feedback
        <textarea name="comment" rows={3} placeholder="Optional feedback for the admin team" className="input-surface focus-ring rounded-md px-3 py-2" />
      </label>
      {error ? <p className="error-banner flex items-center gap-2" aria-live="polite"><AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />{error}</p> : null}
      <Button type="submit" disabled={pending} className="w-full justify-center">{pending ? "Closing..." : "Submit rating and close"}</Button>
    </form>
  );
}
