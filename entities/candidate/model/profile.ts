/** Rich candidate profile shape used by the full Candidate Detail
 *  page (wireframe `3228:222166`). Lives separately from the pipeline
 *  `Candidate` row so the heavyweight data only loads when the detail
 *  view is opened.
 *
 *  Sections:
 *    1. General info
 *    2. Skills (bucketed by tier + missing/unselected + per-skill rating)
 *    3. Education (one entry per attended institution)
 *    4. Experiences (one entry per project / role)
 */

/** Skill tier — maps to the program's required-skill priority. */
export type CandidateSkillTier = "must-have" | "nice-to-have" | "bonus";

export const CANDIDATE_SKILL_TIER_LABEL: Record<CandidateSkillTier, string> = {
  "must-have": "Must Have",
  "nice-to-have": "Nice to Have",
  bonus: "Bonus",
};

/** A single rated skill on the candidate. Score 0 means "not yet
 *  evaluated" — surfaced as an outlined chip with a "needs eval" hint. */
export interface CandidateSkill {
  id: string;
  name: string;
  tier: CandidateSkillTier;
  /** 0-5 — 0 means unrated. Drives the per-skill star count + the
   *  Skills section's overall score gauge. */
  score: number;
}

export interface CandidateEducation {
  id: string;
  /** "School / Institution". */
  institution: string;
  /** "Bachelor", "Master", etc. — free-text in the wireframe. */
  degreeLevel?: string;
  major?: string;
  /** ISO yyyy-mm-dd. */
  startDate?: string;
  endDate?: string;
  link?: string;
  description?: string;
}

export interface CandidateExperience {
  id: string;
  projectName: string;
  company?: string;
  role?: string;
  location?: string;
  /** Headcount on the project — wireframe shows it as a number. */
  headcount?: number;
  startDate?: string;
  endDate?: string;
  link?: string;
  description?: string;
}

/** General-info section. Phone / portfolio / DOB are optional because
 *  not every candidate fills them in on the public form. */
export interface CandidateGeneralInfo {
  fullName: string;
  email: string;
  source?: string;
  dateOfBirth?: string;
  phone?: string;
  location?: string;
  portfolio?: string;
}

export interface CandidateProfileData {
  candidateId: string;
  general: CandidateGeneralInfo;
  /** Skills the candidate listed AND the program asked for — the
   *  three-tier bucket is rendered as chip groups. */
  skills: CandidateSkill[];
  /** Required skills missing from the candidate's stated stack. */
  missingSkills: { name: string; tier: CandidateSkillTier }[];
  /** Skills the candidate listed that the program didn't ask for —
   *  rendered as removable chips at the bottom. */
  unselectedSkills: string[];
  education: CandidateEducation[];
  experience: CandidateExperience[];
  /** Optional CV download / preview link. */
  cvUrl?: string;
  /** Per-step Pipeline & Review state — keyed by step.id. Only
   *  populated for steps the candidate has touched. */
  pipeline?: CandidateStepProgress[];
  /** Email conversations between HR and the candidate (or among HRs
   *  about the candidate). Surfaced on the Emails tab. */
  emailThreads?: CandidateEmailThread[];
  /** Past applications across all programs the candidate has applied
   *  to. Surfaced on the Application History tab + Comparison Hub. */
  applicationHistory?: CandidateApplicationHistory[];
}

/** Buckets a list of skills by tier — convenience for the chip group
 *  renderers. */
export function groupSkillsByTier(
  skills: CandidateSkill[]
): Record<CandidateSkillTier, CandidateSkill[]> {
  const out: Record<CandidateSkillTier, CandidateSkill[]> = {
    "must-have": [],
    "nice-to-have": [],
    bonus: [],
  };
  for (const s of skills) out[s.tier].push(s);
  return out;
}

/** Average non-zero skill score → 0-100 scale for the Skills score
 *  gauge. Returns 0 when no skills have been rated. */
export function averageSkillScore(skills: CandidateSkill[]): number {
  const rated = skills.filter((s) => s.score > 0);
  if (rated.length === 0) return 0;
  const sum = rated.reduce((acc, s) => acc + s.score, 0);
  return Math.round((sum / rated.length / 5) * 100);
}

/* ---------- Pipeline & Review (per-step reviewer feedback) ---------- */

/** Step-result enum — set by HR/Manager once enough reviews are in.
 *  Drives the candidate's promotion at the end of the step.
 *  - "Failed" → equivalent to a Reject
 *  - "Considered" → kept in pool for borderline
 *  - "Passed" → promoted to next step
 *  - "High Priority" → promoted with priority flag */
export type StepResult = "Failed" | "Considered" | "Passed" | "High Priority";

export const STEP_RESULTS: StepResult[] = [
  "Failed",
  "Considered",
  "Passed",
  "High Priority",
];

export const STEP_RESULT_TONE: Record<StepResult, string> = {
  Failed: "text-red-600",
  Considered: "text-amber-600",
  Passed: "text-emerald-600",
  "High Priority": "text-violet-600",
};

/** A single criterion score on an Interview step review. */
export interface InterviewCriterionScore {
  /** Matches the step's scorecard criterion id. */
  criterionId: string;
  name: string;
  /** 0-10 score — 0 means the reviewer skipped this criterion. */
  score: number;
  /** Per-criterion comment from the reviewer. */
  note?: string;
}

/** Reviewer verdict on an interview review. */
export type ReviewVerdict = "Pass" | "Fail" | "Consider" | "High Priority";

export const REVIEW_VERDICTS: ReviewVerdict[] = [
  "Fail",
  "Consider",
  "Pass",
  "High Priority",
];

/** A review left on a candidate at a specific step. The shape varies
 *  slightly by step type — the optional fields capture the variants:
 *  - default → just `note`
 *  - interview → `criterionScores[]`, `overallScore`, `verdict`, `note`
 *  - test → `note` + score data already lives on the linked Submission */
export interface StepReview {
  id: string;
  /** ID of the reviewer who left this review (matches REVIEWERS fixture). */
  reviewerId: string;
  /** Email of the reviewer — denormalised for display. */
  reviewerEmail: string;
  /** ISO timestamp the review was first submitted. */
  submittedAtISO: string;
  /** ISO timestamp of the most recent edit (only set if changed). */
  editedAtISO?: string;
  note: string;
  /** Interview-only — per-criterion scores. */
  criterionScores?: InterviewCriterionScore[];
  /** Interview-only — 1-10 overall grade. */
  overallScore?: number;
  /** Interview-only — Pass / Fail / Consider / High Priority verdict. */
  verdict?: ReviewVerdict;
}

/** Per-step state that lives separately from the candidate's pipeline
 *  row. Surfaced on the Pipeline & Review tab of the candidate detail
 *  page. */
export interface CandidateStepProgress {
  /** Stable key — workflow `step.id`. */
  stepId: string;
  stageId: string;
  /** Booked date for this step (e.g. interview slot, test session
   *  start). ISO date or "" when not yet booked. */
  bookedDateISO?: string;
  bookedTimeLabel?: string;
  /** Subset of the step's `reviewerIds` that are notified for this
   *  candidate — usually picked by auto-assignment but HR can override. */
  reviewerIds: string[];
  /** Whether HR ticked the "notify" toggle on the reviewer row. */
  notifyReviewers?: boolean;
  /** Reviews left so far for this candidate at this step. */
  reviews: StepReview[];
  /** HR's final verdict on the step. Drives promotion. */
  stepResult?: StepResult;
  /** AI Reviewer's-Note summary across all reviewer notes — generated
   *  by the "AI Auto-filling" button on the Pipeline & Review tab. */
  aiReviewerSummary?: string;
  /** Test step only — link to the actual Submission so the review
   *  block can pull score / breakdown / integrity data. */
  submissionId?: string;
}

/** Doc 02 §2.5 Blind-review rule. The reviewer can't see other
 *  reviews on this step until they've submitted their own (avoids
 *  anchoring bias). HR/Manager always sees everything. */
export function canViewOtherReviews(
  viewerRoleId: string,
  viewerReviewerId: string | null,
  reviews: StepReview[]
): boolean {
  if (viewerRoleId !== "role-reviewer") return true;
  if (!viewerReviewerId) return true;
  return reviews.some((r) => r.reviewerId === viewerReviewerId);
}

/* ---------- Email threads (per-candidate) ---------- */

/** Direction of a single email message — Sent (HR → candidate or
 *  another HR) or Received (candidate or external → HR). The "Sent /
 *  Inbox" toggle on the Emails tab filters threads by the direction
 *  of their newest message. */
export type EmailDirection = "sent" | "received";

export interface CandidateEmailAttachment {
  /** Display name shown in the attachment chip. */
  name: string;
  /** Pretty size string (e.g. "15 MB"). */
  size: string;
  /** Optional download URL (mock — file doesn't actually exist). */
  url?: string;
  /** File extension hint for the icon. */
  type?: "pdf" | "doc" | "img" | "other";
}

/** A single email message within a thread. */
export interface CandidateEmailMessage {
  id: string;
  /** Email address (or display name) of the sender. */
  from: string;
  /** Optional masked routing — wireframe shows "via precio-hr@…". */
  fromVia?: string;
  /** To addresses. */
  to: string[];
  /** Cc + Bcc — Bcc is rendered with a `bcc` prefix. */
  cc?: string[];
  bcc?: string[];
  /** Plain-text body (markdown allowed in the demo for line breaks). */
  body: string;
  /** ISO timestamp the message was sent / received. */
  sentAtISO: string;
  attachments?: CandidateEmailAttachment[];
  /** Marks this message as the candidate's reply or HR's outbound. */
  direction: EmailDirection;
}

/** A conversation thread on the candidate's Emails tab — wireframe
 *  `3228:225544`. Threads collapse into a single row in the list and
 *  expand to show every message in chronological order. */
export interface CandidateEmailThread {
  id: string;
  /** Subject line — shown as the row title. */
  subject: string;
  /** Optional context tag — e.g. "Technical Test", "Change Location"
   *  — surfaced as a coloured chip next to the subject. */
  contextLabel?: string;
  /** Optional link target — e.g. "/programs/.../candidates/.../pipeline"
   *  for the Technical Test thread's "open" arrow. */
  contextHref?: string;
  /** Workflow step this thread is anchored to (if any). */
  stepId?: string;
  /** Messages, ordered oldest → newest. The newest message's
   *  `direction` decides which Sent / Inbox bucket the thread falls
   *  into. */
  messages: CandidateEmailMessage[];
}

/** Buckets a thread list into Sent / Inbox by the direction of the
 *  most-recent message. */
export function bucketThreadsByDirection(
  threads: CandidateEmailThread[]
): { sent: CandidateEmailThread[]; inbox: CandidateEmailThread[] } {
  const sent: CandidateEmailThread[] = [];
  const inbox: CandidateEmailThread[] = [];
  for (const t of threads) {
    const last = t.messages[t.messages.length - 1];
    if (!last) continue;
    if (last.direction === "received") inbox.push(t);
    else sent.push(t);
  }
  return { sent, inbox };
}

/* ---------- Cross-application history (past programs) ---------- */

/** Outcome of a past application — surfaces as a coloured chip on the
 *  Application History tab. Mirrors the candidate-level lifecycle
 *  but is recorded per program so we can render Hired / Rejected /
 *  On-going / Withdrawn side-by-side. */
export type ApplicationOutcome =
  | "Hired"
  | "Rejected"
  | "On-going"
  | "Withdrawn";

export const APPLICATION_OUTCOME_TONE: Record<ApplicationOutcome, string> = {
  Hired: "bg-emerald-500 text-white",
  Rejected: "bg-red-500 text-white",
  "On-going": "bg-violet-500 text-white",
  Withdrawn: "bg-gray-400 text-white",
};

/** A single criterion / sub-rating recorded for a past application's
 *  stage. Used by the Application Comparison Hub as the chip rows
 *  inside each stage card (e.g. "React Ecosystem 6.5/10"). */
export interface ApplicationStageRating {
  name: string;
  /** Display value — "8.5/10", "74/100", "Passed", "Failed", etc. */
  value: string;
  /** Highlight tone for the chip background. */
  tone?: "good" | "ok" | "bad" | "neutral";
}

/** Per-stage feedback entry attached to an Application History
 *  record. Drives the per-stage cards in the Comparison Hub modal. */
export interface ApplicationStageFeedback {
  stageName: string;
  /** Optional headline score chip (e.g. "8.5/10"). */
  headlineScore?: string;
  /** Free-text summary surfaced under the stage name. */
  summary: string;
  /** Per-criterion chips. */
  ratings?: ApplicationStageRating[];
  /** Bottom-of-card highlighted reason — usually negative
   *  ("Failed technical criteria: …") and rendered in red. */
  failureReason?: string;
  /** Pass/Fail/Hired/Rejected outcome chip on the stage header (e.g.
   *  "Passed" on Test or HR Phone Screen). */
  outcomeChip?: string;
}

/** A single past application — used both on the Application History
 *  list and the Comparison Hub modal. */
export interface CandidateApplicationHistory {
  id: string;
  /** Display name of the program / hiring round. */
  programName: string;
  /** Job-template title and level surfaced under the program name. */
  jobTitle: string;
  jobLevel: string;
  /** ISO yyyy-mm-dd start + end dates of the application. */
  startDate: string;
  endDate?: string;
  outcome: ApplicationOutcome;
  /** Last step the candidate sat at (or "Hired" for accepted offers). */
  finalStep?: string;
  /** Free-text outcome reason — shown on the list card AND surfaced
   *  in the Comparison Hub when picked. */
  reason?: string;
  /** Optional href for the "View Application Details →" link — points
   *  at the program / candidate detail in that program's context. */
  detailsHref?: string;
  /** Per-stage feedback entries — drives the stacked cards inside
   *  the Comparison Hub for this application. */
  stageFeedback?: ApplicationStageFeedback[];
  /** AI-written context paragraph shown above the comparison columns
   *  in the Comparison Hub (e.g. "In 2024, candidate applied for…"). */
  aiInsight?: string;
}
