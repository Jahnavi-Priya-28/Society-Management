import { NextResponse } from "next/server";
import { updateComplaintStatus } from "@/services/complaint-service";
import { updateComplaintStatusSchema } from "@/lib/validations";
import { getCurrentUser } from "@/lib/session";

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required." }, { status: 401 });
    }

    const parsed = updateComplaintStatusSchema.parse(await request.json());
    const complaint = await updateComplaintStatus(parsed.complaintId, user.id, parsed.status, parsed.note);

    return NextResponse.json({ complaint });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update complaint" },
      { status: 400 },
    );
  }
}
