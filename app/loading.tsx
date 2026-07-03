import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <AppShell>
      <div className="mb-6 space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-80 max-w-full" />
        <Skeleton className="h-4 w-[36rem] max-w-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-32" />
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </AppShell>
  );
}
