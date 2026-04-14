import { NextResponse } from "next/server";
import { applicationFormFixture } from "@/shared/fixtures/application-form";

export function GET() {
  return NextResponse.json(applicationFormFixture);
}
