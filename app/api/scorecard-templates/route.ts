import { NextResponse } from "next/server";
import { listScorecardTemplates } from "@/entities/scorecard-template/api/fixtures";

export function GET() {
  return NextResponse.json({ templates: listScorecardTemplates() });
}
