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
 *  on each session render". */
export interface DynamicCondition {
  id: string;
  type?: QuestionType;
  difficulty?: Difficulty;
  tags: string[];
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

export type SessionType = "Public" | "Private";
export type SessionStatus = "Active" | "Inactive" | "Closed";

export interface TestSession {
  id: string;
  testId: string;
  /** Display name — e.g. "Data Scientist Intern – Recruitment Assessment". */
  name: string;
  type: SessionType;
  status: SessionStatus;
  /** Short share code: 9876xy. */
  accessCode: string;
  /** ISO timestamps for the session window. */
  startISO: string;
  endISO: string;
}

export type SubmissionStatus =
  | "in-progress"
  | "submitted"
  | "graded"
  | "abandoned";

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
}

/* ---------- Helpers ---------- */

export const TEST_STATUS_TONE: Record<TestStatus, string> = {
  Draft: "bg-amber-100 text-amber-700",
  Published: "bg-green-100 text-green-700",
  Archived: "bg-gray-200 text-gray-600",
};

export const SESSION_STATUS_TONE: Record<SessionStatus, string> = {
  Active: "bg-green-100 text-green-700",
  Inactive: "bg-gray-100 text-gray-600",
  Closed: "bg-red-100 text-red-700",
};

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
