import { NextResponse } from "next/server";
import { getProgramEmail } from "@/entities/program-email/api/fixtures";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const email = getProgramEmail(id);
  if (!email)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ email });
}
