export type EmailProvider = "gmail" | "outlook";
export type AccountStatus = "connected" | "not_connected" | "expired";
export type LogStatus = "completed" | "in_progress" | "failed";
export type RecipientStatus = "delivered" | "failed" | "skipped";
export type TemplateStatus = "active" | "draft";

export interface EmailAccount {
  id: string;
  email: string;
  provider: EmailProvider;
  status: AccountStatus;
  connectedAt?: string;
}

export interface TemplateVariable {
  key: string;
  label: string;
  example: string;
  category: "candidate" | "job" | "interview" | "company" | "sender";
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  status: TemplateStatus;
  usedInWorkflow?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailLog {
  id: string;
  name: string;
  templateName: string;
  sentAt: string;
  sentBy: string;
  total: number;
  delivered: number;
  failed: number;
  skipped: number;
  status: LogStatus;
  // Extended fields
  jobName?: string;
  sender?: string;
  sendType?: "bulk" | "single";
  openRate?: number;
  clickRate?: number;
  replyRate?: number;
  subject?: string;
  cc?: string;
  emailBody?: string;
  aiInsight?: string;
}

export interface EmailLogRecipient {
  id: string;
  logId: string;
  candidateName: string;
  email: string;
  jobTitle: string;
  status: RecipientStatus;
  failureReason?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  missingVars?: Array<{ key: string; label: string; value?: string }>;
}
