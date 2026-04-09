import { NextResponse } from "next/server";
import { emailLogs } from "@/shared/fixtures/email-logs";

export async function GET() {
  return NextResponse.json(emailLogs);
}
