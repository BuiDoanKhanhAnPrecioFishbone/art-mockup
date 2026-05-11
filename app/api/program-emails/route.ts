import { NextResponse } from "next/server";
import {
  addProgramEmail,
  listProgramEmails,
} from "@/entities/program-email/api/fixtures";
import type {
  ProgramEmail,
  ProgramEmailRecipient,
} from "@/entities/program-email";
import { listCandidates } from "@/entities/candidate/api/fixtures";
import { INACTIVE_CANDIDATE_STATUSES } from "@/entities/candidate";

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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Materialise per-recipient `deliveryStatus + issueReason` so the
 *  log surfaces real Skipped records instead of synthesising them at
 *  view time. Doc 04 §4.2 + Gap 8 from the audit.
 *
 *  Rules per recipient:
 *  - Missing or invalid email address → Skipped, "Missing email address."
 *  - Candidate-kind recipient who is Rejected / Withdrawn / Completed →
 *    Skipped, "Candidate is no longer active." Reviewer-kind doesn't
 *    have a candidate status, so it isn't checked.
 *  - Otherwise Delivered.
 */
function classifyRecipients(
  recipients: ProgramEmailRecipient[],
  programId: string
): ProgramEmailRecipient[] {
  const candidatesById = new Map(
    listCandidates(programId).map((c) => [c.id, c])
  );
  return recipients.map((r) => {
    if (!r.email || !EMAIL_RE.test(r.email)) {
      return {
        ...r,
        deliveryStatus: "skipped",
        issueReason: "Missing or invalid email address.",
      };
    }
    if (r.kind === "candidates") {
      const candidate = candidatesById.get(r.id);
      if (
        candidate &&
        INACTIVE_CANDIDATE_STATUSES.includes(candidate.status)
      ) {
        return {
          ...r,
          deliveryStatus: "skipped",
          issueReason: `Candidate is ${candidate.status} — emails should only go to active candidates.`,
        };
      }
    }
    return { ...r, deliveryStatus: "delivered" };
  });
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
  const recipients = classifyRecipients(body.recipients, body.programId);
  const recipientCount = recipients.length;
  const sendType = body.sendType ?? (recipientCount > 1 ? "bulk" : "single");
  const skipped = recipients.filter(
    (r) => r.deliveryStatus === "skipped"
  ).length;
  // Mock failure rate on the surviving deliveries (network bounces).
  const live = recipientCount - skipped;
  const failed = live > 20 ? Math.max(1, Math.floor(live * 0.02)) : 0;
  // Mark `failed` random survivors so per-recipient counts agree.
  const survivors = recipients.filter(
    (r) => r.deliveryStatus !== "skipped"
  );
  for (let i = 0; i < failed && i < survivors.length; i++) {
    survivors[i].deliveryStatus = "failed";
    survivors[i].issueReason =
      "Mailbox bounced — address could not be reached.";
  }
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
    recipients,
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
