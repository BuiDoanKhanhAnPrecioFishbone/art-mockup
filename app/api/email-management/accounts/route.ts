import { NextResponse } from "next/server";
import { emailAccounts } from "@/shared/fixtures/email-accounts";

export async function GET() {
  return NextResponse.json(emailAccounts);
}
