"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, Building2, Hash, LockKeyhole, Mail, Phone, Sparkles, UserRound } from "lucide-react";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setPending(false);

    if (!response.ok) {
      const body = await response.json();
      setError(body.error ?? "Authentication failed.");
      return;
    }

    router.push(mode === "login" ? "/" : "/resident");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
          <Building2 className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold">ResidentFlow AI</p>
          <p className="text-xs text-[var(--muted)]">Smart society maintenance</p>
        </div>
      </div>
      <span className="section-kicker">
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        {mode === "login" ? "Secure workspace" : "Resident onboarding"}
      </span>
      <h1 className="mt-4 text-2xl font-semibold">{mode === "login" ? "Sign in" : "Create resident account"}</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {mode === "login" ? "Access your resident or admin workspace." : "Register as a resident and start tracking complaints."}
      </p>
      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        {mode === "register" ? (
          <>
            <label className="field-label">
              Name
              <span className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[var(--muted)]" aria-hidden="true" />
                <input name="name" required className="input-surface focus-ring h-11 w-full rounded-md px-9" />
              </span>
            </label>
            <label className="field-label">
              Flat number
              <span className="relative">
                <Hash className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[var(--muted)]" aria-hidden="true" />
                <input name="flatNumber" required className="input-surface focus-ring h-11 w-full rounded-md px-9" />
              </span>
            </label>
            <label className="field-label">
              Phone
              <span className="relative">
                <Phone className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[var(--muted)]" aria-hidden="true" />
                <input name="phone" className="input-surface focus-ring h-11 w-full rounded-md px-9" />
              </span>
            </label>
          </>
        ) : null}
        <label className="field-label">
          Email
          <span className="relative">
            <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[var(--muted)]" aria-hidden="true" />
            <input name="email" type="email" required className="input-surface focus-ring h-11 w-full rounded-md px-9" />
          </span>
        </label>
        <label className="field-label">
          Password
          <span className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[var(--muted)]" aria-hidden="true" />
            <input name="password" type="password" required minLength={8} className="input-surface focus-ring h-11 w-full rounded-md px-9" />
          </span>
        </label>
        {error ? <p className="error-banner flex items-center gap-2" aria-live="polite"><AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />{error}</p> : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>
    </Card>
  );
}
