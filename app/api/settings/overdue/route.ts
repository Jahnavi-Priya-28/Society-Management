import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { overdueSettingsSchema } from "@/lib/validations";
import { setOverdueThresholdDays } from "@/services/settings-service";

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required." }, { status: 401 });
    }

    const parsed = overdueSettingsSchema.parse(await request.json());
    await setOverdueThresholdDays(parsed.days);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update settings." },
      { status: 400 },
    );
  }
}
