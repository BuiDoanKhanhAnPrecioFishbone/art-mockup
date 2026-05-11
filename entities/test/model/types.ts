/**
 * Test bank — reusable assessments composed of questions from the
 * Question library. A test is defined once, then exposed to candidates
 * via a TestSession (Public link / Embedded). Submissions are recorded
 * per candidate.
 *
 * Wireframe ref:
 *   /yeSL6MIFGkCgOXqHOOBC3Z/?node-id=2492-89740
 */

import type { QuestionType, Difficulty } from "@/entities/question";

export type TestType = "Assesment" | "Recruitment";
export type TestStatus = "Draft" | "Published" | "Archived";

export const TEST_TYPES: TestType[] = ["Assesment", "Recruitment"];
export const TEST_STATUSES: TestStatus[] = ["Draft", "Published", "Archived"];

/** A static composition row references a specific question id. */
export interface StaticQuestionRef {
  questionId: string;
  /** Per-test order; sorted ascending in the editor. */
  order: number;
}

/** A dynamic-pool condition: "pull N questions matching these filters
 *  on each session render". The pool the filters run against is the
 *  test's `staticQuestions` list — i.e. dynamic mode now requires the
 *  HR to curate a pool first, then add conditions that filter it.
 *  This keeps tests reproducible (no surprise questions from the
 *  full library) while still letting one test produce many shapes. */
export interface DynamicCondition {
  id: string;
  type?: QuestionType;
  difficulty?: Difficulty;
  /** Free-form tag filter — questions must include at least one tag
   *  from this list (OR semantics). Empty = no tag constraint. */
  tags: string[];
  /** Category filter — questions whose `categoryId` is in this list
   *  pass. Empty = no category constraint. Same OR semantics as tags. */
  categoryIds?: string[];
  /** Quantity to draw. The "Y" of "X / Y" in the wireframe = how many
   *  questions in the bank match this condition right now. */
  quantity: number;
  order: number;
}

export type CompositionMode = "static" | "dynamic";

export interface Test {
  id: string;
  title: string;
  type: TestType;
  status: TestStatus;
  /** Duration in minutes. */
  durationMinutes: number;
  tags: string[];
  description: string;
  /** Pass ratio percent — 0–100. */
  passRatioPercent: number;
  canSkipQuestion: boolean;
  /** Question selection mode. Mutually exclusive — switching wipes the
   *  other mode's payload to avoid stale data. */
  compositionMode: CompositionMode;
  staticQuestions: StaticQuestionRef[];
  dynamicConditions: DynamicCondition[];
  /** Shuffle the rendered question order per submission. */
  shuffleQuestions: boolean;
  createdAtISO: string;
  updatedAtISO: string;
}

/* ---------- Sessions + Submissions ---------- */

export type SessionType = "Public" | "Private" | "Private Onsite";

/** Session lifecycle per Doc 07.
 *
 *  Forward-only transitions:
 *    Upcoming → Active | Cancelled
 *    Active   → Closing (Onsite only) | Completed | Cancelled
 *    Closing  → Completed (Onsite only)
 *    Completed / Cancelled are terminal.
 *
 *  See `canTransitionSession()` for the full matrix. */
export type SessionStatus =
  | "Upcoming"
  | "Active"
  | "Closing"
  | "Completed"
  | "Cancelled";

export const SESSION_TYPES: SessionType[] = [
  "Public",
  "Private",
  "Private Onsite",
];
export const SESSION_STATUSES: SessionStatus[] = [
  "Upcoming",
  "Active",
  "Closing",
  "Completed",
  "Cancelled",
];

export interface TestSession {
  id: string;
  testId: string;
  /** Display name — e.g. "Data Scientist Intern – Recruitment Assessment". */
  name: string;
  type: SessionType;
  status: SessionStatus;
  /** Short share code: 9876xy. */
  accessCode: string;
  /** Free-form description shown to the candidate on the access page. */
  description?: string;
  /** Auto-rotate the access code every N minutes (anti-cheat). 0 = never. */
  refreshAccessCodeMinutes: number;
  /** ISO timestamps for the scheduled session window. */
  startISO: string;
  endISO: string;
  /** Real cutover timestamp — captured when the session actually
   *  Completes / Cancels, in case it diverged from `endISO` (e.g. HR
   *  extended for a slow Onsite cohort). */
  actualEndISO?: string;
  /** Required when transitioning into Cancelled. Free-text reason. */
  cancelReason?: string;
}

/** Returns true if a manual transition from `from` → `to` is allowed
 *  for a session of the given type. Driven by the spec's status
 *  transition table (Doc 07 §7.3). */
export function canTransitionSession(
  type: SessionType,
  from: SessionStatus,
  to: SessionStatus
): boolean {
  if (from === to) return false;
  if (from === "Completed" || from === "Cancelled") return false;
  if (from === "Upcoming") {
    return to === "Active" || to === "Cancelled";
  }
  if (from === "Active") {
    if (to === "Cancelled") return true;
    if (to === "Closing") return type === "Private Onsite";
    if (to === "Completed") return true;
    return false;
  }
  if (from === "Closing") {
    return to === "Completed" && type === "Private Onsite";
  }
  return false;
}

/** Convenience: list every status the session can move into next. */
export function nextSessionStatuses(
  type: SessionType,
  from: SessionStatus
): SessionStatus[] {
  return SESSION_STATUSES.filter((s) => canTransitionSession(type, from, s));
}

export type SubmissionStatus =
  | "in-progress"
  | "submitted"
  | "graded"
  | "abandoned";

/** Spec-mandated integrity events (Doc 07 §7.7). The system records
 *  raw event metadata too in production; here we only keep counters
 *  for the demo. */
export interface SubmissionIntegrity {
  leavingTabCount: number;
  copyPasteCount: number;
  devtoolsOpenCount: number;
  multiInstanceCount: number;
  multiMonitorFlag: boolean;
}

export type SubmissionFinalReview =
  | "Passed"
  | "Failed"
  | "Under Review"
  | "Pending";

/** Per-skill breakdown shown on the Submission Detail "Skill
 *  Performance" panel (Doc 09 §9.5). */
export interface SubmissionSkillScore {
  skill: string;
  percent: number;
}

/** Per-question result row shown in the Submission Detail table. */
export interface SubmissionQuestionResult {
  questionId: string;
  title: string;
  type: string;
  difficulty: string;
  tags: string[];
  scored: number;
  max: number;
}

export interface Submission {
  id: string;
  sessionId: string;
  candidateId?: string;
  candidateName: string;
  candidateEmail: string;
  status: SubmissionStatus;
  /** 0–100 final score. */
  scorePercent?: number;
  startedAtISO: string;
  submittedAtISO?: string;
  /** Per-question answers — a free-form map for the demo. */
  answers?: Record<string, string>;
  /** Set when the system closed this submission (session ended, HR
   *  force-closed Onsite, etc.) rather than the candidate clicking
   *  Finish. Doc 10. */
  forceSubmitted?: boolean;
  /** Optional reason — used when a candidate is excluded mid-session
   *  (`status === "abandoned"`). */
  excludeReason?: string;
  /** Per-event integrity counters; missing means no events recorded. */
  integrity?: SubmissionIntegrity;
  /** HR / Reviewer's verdict on the candidate's submission (after
   *  considering score + integrity + scorecard). */
  finalReview?: SubmissionFinalReview;
  /** Per-skill score breakdown. */
  skillBreakdown?: SubmissionSkillScore[];
  /** Per-question result rows. */
  questionResults?: SubmissionQuestionResult[];
  /** AI-generated reviewer notes shown in the AI Review panel. */
  aiReviewerNotes?: string;
}

/** Returns "Cheating" if any integrity counter exceeds its threshold,
 *  else "Undetected". Spec wants a single status surfaced in the
 *  Submission List. */
export function deriveIntegrityStatus(
  integrity?: SubmissionIntegrity
): "Undetected" | "Cheating" {
  if (!integrity) return "Undetected";
  if (
    integrity.leavingTabCount >= 3 ||
    integrity.copyPasteCount >= 5 ||
    integrity.devtoolsOpenCount >= 1 ||
    integrity.multiInstanceCount >= 1 ||
    integrity.multiMonitorFlag
  ) {
    return "Cheating";
  }
  return "Undetected";
}

/* ---------- Helpers ---------- */

export const TEST_STATUS_TONE: Record<TestStatus, string> = {
  Draft: "bg-amber-100 text-amber-700",
  Published: "bg-green-100 text-green-700",
  Archived: "bg-gray-200 text-gray-600",
};

export const SESSION_STATUS_TONE: Record<SessionStatus, string> = {
  Upcoming: "bg-amber-100 text-amber-700",
  Active: "bg-green-100 text-green-700",
  Closing: "bg-sky-100 text-sky-700",
  Completed: "bg-gray-200 text-gray-700",
  Cancelled: "bg-red-100 text-red-700",
};

/** Split an ISO timestamp into a yyyy-mm-dd string + a HH:mm 24h string. */
export function splitISODate(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: "", time: "" };
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${mi}` };
}

/** Combine a yyyy-mm-dd + HH:mm pair back into an ISO string. */
export function joinDateTime(date: string, time: string): string {
  const safeDate = date || new Date().toISOString().slice(0, 10);
  const safeTime = time || "00:00";
  return new Date(`${safeDate}T${safeTime}:00`).toISOString();
}

export function newCondition(): DynamicCondition {
  return {
    id: `dc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    tags: [],
    quantity: 1,
    order: 0,
  };
}

export function newStaticRef(questionId: string, order: number): StaticQuestionRef {
  return { questionId, order };
}
