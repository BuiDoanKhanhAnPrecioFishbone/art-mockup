import { NextResponse } from "next/server";
import { emailTemplates } from "@/shared/fixtures/email-templates";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const template = emailTemplates.find((t) => t.id === id);
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(template);
}
