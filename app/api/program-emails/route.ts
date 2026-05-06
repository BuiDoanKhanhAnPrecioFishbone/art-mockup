import { NextResponse } from "next/server";
import {
  addProgramEmail,
  listProgramEmails,
} from "@/entities/program-email/api/fixtures";
import type { ProgramEmail } from "@/entities/program-email";

export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const programId = searchParams.get("programId");
  if (!programId) {
    return NextResponse.json(
      { error: "programId query param is required" },
      { status: 400 }
    );
  }
  return NextResponse.json({ emails: listProgramEmails(programId) });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<ProgramEmail>;
  if (
    !body.programId ||
    !body.subject?.trim() ||
    !body.fromEmail ||
    !body.recipients ||
    body.recipients.length === 0
  ) {
    return NextResponse.json(
      {
        error:
          "programId, subject, fromEmail and at least one recipient are required.",
      },
      { status: 400 }
    );
  }
  const id = `pem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const recipientCount = body.recipients.length;
  const sendType = body.sendType ?? (recipientCount > 1 ? "bulk" : "single");
  // Mock delivery numbers for the demo — most go through, a couple skip.
  const skipped = recipientCount > 5 ? Math.max(1, Math.floor(recipientCount * 0.04)) : 0;
  const failed = recipientCount > 20 ? Math.max(1, Math.floor(recipientCount * 0.02)) : 0;
  const delivered = recipientCount - skipped - failed;
  const tracking = body.tracking ?? {
    trackOpens: true,
    trackReplies: false,
    trackClicks: false,
  };

  const email: ProgramEmail = {
    id,
    programId: body.programId,
    logName: body.logName?.trim() || body.subject.trim(),
    subject: body.subject.trim(),
    body: body.body ?? "",
    sendType,
    receiverType: body.receiverType ?? "candidates",
    recipients: body.recipients,
    cc: body.cc,
    bcc: body.bcc,
    fromEmail: body.fromEmail,
    stageId: body.stageId,
    stepId: body.stepId,
    stageName: body.stageName,
    stepName: body.stepName,
    templateId: body.templateId,
    scheduledForISO: body.scheduledForISO,
    sentAtISO: body.scheduledForISO ?? new Date().toISOString(),
    tracking,
    delivery: { delivered, skipped, failed },
    performance: {
      ...(tracking.trackOpens ? { openRate: 0 } : {}),
      ...(tracking.trackReplies ? { replyRate: 0 } : {}),
      ...(tracking.trackClicks ? { clickRate: 0 } : {}),
    },
    attachments: body.attachments,
  };
  addProgramEmail(email);
  return NextResponse.json({ email }, { status: 201 });
}
