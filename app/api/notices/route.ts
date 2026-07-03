import { NextResponse } from "next/server";
import { createNoticeSchema } from "@/lib/validations";
import { createNotice } from "@/services/notice-service";
import { getCurrentUser } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required." }, { status: 401 });
    }

    const notice = await createNotice(createNoticeSchema.parse(await request.json()));
    return NextResponse.json({ notice }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to publish notice" },
      { status: 400 },
    );
  }
}
