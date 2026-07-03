import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <section
      className={cn(
        "premium-panel rounded-lg p-5 backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:shadow-xl",
        className,
      )}
      {...props}
    />
  );
}
