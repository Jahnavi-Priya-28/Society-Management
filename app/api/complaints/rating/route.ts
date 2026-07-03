import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { ratingSchema } from "@/lib/validations";
import { rateComplaint } from "@/services/complaint-service";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "RESIDENT") {
      return NextResponse.json({ error: "Resident access required." }, { status: 401 });
    }

    const parsed = ratingSchema.parse(await request.json());
    await rateComplaint(parsed.complaintId, user.id, parsed.score, parsed.comment);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to submit rating." },
      { status: 400 },
    );
  }
}
