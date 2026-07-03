import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-[var(--primary)] text-white shadow-sm shadow-blue-600/20 hover:-translate-y-0.5 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400",
        variant === "secondary" && "border border-[var(--border)] bg-white/85 text-[var(--foreground)] shadow-sm hover:-translate-y-0.5 hover:bg-white dark:bg-white/10 dark:hover:bg-white/15",
        variant === "ghost" && "text-[var(--muted)] hover:bg-black/5 hover:text-[var(--foreground)] dark:hover:bg-white/10",
        variant === "danger" && "bg-[var(--danger)] text-white shadow-sm hover:-translate-y-0.5 hover:bg-red-600",
        className,
      )}
      {...props}
    />
  );
}
