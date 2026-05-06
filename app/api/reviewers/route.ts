import { NextResponse } from "next/server";
import { REVIEWERS } from "@/shared/fixtures/reviewers";

export function GET() {
  return NextResponse.json({ reviewers: REVIEWERS });
}
