/**
 * A candidate in a program's pipeline.
 *
 * `currentStageId` and `currentStepId` reference the program's workflow
 * stages/steps. The pipeline view groups candidates by stage and lets users
 * filter by stage via the chevron bar at the top.
 */

/** Candidate lifecycle (Doc 02 §2.5):
 *
 *  - `on-going`: in flight through the workflow.
 *  - `hired`: HR has extended an offer (terminal but not "Completed").
 *  - `completed`: passed the very last step of the program (terminal).
 *  - `rejected`: closed out by a reviewer (HR can Undo).
 *  - `withdrawn`: candidate or HR pulled the application — same
 *    workload effect as `rejected` (excluded from auto-assign counts).
 */
export type CandidateStatus =
  | "on-going"
  | "hired"
  | "completed"
  | "rejected"
  | "withdrawn";

export type CandidateGroupLabel = "high-priority" | "mid-priority" | "low-priority";

import type { ExclusionMarker, StatusEvent } from "@/shared/types/audit";

export interface Candidate {
  id: string;
  programId: string;
  name: string;
  email: string;
  status: CandidateStatus;
  /** Doc 10 — append-only history of every status change made on this
   *  candidate, with actor, timestamp, prev → new, and reason. */
  statusHistory?: StatusEvent<CandidateStatus>[];
  /** Soft-delete marker. When set, the candidate is hidden from
   *  active lists but still rendered in audit views. */
  excluded?: ExclusionMarker;
  /** 0-100, displayed as a coloured percent badge in the pipeline (🟢 / 🟡 / 🔴). */
  skillsMatchPercent: number;
  groupLabel?: CandidateGroupLabel;
  /** ISO date the next interview / step action is booked for. */
  bookedDateISO?: string;
  bookedTime?: string;
  /** Free-text comment shown in the Final Decisions stage's "Step Result" col. */
  stepResult?: string;
  currentStageId: string;
  currentStepId: string;
  /** IDs into shared/fixtures/reviewers — subset of the step's reviewer list. */
  reviewerIds: string[];
  /** Number of pending emails the recruiter still needs to review/send. */
  pendingEmailCount: number;
  /** Whether there's a sticky-note comment on the candidate. */
  hasNote: boolean;
  /** Free-text content of the sticky note, surfaced in a tooltip when the
   *  recruiter hovers the note icon on the candidate's row. Only set when
   *  `hasNote` is true. */
  noteContent?: string;
  /** Email replies received from the candidate in response to step
   *  emails (test invites, interview invites, etc.). Surfaced in a
   *  tooltip when hovering the email icon on the candidate's row.
   *  Mock-only — there is no real inbox plumbing behind it. */
  stepEmailReplies?: CandidateEmailReply[];
  /** ISO timestamp the candidate entered this program. Used to surface a
   *  "X new applicants" badge on the program card when this is recent. */
  addedAtISO?: string;
  /** Workflow step IDs the recruiter has already actioned for this
   *  candidate (e.g. test session created, kick-off email sent). When the
   *  candidate is later moved back into one of these steps, the
   *  step-entry notification (Test Setup Required / Pending Email) does
   *  NOT fire again — they've already been processed. */
  actionedStepIds?: string[];
}

/** Reply intent classified per Doc 04 §4.4. */
export type CandidateReplyStatus = "Accept" | "Decline" | "Reschedule";

export const CANDIDATE_REPLY_STATUSES: CandidateReplyStatus[] = [
  "Accept",
  "Decline",
  "Reschedule",
];

/** A reply the candidate sent to one of our step emails. */
export interface CandidateEmailReply {
  /** Unique id within the candidate's reply list. */
  id: string;
  /** The step in the program workflow this reply is associated with —
   *  e.g. the screening invite they're confirming, the take-home test
   *  they're asking about, etc. */
  stepId: string;
  /** Subject line, usually starting with "Re: …". */
  subject: string;
  /** Plain-text body. Kept short for the tooltip preview. */
  body: string;
  /** ISO timestamp the candidate sent the reply. */
  receivedAtISO: string;
  /** Doc 04 §4.4 — Accept / Decline / Reschedule classification. HR
   *  uses this to prioritise follow-up. */
  status?: CandidateReplyStatus;
}

/** Window in days within which a candidate is considered "new" and worth
 *  surfacing as a notification on the program card. */
export const NEW_APPLICANT_WINDOW_DAYS = 7;

export function isNewApplicant(c: Candidate, nowMs = Date.now()): boolean {
  if (!c.addedAtISO) return false;
  const t = Date.parse(c.addedAtISO);
  if (Number.isNaN(t)) return false;
  return nowMs - t < NEW_APPLICANT_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

export const CANDIDATE_STATUS_LABEL: Record<CandidateStatus, string> = {
  "on-going": "On-going",
  hired: "Hired",
  completed: "Completed",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

/** Statuses that exclude the candidate from active workload counts
 *  (Doc 02 auto-assign §2.4 + promotion §2.5). */
export const INACTIVE_CANDIDATE_STATUSES: ReadonlyArray<CandidateStatus> = [
  "rejected",
  "withdrawn",
  "completed",
];

export const GROUP_LABEL_LABEL: Record<CandidateGroupLabel, string> = {
  "high-priority": "High-priority",
  "mid-priority": "Mid-priority",
  "low-priority": "Low-priority",
};

/** Bucket the skills-match percent into a coloured tier for the badge. */
export function skillsMatchTier(p: number): "green" | "amber" | "red" {
  if (p >= 80) return "green";
  if (p >= 60) return "amber";
  return "red";
}

export function candidateInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}
