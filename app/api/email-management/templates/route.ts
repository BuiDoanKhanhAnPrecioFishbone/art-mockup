import { NextResponse } from "next/server";
import { emailTemplates } from "@/shared/fixtures/email-templates";

export async function GET() {
  return NextResponse.json(emailTemplates);
}
