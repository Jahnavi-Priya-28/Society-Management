import { prisma } from "@/lib/prisma";

const overdueKey = "overdue_threshold_days";

export async function getOverdueThresholdDays() {
  const setting = await prisma.systemSetting.findUnique({ where: { key: overdueKey } });
  const value = Number(setting?.value ?? "3");
  return Number.isFinite(value) ? value : 3;
}

export async function setOverdueThresholdDays(days: number) {
  return prisma.systemSetting.upsert({
    where: { key: overdueKey },
    update: { value: String(days) },
    create: { key: overdueKey, value: String(days) },
  });
}
