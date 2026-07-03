import { ComplaintCategory, ComplaintStatus, Prisma, Priority } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOverdueThresholdDays } from "@/services/settings-service";

const complaintSelect = {
  id: true,
  title: true,
  description: true,
  category: true,
  priority: true,
  status: true,
  location: true,
  dueAt: true,
  createdAt: true,
  resident: {
    select: {
      name: true,
      flatNumber: true,
    },
  },
} satisfies Prisma.ComplaintSelect;

function aggregateCount(value: true | { _all?: number } | undefined) {
  return typeof value === "object" ? (value._all ?? 0) : 0;
}

export async function getDashboardData() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const overdueDays = await getOverdueThresholdDays();
  const overdueCutoff = new Date(Date.now() - overdueDays * 24 * 60 * 60 * 1000);

  const [complaints, statusCounts, categoryCounts, monthlyCounts, ratingAggregate, recentActivity, notices, residentCount] =
    await prisma.$transaction([
      prisma.complaint.findMany({
        select: complaintSelect,
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.complaint.groupBy({
        by: ["status"],
        _count: { _all: true },
        orderBy: { status: "asc" },
      }),
      prisma.complaint.groupBy({
        by: ["category"],
        _count: { _all: true },
        orderBy: { category: "asc" },
      }),
      prisma.complaint.findMany({
        where: { createdAt: { gte: startOfYear } },
        select: { createdAt: true },
      }),
      prisma.rating.aggregate({
        _avg: { score: true },
        _count: { _all: true },
      }),
      prisma.complaintHistory.findMany({
        select: {
          id: true,
          toStatus: true,
          note: true,
          createdAt: true,
          complaint: { select: { title: true } },
          actor: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.notice.findMany({
        orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
        take: 5,
      }),
      prisma.user.count({ where: { role: "RESIDENT" } }),
    ]);

  const total = statusCounts.reduce((sum, item) => sum + aggregateCount(item._count), 0);
  const byStatus = Object.fromEntries(statusCounts.map((item) => [item.status, aggregateCount(item._count)])) as Partial<
    Record<ComplaintStatus, number>
  >;
  const overdue = await prisma.complaint.count({
    where: {
      OR: [{ dueAt: { lt: now } }, { createdAt: { lt: overdueCutoff } }],
      status: { in: ["OPEN", "IN_PROGRESS"] },
    },
  });

  const monthlyTrend = Array.from({ length: 12 }, (_, month) => {
    const label = new Date(now.getFullYear(), month, 1).toLocaleString("en", { month: "short" });
    const value = monthlyCounts
      .filter((item) => item.createdAt.getMonth() === month)
      .reduce((sum) => sum + 1, 0);
    return { month: label, complaints: value };
  });

  return {
    metrics: [
      { label: "Total complaints", value: total, helper: `${residentCount} active residents` },
      { label: "Open", value: byStatus.OPEN ?? 0, helper: "Awaiting admin triage" },
      { label: "In progress", value: byStatus.IN_PROGRESS ?? 0, helper: "Currently being handled" },
      { label: "Resolved", value: byStatus.RESOLVED ?? 0, helper: "Ready for resident rating" },
      { label: "Overdue", value: overdue, helper: "Past expected due date" },
    ],
    categoryChart: categoryCounts.map((item) => ({ name: item.category, value: aggregateCount(item._count) })),
    statusChart: statusCounts.map((item) => ({ name: item.status, value: aggregateCount(item._count) })),
    monthlyTrend,
    averageRating: ratingAggregate._avg.score ?? 0,
    ratingCount: ratingAggregate._count._all,
    recentComplaints: complaints,
    recentActivity,
    notices,
  };
}

export async function getAdminComplaints(filters: {
  category?: ComplaintCategory;
  status?: ComplaintStatus;
  priority?: Priority;
  q?: string;
  from?: string;
  to?: string;
}) {
  return prisma.complaint.findMany({
    select: {
      ...complaintSelect,
      attachments: { select: { id: true } },
      rating: { select: { score: true } },
      _count: { select: { followers: true } },
    },
    where: {
      category: filters.category,
      status: filters.status,
      priority: filters.priority,
      createdAt: {
        gte: filters.from ? new Date(filters.from) : undefined,
        lte: filters.to ? new Date(filters.to) : undefined,
      },
      OR: filters.q
        ? [
            { title: { contains: filters.q, mode: "insensitive" } },
            { description: { contains: filters.q, mode: "insensitive" } },
            { resident: { name: { contains: filters.q, mode: "insensitive" } } },
            { resident: { flatNumber: { contains: filters.q, mode: "insensitive" } } },
          ]
        : undefined,
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    take: 100,
  });
}

export async function getComplaintDetail(id: string, viewerId: string, role: "ADMIN" | "RESIDENT") {
  return prisma.complaint.findFirst({
    where: {
      id,
      ...(role === "RESIDENT" ? { OR: [{ residentId: viewerId }, { followers: { some: { userId: viewerId } } }] } : {}),
    },
    include: {
      resident: { select: { name: true, email: true, flatNumber: true, phone: true } },
      attachments: true,
      rating: true,
      followers: { select: { userId: true } },
      history: {
        include: { actor: { select: { name: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function getResidentDashboardData(residentId: string) {
  const [complaints, notices] = await prisma.$transaction([
    prisma.complaint.findMany({
      select: {
        ...complaintSelect,
        history: {
          select: {
            id: true,
            toStatus: true,
            note: true,
            createdAt: true,
            actor: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 4,
        },
        rating: { select: { score: true } },
      },
      where: { residentId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.notice.findMany({
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      take: 5,
    }),
  ]);

  return { complaints, notices };
}
