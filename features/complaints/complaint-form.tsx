"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ComplaintCategory, Priority } from "@prisma/client";
import { AlertCircle, FileImage, MapPin, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useComplaintAssistant } from "@/hooks/use-complaint-assistant";
import { useCreateComplaint } from "@/hooks/use-optimistic-complaints";
import { createComplaintSchema, type CreateComplaintInput } from "@/lib/validations";
import { formatStatus } from "@/lib/utils";

const categories = Object.values(ComplaintCategory);
const priorities = Object.values(Priority);

export function ComplaintForm() {
  const mutation = useCreateComplaint();
  const [photo, setPhoto] = useState<File | null>(null);
  const [duplicates, setDuplicates] = useState<{ id: string; title: string; score: number }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<CreateComplaintInput>({
    resolver: zodResolver(createComplaintSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "OTHER",
      priority: "MEDIUM",
      location: "",
    },
  });
  const description = form.watch("description");
  const suggestion = useComplaintAssistant(description);

  useEffect(() => {
    if (description.length < 20) {
      setDuplicates([]);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const response = await fetch(`/api/complaints?duplicateOf=${encodeURIComponent(description)}`, {
        signal: controller.signal,
      });

      if (response.ok) {
        const body = await response.json();
        setDuplicates(body.duplicates ?? []);
      }
    }, 450);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [description]);

  function applySuggestion() {
    form.setValue("category", suggestion.category);
    form.setValue("priority", suggestion.priority);
  }

  async function onSubmit(values: CreateComplaintInput) {
    setError(null);
    const payload = new FormData();
    payload.set("title", values.title);
    payload.set("description", values.description);
    payload.set("category", values.category);
    payload.set("priority", values.priority);
    payload.set("location", values.location ?? "");
    if (photo) {
      payload.set("photo", photo);
    }

    try {
      await mutation.mutateAsync(payload);
      setPhoto(null);
      setDuplicates([]);
      form.reset();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit complaint.");
    }
  }

  async function followComplaint(complaintId: string) {
    await fetch("/api/complaints/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complaintId }),
    });
    setDuplicates((items) => items.filter((item) => item.id !== complaintId));
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-[var(--border)] px-5 py-4 sm:px-6">
        <h2 className="font-semibold">Complaint details</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Give the maintenance team enough detail to assess the issue.</p>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5 p-5 sm:p-6">
        <div className="grid gap-2">
          <label htmlFor="title" className="field-label">
            Complaint title
          </label>
          <input
            id="title"
            placeholder="e.g. Water leakage near lift"
            className="input-surface focus-ring h-11 rounded-md px-3"
            {...form.register("title")}
          />
          {form.formState.errors.title ? <p className="text-sm text-rose-600" role="alert">{form.formState.errors.title.message}</p> : null}
        </div>
        <div className="grid gap-2">
          <label htmlFor="description" className="field-label">
            Description
          </label>
          <textarea
            id="description"
            rows={5}
            placeholder="Describe what happened, when it started, and how it affects residents."
            className="input-surface focus-ring rounded-md px-3 py-2"
            {...form.register("description")}
          />
          {form.formState.errors.description ? <p className="text-sm text-rose-600" role="alert">{form.formState.errors.description.message}</p> : null}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-teal-200 bg-teal-50 p-3 text-sm text-teal-950 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-50">
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Suggested: {formatStatus(suggestion.category)} / {formatStatus(suggestion.priority)}
          </span>
          <Button type="button" variant="secondary" onClick={applySuggestion}>
            Apply
          </Button>
        </div>
        {duplicates.length ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
            <p className="font-medium">This issue may already exist.</p>
            <div className="mt-2 grid gap-2">
              {duplicates.map((duplicate) => (
                <div key={duplicate.id} className="flex flex-wrap items-center justify-between gap-2">
                  <span>{duplicate.title} ({Math.round(duplicate.score * 100)}% match)</span>
                  <Button type="button" variant="secondary" onClick={() => followComplaint(duplicate.id)}>
                    Follow instead
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="grid gap-2 text-sm font-medium">
            Category
            <select className="input-surface focus-ring h-11 rounded-md px-3" {...form.register("category")}>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {formatStatus(category)}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Priority
            <select className="input-surface focus-ring h-11 rounded-md px-3" {...form.register("priority")}>
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {formatStatus(priority)}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Location
            <span className="relative"><MapPin className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[var(--muted)]" aria-hidden="true" /><input placeholder="Tower, floor, or common area" className="input-surface focus-ring h-11 w-full rounded-md pl-9 pr-3" {...form.register("location")} /></span>
          </label>
        </div>
        <label className="grid gap-2 rounded-lg border border-dashed border-[var(--border)] bg-slate-50/70 p-4 text-sm font-medium transition hover:border-blue-300 dark:bg-slate-950/40">
          <span className="flex items-center gap-2"><FileImage className="h-4 w-4 text-blue-600" aria-hidden="true" />Photo attachment</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="focus-ring block w-full rounded-md text-sm file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-700 dark:file:bg-blue-950 dark:file:text-blue-200"
            onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
          />
          <span className="field-help">PNG, JPEG, or WebP. Add a clear image when it helps locate or assess the issue.</span>
        </label>
        {error ? <p className="error-banner flex items-center gap-2" aria-live="polite"><AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />{error}</p> : null}
        <div className="flex justify-end border-t border-[var(--border)] pt-5"><Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Submitting..." : "Submit complaint"}
        </Button></div>
      </form>
    </Card>
  );
}
