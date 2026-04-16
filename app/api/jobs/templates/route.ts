import { NextResponse } from "next/server";
import { jobTemplates } from "@/shared/fixtures/jobs";

export function GET() {
  return NextResponse.json(jobTemplates);
}
