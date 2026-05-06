/**
 * Question bank — central library of assessment questions.
 * Four question types are supported, each with its own answer/template
 * payload:
 *
 *   - "essay"      : free-form long answer + grading rubric
 *   - "multiple-choice" : list of options with one or more correct
 *   - "csharp" / "javascript" : code editors + multi-tab test cases
 *   - "testing"    : essay-style answer + a checklist of "ideas" the
 *                    answer must touch (used for graders)
 *
 * Wireframe references:
 *   - /yeSL6MIFGkCgOXqHOOBC3Z/?node-id=2459-158498
 *   - tabs: General Information / Answer & Template / Test Cases
 *     (Test Cases tab is only relevant for code types)
 */

export type QuestionType =
  | "essay"
  | "multiple-choice"
  | "csharp"
  | "javascript"
  | "testing";

export const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  essay: "Essay",
  "multiple-choice": "Multiple Choice",
  csharp: "C#",
  javascript: "JavaScript",
  testing: "Testing",
};

/** True for question types that get the dedicated Test Cases tab + run-all
 *  affordance in the editor. */
export function isCodeType(t: QuestionType): boolean {
  return t === "csharp" || t === "javascript";
}

export type Difficulty = "Easy" | "Medium" | "Hard";
export const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

export type QuestionStatus = "Published" | "Unpublished" | "Draft";

/** ---------- Per-type payloads ---------- */

export interface MultipleChoiceOption {
  id: string;
  text: string;
  correct: boolean;
}

export interface MultipleChoicePayload {
  options: MultipleChoiceOption[];
  /** Allow more than one correct answer. */
  multiSelect: boolean;
}

export interface EssayPayload {
  /** Optional sample / model answer used by graders. */
  sampleAnswer?: string;
  /** Free-form rubric used by graders. */
  rubric?: string;
}

export interface TestingIdea {
  id: string;
  text: string;
}

export interface TestingPayload {
  /** Essay context — same as EssayPayload but with a required ideas
   *  checklist. */
  sampleAnswer?: string;
  rubric?: string;
  /** List of key points the answer must cover. Graders tick them off. */
  ideas: TestingIdea[];
}

export type TestCaseResult = "passed" | "failed" | "not-run";

export interface CodeTestCase {
  id: string;
  title: string;
  description?: string;
  /** Execution limit in milliseconds. */
  executionLimitMs: number;
  /** Test setup / runner code as written by the question author. */
  code: string;
  /** Last run result. */
  result: TestCaseResult;
  /** When `result === "failed"`, a short reason. */
  resultMessage?: string;
  /** When false the candidate's UI hides this case (anti-cheat). */
  visibleInTest: boolean;
}

export interface CodePayload {
  /** Author's reference solution. */
  solution: string;
  /** Starter code shown to the candidate. */
  starter: string;
  /** Multi-tab test cases. */
  testCases: CodeTestCase[];
}

/** ---------- Question record ---------- */

export interface Question {
  id: string;
  title: string;
  type: QuestionType;
  difficulty: Difficulty;
  status: QuestionStatus;
  /** Free-form tags surfaced as multi-select pills (e.g. C#, .Net, Back-end). */
  tags: string[];
  /** The prompt shown to candidates — markdown allowed. */
  questionContent: string;
  createdAtISO: string;
  updatedAtISO: string;
  /** Discriminated payload — which one is set depends on `type`. */
  multipleChoice?: MultipleChoicePayload;
  essay?: EssayPayload;
  testing?: TestingPayload;
  code?: CodePayload;
}

/* ---------- Helpers ---------- */

export function emptyMultipleChoice(): MultipleChoicePayload {
  return {
    multiSelect: false,
    options: [
      { id: opId(), text: "", correct: false },
      { id: opId(), text: "", correct: false },
      { id: opId(), text: "", correct: false },
      { id: opId(), text: "", correct: true },
    ],
  };
}

export function emptyEssay(): EssayPayload {
  return { sampleAnswer: "", rubric: "" };
}

export function emptyTesting(): TestingPayload {
  return {
    sampleAnswer: "",
    rubric: "",
    ideas: [
      { id: opId(), text: "" },
      { id: opId(), text: "" },
    ],
  };
}

export function emptyCode(language: "csharp" | "javascript"): CodePayload {
  const starterC = `using System;\n\npublic class Solution {\n    public static int Add(int a, int b) {\n        // your code here\n        return 0;\n    }\n}`;
  const starterJS = `function add(a, b) {\n  // your code here\n  return 0;\n}\n\nmodule.exports = { add };`;
  return {
    solution: language === "csharp" ? starterC : starterJS,
    starter: language === "csharp" ? starterC : starterJS,
    testCases: [emptyTestCase("Sample case 1")],
  };
}

export function emptyTestCase(title = "New test case"): CodeTestCase {
  return {
    id: tcId(),
    title,
    description: "",
    executionLimitMs: 1000,
    code: "",
    result: "not-run",
    visibleInTest: true,
  };
}

export function defaultPayloadFor(type: QuestionType): Partial<Question> {
  switch (type) {
    case "multiple-choice":
      return { multipleChoice: emptyMultipleChoice() };
    case "essay":
      return { essay: emptyEssay() };
    case "testing":
      return { testing: emptyTesting() };
    case "csharp":
      return { code: emptyCode("csharp") };
    case "javascript":
      return { code: emptyCode("javascript") };
  }
}

/* ---------- Display helpers ---------- */

export const TEST_RESULT_LABEL: Record<TestCaseResult, string> = {
  passed: "Passed",
  failed: "Failed",
  "not-run": "Not Run",
};

export function summarizeContent(q: Question, max = 140): string {
  const t = (q.questionContent || "").replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

/* ---------- ID helpers (kept short for readability in seeds) ---------- */

let __counter = 1;
function nextId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${(__counter++).toString(36)}`;
}
export function opId(): string {
  return nextId("opt");
}
export function tcId(): string {
  return nextId("tc");
}
export function ideaId(): string {
  return nextId("idea");
}
