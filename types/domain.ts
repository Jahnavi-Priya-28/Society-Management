import type { ComplaintCategory, ComplaintStatus, Priority, Role } from "@prisma/client";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  flatNumber?: string | null;
};

export type ComplaintSummary = {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: Priority;
  status: ComplaintStatus;
  location: string | null;
  dueAt: Date | null;
  createdAt: Date;
  resident: {
    name: string;
    flatNumber: string | null;
  };
};

export type DashboardMetric = {
  label: string;
  value: number;
  helper: string;
};
