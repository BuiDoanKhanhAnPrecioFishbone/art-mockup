import { NextResponse } from "next/server";
import {
  createScorecardTemplate,
  listScorecardTemplates,
} from "@/entities/scorecard-template/api/fixtures";

export function GET() {
  return NextResponse.json({ templates: listScorecardTemplates() });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json(
      { error: "Name is required." },
      { status: 400 }
    );
  }
  const fresh = createScorecardTemplate({
    name: body.name.trim(),
    description: body.description ?? "",
    criteria: Array.isArray(body.criteria) ? body.criteria : [],
  });
  return NextResponse.json({ template: fresh }, { status: 201 });
}
