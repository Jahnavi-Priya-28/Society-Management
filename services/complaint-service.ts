import { ComplaintStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { type CreateComplaintInput } from "@/lib/validations";
import { similarityScore } from "@/utils/complaint-assistant";
import { uploadComplaintImage } from "@/services/cloudinary";
import { getResend } from "@/services/resend";

const dueHoursByPriority = {
  LOW: 120,
  MEDIUM: 72,
  HIGH: 24,
  URGENT: 8,
} as const;

export async function createComplaint(input: CreateComplaintInput, residentId: string, attachment?: File | null) {
  const dueAt = new Date(Date.now() + dueHoursByPriority[input.priority] * 60 * 60 * 1000);
  const uploaded = attachment ? await uploadComplaintImage(attachment) : null;

  return prisma.complaint.create({
    data: {
      ...input,
      location: input.location || null,
      residentId,
      dueAt,
      history: {
        create: {
          actorId: residentId,
          toStatus: "OPEN",
          note: "Complaint submitted by resident.",
        },
      },
      attachments: uploaded
        ? {
            create: {
              url: uploaded.url,
              publicId: uploaded.publicId,
              fileName: attachment?.name ?? "complaint-photo",
            },
          }
        : undefined,
    },
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      category: true,
      createdAt: true,
      attachments: { select: { url: true, fileName: true } },
    },
  });
}

export async function updateComplaintStatus(
  complaintId: string,
  actorId: string,
  status: ComplaintStatus,
  note?: string,
) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.complaint.findUniqueOrThrow({
      where: { id: complaintId },
      select: {
        status: true,
        title: true,
        resident: { select: { email: true, name: true } },
      },
    });

    const updated = await tx.complaint.update({
      where: { id: complaintId },
      data: {
        status,
        history: {
          create: {
            actorId,
            fromStatus: existing.status,
            toStatus: status,
            note,
          },
        },
      },
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
      },
    });

    const resend = getResend();

    if (resend) {
      await resend.emails.send({
        from: process.env.NOTICE_FROM_EMAIL ?? "ResidentFlow AI <notices@example.com>",
        to: existing.resident.email,
        subject: `Complaint status updated: ${existing.title}`,
        html: `<p>Hello ${existing.resident.name},</p><p>Your complaint <strong>${existing.title}</strong> is now <strong>${status.replaceAll("_", " ")}</strong>.</p>${note ? `<p>${note}</p>` : ""}`,
      });
    }

    return updated;
  });
}

export async function rateComplaint(complaintId: string, residentId: string, score: number, comment?: string) {
  return prisma.$transaction(async (tx) => {
    const complaint = await tx.complaint.findFirstOrThrow({
      where: { id: complaintId, residentId, status: "RESOLVED" },
      select: { status: true },
    });

    await tx.rating.upsert({
      where: { complaintId },
      update: { score, comment },
      create: { complaintId, residentId, score, comment },
    });

    await tx.complaint.update({
      where: { id: complaintId },
      data: {
        status: "CLOSED",
        history: {
          create: {
            actorId: residentId,
            fromStatus: complaint.status,
            toStatus: "CLOSED",
            note: "Resident rated the resolution and closed the complaint.",
          },
        },
      },
    });
  });
}

export async function followComplaint(complaintId: string, userId: string) {
  return prisma.complaintFollower.upsert({
    where: { complaintId_userId: { complaintId, userId } },
    update: {},
    create: { complaintId, userId },
  });
}

export async function findDuplicateComplaints(description: string, residentId: string) {
  const candidates = await prisma.complaint.findMany({
    where: {
      residentId,
      status: { in: ["OPEN", "IN_PROGRESS"] },
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return candidates
    .map((candidate) => ({
      ...candidate,
      score: similarityScore(description, `${candidate.title} ${candidate.description}`),
    }))
    .filter((candidate) => candidate.score >= 0.35)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
