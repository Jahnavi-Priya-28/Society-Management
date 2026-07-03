import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { registerResident } from "@/lib/session";
import { registerSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    await registerResident(registerSchema.parse(await request.json()));
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create account." },
      { status: 400 },
    );
  }
}
