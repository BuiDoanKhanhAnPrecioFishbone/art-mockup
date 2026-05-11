import { emailLogs, emailLogRecipients } from "@/shared/fixtures/email-logs";
import { notFound } from "next/navigation";
import Link from "next/link";
import LogDetailClient from "./_components/LogDetailClient";
import { getProgramEmail } from "@/entities/program-email/api/fixtures";
import type { EmailLog, EmailLogRecipient } from "@/shared/types/email";
import type { ProgramEmail } from "@/entities/program-email";

/** Adapt a ProgramEmail (the per-program log entry produced by the
 *  Emails tab on a program detail) into the EmailLog +
 *  EmailLogRecipient[] shape that LogDetailClient expects. Lets the
 *  same detail page render both global Email Management logs and
 *  program-scoped entries without forking the UI. */
/** Pull every `{VariableName}` placeholder from the subject + body so
 *  skipped recipients can surface them as missing-data rows in the
 *  Resolve Issues modal. Lower-cases the spaced label for readability
 *  ("InterviewDate" → "Interview date"). De-duped, order preserved. */
function extractTemplateVars(text: string): { key: string; label: string }[] {
  const seen = new Set<string>();
  const result: { key: string; label: string }[] = [];
  const re = /\{[A-Za-z_][A-Za-z0-9_]*\}/g;
  for (const m of text.matchAll(re)) {
    const key = m[0];
    if (seen.has(key)) continue;
    seen.add(key);
    const inner = key.slice(1, -1);
    const label = inner
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .trim()
      .replace(/^./, (c) => c.toUpperCase());
    result.push({ key, label });
  }
  return result;
}

function adaptProgramEmail(p: ProgramEmail): {
  log: EmailLog;
  recipients: EmailLogRecipient[];
} {
  const total =
    p.delivery.delivered + p.delivery.skipped + p.delivery.failed ||
    p.recipients.length;
  const log: EmailLog = {
    id: p.id,
    name: p.logName,
    templateName: p.templateId ?? "",
    sentAt: p.sentAtISO,
    sentBy: p.fromEmail,
    sender: p.fromEmail,
    jobName: p.stageName ?? "",
    sendType: p.sendType,
    total,
    delivered: p.delivery.delivered,
    skipped: p.delivery.skipped,
    failed: p.delivery.failed,
    status: "completed",
    openRate: p.performance.openRate,
    clickRate: p.performance.clickRate,
    replyRate: p.performance.replyRate,
    subject: p.subject,
    cc: p.cc?.join(", ") ?? "",
    emailBody: p.body,
  };
  // Variables referenced by the template — used to populate the
  // skipped recipients' missingVars list so Resolve Issues has rows.
  // For the demo, we treat every template variable as "missing" on
  // skipped recipients; the recruiter fills them in and clicks
  // Save & Resend.
  const allVars = extractTemplateVars(`${p.subject}\n${p.body}`);
  // Per-recipient status comes from the source recipient's
  // `deliveryStatus + issueReason` when present (Doc 04 §4.2). We fall
  // back to bucketing by aggregate counts only for legacy seeded rows
  // that pre-date that field.
  const recipients: EmailLogRecipient[] = p.recipients.map((r, idx) => {
    const status: EmailLogRecipient["status"] =
      r.deliveryStatus ??
      (idx < p.delivery.delivered
        ? "delivered"
        : idx < p.delivery.delivered + p.delivery.skipped
          ? "skipped"
          : "failed");
    const base: EmailLogRecipient = {
      id: `${p.id}-r${idx}`,
      logId: p.id,
      candidateName: r.name,
      email: r.email,
      jobTitle: p.stepName ?? "",
      status,
    };
    if (status === "skipped") {
      // Prefer the real send-time reason; fall back to "fill missing
      // template vars" when none was captured.
      if (r.issueReason) {
        base.missingVars = allVars.map((v) => ({ ...v }));
      } else if (allVars.length > 0) {
        base.missingVars = allVars.map((v) => ({ ...v }));
      }
    }
    if (status === "failed") {
      base.failureReason =
        r.issueReason ?? "Mailbox bounced — address could not be reached.";
    }
    return base;
  });
  // If the program email reports skipped > 0 but no recipients fall in
  // that bucket (because we couldn't compute it from delivery counts),
  // synthesise placeholder rows so the Resolve Issues flow has data
  // to work with — keeps the demo consistent.
  if (
    p.delivery.skipped > 0 &&
    recipients.every((r) => r.status !== "skipped") &&
    allVars.length > 0
  ) {
    for (let i = 0; i < p.delivery.skipped; i++) {
      recipients.push({
        id: `${p.id}-skipped-${i}`,
        logId: p.id,
        candidateName: `Pending Candidate ${i + 1}`,
        email: `pending-${i + 1}@example.com`,
        jobTitle: p.stepName ?? "",
        status: "skipped",
        missingVars: allVars.map((v) => ({ ...v })),
      });
    }
  }
  return { log, recipients };
}

export default async function LogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let log = emailLogs.find((l) => l.id === id);
  let recipients = emailLogRecipients.filter((r) => r.logId === id);
  // Fall back to program-scoped emails so the same detail route works
  // when "View" is clicked on a row inside a program's Emails tab.
  if (!log) {
    const programEmail = getProgramEmail(id);
    if (programEmail) {
      const adapted = adaptProgramEmail(programEmail);
      log = adapted.log;
      recipients = adapted.recipients;
    }
  }
  if (!log) notFound();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <header className="border-b border-gray-200 bg-white px-8 py-4 shrink-0">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1 flex-wrap">
          <Link href="/templates/email" className="hover:text-gray-600 transition-colors">Email Management</Link>
          <span>/</span>
          <Link href="/templates/email?tab=logs" className="hover:text-gray-600 transition-colors">Logs</Link>
          <span>/</span>
          <span className="text-gray-600 max-w-xs truncate">{log.name}</span>
        </div>
        <h1 className="text-base font-semibold text-gray-900 line-clamp-1">{log.name}</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Sent by {log.sentBy} on{" "}
          {new Date(log.sentAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
          {log.templateName ? ` · Template: ${log.templateName}` : ""}
        </p>
      </header>

      <LogDetailClient log={log} recipients={recipients} />
    </div>
  );
}
