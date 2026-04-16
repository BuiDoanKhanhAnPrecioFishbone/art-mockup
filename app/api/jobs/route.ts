import { NextResponse } from "next/server";
import { jobPrograms } from "@/shared/fixtures/jobs";

export function GET() {
  return NextResponse.json(jobPrograms);
}
