export type CandidateStage =
  | "Applied"
  | "Screening"
  | "Interview"
  | "Assessment"
  | "Offer"
  | "Hired"
  | "Rejected";

export type CandidateIssue = "missing_email" | "invalid_email" | "unsubscribed" | "none";

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  stage: CandidateStage;
  appliedAt: string;
  avatarInitials: string;
  issue: CandidateIssue;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export interface RecentMessage {
  id: string;
  subject: string;
  sentAt: string;
  recipientCount: number;
}

export type TrackingOption = "opens" | "clicks" | "replies";

export interface BulkSendSettings {
  from: string;
  trackOpens: boolean;
  trackClicks: boolean;
  trackReplies: boolean;
  scheduleSend: boolean;
  scheduleDate: string;
  scheduleTime: string;
}

export interface BulkSendForm {
  name: string;
  templateId: string | null;
  subject: string;
  body: string;
  settings: BulkSendSettings;
  selectedCandidateIds: string[];
}

export interface BulkSendResult {
  id: string;
  name: string;
  sentAt: string;
  totalSent: number;
  totalIssues: number;
}
