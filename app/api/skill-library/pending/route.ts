import { NextResponse } from "next/server";
import { pendingApprovals } from "@/shared/fixtures/skills";

export async function GET() {
  return NextResponse.json(pendingApprovals);
}
