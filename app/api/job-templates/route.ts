import { NextResponse } from "next/server";
import { listJobTemplates } from "@/entities/job-template/api/fixtures";

export function GET() {
  return NextResponse.json({ templates: listJobTemplates() });
}
