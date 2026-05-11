/**
 * A program-scoped email log entry — every email "sent" through the
 * program (single, bulk to candidates, bulk to reviewers, scheduled, etc.)
 * lands here. The Emails tab on a program detail is just a filtered view
 * of these records.
 */

export type EmailSendType = "single" | "bulk";
export type EmailReceiverType = "candidates" | "reviewers";

export interface EmailDelivery {
  delivered: number;
  skipped: number;
  failed: number;
}

export interface EmailPerformance {
  /** All optional — only the fields relevant for the tracking config the
   *  sender enabled will be present. Values are 0–100 (percentages). */
  openRate?: number;
  replyRate?: number;
  clickRate?: number;
}

export interface EmailTracking {
  trackOpens: boolean;
  trackReplies: boolean;
  trackClicks: boolean;
}

export type ProgramEmailDeliveryStatus = "delivered" | "skipped" | "failed";

export interface ProgramEmailRecipient {
  id: string;
  name: string;
  email: string;
  /** "candidate" | "reviewer" — same shape, different role. */
  kind: EmailReceiverType;
  /** Per-recipient outcome — populated at send time by the validation
   *  step (Doc 04 §4.2). Falls back to `delivered` when unset. */
  deliveryStatus?: ProgramEmailDeliveryStatus;
  /** Free-text reason captured when `deliveryStatus === "skipped"` or
   *  `"failed"` — drives the Resolve Issues modal. */
  issueReason?: string;
}

export interface ProgramEmail {
  id: string;
  programId: string;
  /** "Log Send Name" from the wireframe — operator's internal label. */
  logName: string;
  subject: string;
  /** Plain text or HTML; the demo just renders pre-wrapped text. */
  body: string;
  sendType: EmailSendType;
  receiverType: EmailReceiverType;
  recipients: ProgramEmailRecipient[];
  /** Optional CC / BCC, addresses only. */
  cc?: string[];
  bcc?: string[];
  /** Sender — typically a connected mailbox from the global accounts list. */
  fromEmail: string;
  /** Stage / step the email is associated with. Empty for cross-stage
   *  bulk sends (note: per the wireframe sticky, those won't be tracked
   *  in the stage-step column). */
  stageId?: string;
  stepId?: string;
  /** Resolved labels at time of send — used for display so renames don't
   *  change history. */
  stageName?: string;
  stepName?: string;
  templateId?: string;
  /** When set, the email was scheduled rather than sent immediately. */
  scheduledForISO?: string;
  /** ISO timestamp the email entered the log. */
  sentAtISO: string;
  tracking: EmailTracking;
  delivery: EmailDelivery;
  performance: EmailPerformance;
  attachments?: { name: string; sizeKB: number }[];
}

/** Helper — total recipients targeted (delivered + skipped + failed). */
export function totalRecipients(e: ProgramEmail): number {
  return e.delivery.delivered + e.delivery.skipped + e.delivery.failed;
}

/** Convenient label like "Bulk (3)" or "Single Send". */
export function sendTypeLabel(e: ProgramEmail): string {
  if (e.sendType === "single") return "Single Send";
  const total = totalRecipients(e) || e.recipients.length;
  const noun = e.receiverType === "candidates" ? "candidates" : "reviewers";
  return `Bulk (${total} ${noun})`;
}
