import { NextResponse } from "next/server";
import { listFlowTemplates } from "@/entities/flow-template/api/fixtures";

export function GET() {
  return NextResponse.json({ templates: listFlowTemplates() });
}
