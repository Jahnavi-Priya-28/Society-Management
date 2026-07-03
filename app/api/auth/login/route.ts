import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations";
import { loginUser } from "@/lib/session";

export async function POST(request: Request) {
  try {
    await loginUser(loginSchema.parse(await request.json()));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to sign in." },
      { status: 401 },
    );
  }
}
