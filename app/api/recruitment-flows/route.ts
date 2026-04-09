import { NextResponse } from "next/server";
import { recruitmentFlows } from "@/shared/fixtures/recruitment-flows";

export async function GET() {
  return NextResponse.json(recruitmentFlows);
}
