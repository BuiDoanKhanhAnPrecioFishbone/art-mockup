import { NextResponse } from "next/server";
import {
  createCriterionTemplate,
  listCriterionTemplates,
} from "@/entities/criterion-template/api/fixtures";

export function GET() {
  return NextResponse.json({ items: listCriterionTemplates() });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json(
      { error: "Name is required." },
      { status: 400 }
    );
  }
  const fresh = createCriterionTemplate({
    name: body.name.trim(),
    weight: typeof body.weight === "number" ? body.weight : 3,
    description: body.description ?? "",
    categories: Array.isArray(body.categories) ? body.categories : [],
    guideline: body.guideline,
  });
  return NextResponse.json({ item: fresh }, { status: 201 });
}
