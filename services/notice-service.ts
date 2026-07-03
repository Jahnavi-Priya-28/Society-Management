import { prisma } from "@/lib/prisma";
import { getResend } from "@/services/resend";
import { type CreateNoticeInput } from "@/lib/validations";

export async function createNotice(input: CreateNoticeInput) {
  const notice = await prisma.notice.create({ data: input });

  const resend = getResend();

  if (input.important && resend) {
    const residents = await prisma.user.findMany({
      where: { role: "RESIDENT" },
      select: { email: true, name: true },
      take: 500,
    });

    await resend.batch.send(
      residents.map((resident) => ({
        from: process.env.NOTICE_FROM_EMAIL ?? "ResidentFlow AI <notices@example.com>",
        to: resident.email,
        subject: `Important notice: ${input.title}`,
        html: `<p>Hello ${resident.name},</p><p>${input.body}</p>`,
      })),
    );
  }

  return notice;
}
