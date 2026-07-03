import { Inbox } from "lucide-react";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="grid min-h-48 place-items-center rounded-lg border border-dashed border-[var(--border)] bg-white/45 p-8 text-center dark:bg-white/5">
      <div>
        <span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-200">
          <Inbox className="h-5 w-5" aria-hidden="true" />
        </span>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
      </div>
    </div>
  );
}
