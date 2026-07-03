import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { followComplaint } from "@/services/complaint-service";
import { z } from "zod";

const followSchema = z.object({ complaintId: z.string().cuid() });

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "RESIDENT") {
      return NextResponse.json({ error: "Resident access required." }, { status: 401 });
    }

    const parsed = followSchema.parse(await request.json());
    await followComplaint(parsed.complaintId, user.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to follow complaint." },
      { status: 400 },
    );
  }
}
