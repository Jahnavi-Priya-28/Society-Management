import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-md bg-zinc-200/80 dark:bg-zinc-800", className)}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent [animation:shimmer_1.5s_infinite]" />
    </div>
  );
}
