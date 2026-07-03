"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateComplaintInput } from "@/lib/validations";

export function useCreateComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateComplaintInput | FormData) => {
      const isFormData = input instanceof FormData;
      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: isFormData ? undefined : { "Content-Type": "application/json" },
        body: isFormData ? input : JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error((await response.json()).error ?? "Unable to submit complaint");
      }

      return response.json();
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ["resident-complaints"] });
      const previous = queryClient.getQueryData(["resident-complaints"]);
      const optimistic = input instanceof FormData
        ? {
            title: String(input.get("title") ?? ""),
            description: String(input.get("description") ?? ""),
            category: String(input.get("category") ?? "OTHER"),
            priority: String(input.get("priority") ?? "MEDIUM"),
          }
        : input;
      queryClient.setQueryData(["resident-complaints"], (old: unknown[] = []) => [
        { id: `optimistic-${Date.now()}`, ...optimistic, status: "OPEN", createdAt: new Date() },
        ...old,
      ]);
      return { previous };
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(["resident-complaints"], context?.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["resident-complaints"] });
    },
  });
}
