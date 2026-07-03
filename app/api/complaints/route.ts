import { NextResponse } from "next/server";
import { createComplaint, findDuplicateComplaints } from "@/services/complaint-service";
import { createComplaintSchema } from "@/lib/validations";
import { getCurrentUser } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "RESIDENT") {
      return NextResponse.json({ error: "Resident access required." }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") ?? "";
    let attachment: File | null = null;
    let parsed;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      parsed = createComplaintSchema.parse({
        title: formData.get("title"),
        description: formData.get("description"),
        category: formData.get("category"),
        priority: formData.get("priority"),
        location: formData.get("location") || undefined,
      });
      const file = formData.get("photo");
      attachment = file instanceof File && file.size > 0 ? file : null;
    } else {
      parsed = createComplaintSchema.parse(await request.json());
    }

    const complaint = await createComplaint(parsed, user.id, attachment);

    return NextResponse.json({ complaint }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create complaint" },
      { status: 400 },
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("duplicateOf");
  const user = await getCurrentUser();

  if (!user || user.role !== "RESIDENT") {
    return NextResponse.json({ error: "Resident access required." }, { status: 401 });
  }

  if (!query) {
    return NextResponse.json({ duplicates: [] });
  }

  const duplicates = await findDuplicateComplaints(query, user.id);
  return NextResponse.json({ duplicates });
}
