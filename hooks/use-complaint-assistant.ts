"use client";

import { useMemo } from "react";
import { suggestComplaint } from "@/utils/complaint-assistant";

export function useComplaintAssistant(text: string) {
  return useMemo(() => suggestComplaint(text), [text]);
}
