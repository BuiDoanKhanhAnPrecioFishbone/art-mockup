import { NextResponse } from "next/server";
import { listCriterionTemplates } from "@/entities/criterion-template/api/fixtures";

export function GET() {
  return NextResponse.json({ items: listCriterionTemplates() });
}
