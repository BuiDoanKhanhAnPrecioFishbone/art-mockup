import { NextResponse } from "next/server";
import { emailLogs, emailLogRecipients } from "@/shared/fixtures/email-logs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const log = emailLogs.find((l) => l.id === id);
  if (!log) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const recipients = emailLogRecipients.filter((r) => r.logId === id);
  return NextResponse.json({ ...log, recipients });
}
