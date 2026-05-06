/**
 * A candidate in a program's pipeline.
 *
 * `currentStageId` and `currentStepId` reference the program's workflow
 * stages/steps. The pipeline view groups candidates by stage and lets users
 * filter by stage via the chevron bar at the top.
 */

export type CandidateStatus = "on-going" | "hired" | "rejected";

export type CandidateGroupLabel = "high-priority" | "mid-priority" | "low-priority";

export interface Candidate {
  id: string;
  programId: string;
  name: string;
  email: string;
  status: CandidateStatus;
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
}

export const CANDIDATE_STATUS_LABEL: Record<CandidateStatus, string> = {
  "on-going": "On-going",
  hired: "Hired",
  rejected: "Rejected",
};

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
