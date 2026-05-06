import { NextResponse } from "next/server";
import { deleteSectionTemplates } from "@/entities/section-template/api/fixtures";

export async function POST(req: Request) {
  const body = (await req.json()) as { ids?: string[] };
  if (!body.ids || body.ids.length === 0) {
    return NextResponse.json({ error: "ids[] required" }, { status: 400 });
  }
  return NextResponse.json(deleteSectionTemplates(body.ids));
}
