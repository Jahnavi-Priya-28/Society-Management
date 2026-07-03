import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("Password123!", 12);
  const [resident, admin] = await Promise.all([
    prisma.user.upsert({
      where: { email: "resident@residentflow.ai" },
      update: {},
      create: {
        id: "demo-resident",
        name: "Aarav Mehta",
        email: "resident@residentflow.ai",
        passwordHash,
        role: "RESIDENT",
        flatNumber: "A-1204",
        phone: "+91 90000 00001",
      },
    }),
    prisma.user.upsert({
      where: { email: "admin@residentflow.ai" },
      update: {},
      create: {
        id: "demo-admin",
        name: "Society Admin",
        email: "admin@residentflow.ai",
        passwordHash,
        role: "ADMIN",
      },
    }),
  ]);

  const complaint = await prisma.complaint.upsert({
    where: { id: "demo-complaint-water-leak" },
    update: {},
    create: {
      id: "demo-complaint-water-leak",
      title: "Water leaking from bathroom ceiling",
      description: "Water is dripping continuously from the bathroom ceiling near the exhaust vent.",
      category: "PLUMBING",
      priority: "HIGH",
      status: "IN_PROGRESS",
      location: "Tower A, Flat 1204",
      dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      residentId: resident.id,
      history: {
        create: [
          { actorId: resident.id, toStatus: "OPEN", note: "Complaint submitted by resident." },
          { actorId: admin.id, fromStatus: "OPEN", toStatus: "IN_PROGRESS", note: "Assigned to plumbing vendor." },
        ],
      },
    },
  });

  await prisma.rating.upsert({
    where: { complaintId: complaint.id },
    update: {},
    create: {
      complaintId: complaint.id,
      residentId: resident.id,
      score: 4,
      comment: "Quick response from the admin team.",
    },
  });

  await prisma.notice.upsert({
    where: { id: "demo-notice-water-shutdown" },
    update: {},
    create: {
      id: "demo-notice-water-shutdown",
      title: "Water supply maintenance",
      body: "Water supply will be paused from 10 AM to 12 PM on Sunday for tank cleaning.",
      pinned: true,
      important: true,
    },
  });

  await prisma.systemSetting.upsert({
    where: { key: "overdue_threshold_days" },
    update: {},
    create: { key: "overdue_threshold_days", value: "3" },
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
