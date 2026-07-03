"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--background)] p-4">
      <Card className="max-w-md text-center">
        <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/70 dark:text-rose-200">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </span>
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{error.message}</p>
        <Button className="mx-auto mt-5" onClick={reset}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Try again
        </Button>
      </Card>
    </main>
  );
}
