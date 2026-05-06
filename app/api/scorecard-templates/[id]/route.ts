import { NextResponse } from "next/server";
import { getScorecardTemplate } from "@/entities/scorecard-template/api/fixtures";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const template = getScorecardTemplate(id);
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ template });
}
