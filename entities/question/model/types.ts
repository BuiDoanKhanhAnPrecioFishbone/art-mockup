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
  /** Categorisation key — picked from a fixed catalog (see
   *  `QUESTION_CATEGORIES`). Drives the dynamic-condition category
   *  filter on the Test composition page. Optional for legacy
   *  questions; new questions surface a Category select in the
   *  editor. */
  categoryId?: QuestionCategoryId;
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

/* ---------- Category catalog ---------- */

/** Stable id per category. Stored on Question.categoryId; the
 *  display label comes from `QUESTION_CATEGORIES`. New categories
 *  go here so the catalog stays a single source of truth. */
export type QuestionCategoryId =
  | "csharp"
  | "dotnet"
  | "aspnet"
  | "javascript"
  | "typescript"
  | "react"
  | "vue"
  | "angular"
  | "nodejs"
  | "html-css"
  | "tailwind"
  | "python"
  | "django"
  | "flask"
  | "java"
  | "spring"
  | "kotlin"
  | "go"
  | "rust"
  | "ruby"
  | "rails"
  | "php"
  | "laravel"
  | "swift"
  | "ios"
  | "android"
  | "flutter"
  | "react-native"
  | "sql"
  | "postgresql"
  | "mysql"
  | "mongodb"
  | "redis"
  | "elasticsearch"
  | "graphql"
  | "rest-api"
  | "docker"
  | "kubernetes"
  | "aws"
  | "azure"
  | "gcp"
  | "linux"
  | "git"
  | "ci-cd"
  | "system-design"
  | "data-structures"
  | "algorithms"
  | "design-patterns"
  | "security"
  | "testing"
  | "performance"
  | "ux-design"
  | "ui-design"
  | "marketing"
  | "seo"
  | "copywriting"
  | "product-management"
  | "qa-testing"
  | "data-analysis"
  | "machine-learning"
  | "general-knowledge"
  | "logic-aptitude"
  | "communication"
  | "soft-skills";

export interface QuestionCategory {
  id: QuestionCategoryId;
  label: string;
  /** Coarse grouping — used to render the catalog in groups inside
   *  the form select. */
  group:
    | "Languages"
    | "Frontend"
    | "Backend"
    | "Mobile"
    | "Database"
    | "DevOps & Cloud"
    | "Engineering Foundations"
    | "Design"
    | "Product & Marketing"
    | "Quality"
    | "Data & AI"
    | "General";
}

/** Fixed catalog. Order is significant — drives the order in the
 *  Form select and the dynamic-condition Category filter. */
export const QUESTION_CATEGORIES: QuestionCategory[] = [
  // Languages
  { id: "csharp", label: "C#", group: "Languages" },
  { id: "javascript", label: "JavaScript", group: "Languages" },
  { id: "typescript", label: "TypeScript", group: "Languages" },
  { id: "python", label: "Python", group: "Languages" },
  { id: "java", label: "Java", group: "Languages" },
  { id: "kotlin", label: "Kotlin", group: "Languages" },
  { id: "go", label: "Go", group: "Languages" },
  { id: "rust", label: "Rust", group: "Languages" },
  { id: "ruby", label: "Ruby", group: "Languages" },
  { id: "php", label: "PHP", group: "Languages" },
  { id: "swift", label: "Swift", group: "Languages" },
  // Frontend
  { id: "react", label: "React", group: "Frontend" },
  { id: "vue", label: "Vue", group: "Frontend" },
  { id: "angular", label: "Angular", group: "Frontend" },
  { id: "html-css", label: "HTML & CSS", group: "Frontend" },
  { id: "tailwind", label: "Tailwind CSS", group: "Frontend" },
  // Backend
  { id: "dotnet", label: ".NET", group: "Backend" },
  { id: "aspnet", label: "ASP.NET", group: "Backend" },
  { id: "nodejs", label: "Node.js", group: "Backend" },
  { id: "django", label: "Django", group: "Backend" },
  { id: "flask", label: "Flask", group: "Backend" },
  { id: "spring", label: "Spring", group: "Backend" },
  { id: "rails", label: "Ruby on Rails", group: "Backend" },
  { id: "laravel", label: "Laravel", group: "Backend" },
  { id: "rest-api", label: "REST APIs", group: "Backend" },
  { id: "graphql", label: "GraphQL", group: "Backend" },
  // Mobile
  { id: "ios", label: "iOS", group: "Mobile" },
  { id: "android", label: "Android", group: "Mobile" },
  { id: "flutter", label: "Flutter", group: "Mobile" },
  { id: "react-native", label: "React Native", group: "Mobile" },
  // Database
  { id: "sql", label: "SQL (general)", group: "Database" },
  { id: "postgresql", label: "PostgreSQL", group: "Database" },
  { id: "mysql", label: "MySQL", group: "Database" },
  { id: "mongodb", label: "MongoDB", group: "Database" },
  { id: "redis", label: "Redis", group: "Database" },
  { id: "elasticsearch", label: "Elasticsearch", group: "Database" },
  // DevOps & Cloud
  { id: "docker", label: "Docker", group: "DevOps & Cloud" },
  { id: "kubernetes", label: "Kubernetes", group: "DevOps & Cloud" },
  { id: "aws", label: "AWS", group: "DevOps & Cloud" },
  { id: "azure", label: "Azure", group: "DevOps & Cloud" },
  { id: "gcp", label: "Google Cloud", group: "DevOps & Cloud" },
  { id: "linux", label: "Linux", group: "DevOps & Cloud" },
  { id: "git", label: "Git", group: "DevOps & Cloud" },
  { id: "ci-cd", label: "CI / CD", group: "DevOps & Cloud" },
  // Engineering foundations
  { id: "system-design", label: "System Design", group: "Engineering Foundations" },
  { id: "data-structures", label: "Data Structures", group: "Engineering Foundations" },
  { id: "algorithms", label: "Algorithms", group: "Engineering Foundations" },
  { id: "design-patterns", label: "Design Patterns", group: "Engineering Foundations" },
  { id: "security", label: "Security", group: "Engineering Foundations" },
  { id: "testing", label: "Testing", group: "Engineering Foundations" },
  { id: "performance", label: "Performance", group: "Engineering Foundations" },
  // Quality
  { id: "qa-testing", label: "QA / Manual Testing", group: "Quality" },
  // Design
  { id: "ux-design", label: "UX Design", group: "Design" },
  { id: "ui-design", label: "UI Design", group: "Design" },
  // Product & Marketing
  { id: "product-management", label: "Product Management", group: "Product & Marketing" },
  { id: "marketing", label: "Marketing", group: "Product & Marketing" },
  { id: "seo", label: "SEO", group: "Product & Marketing" },
  { id: "copywriting", label: "Copywriting", group: "Product & Marketing" },
  // Data & AI
  { id: "data-analysis", label: "Data Analysis", group: "Data & AI" },
  { id: "machine-learning", label: "Machine Learning", group: "Data & AI" },
  // General
  { id: "general-knowledge", label: "General Knowledge", group: "General" },
  { id: "logic-aptitude", label: "Logic / Aptitude", group: "General" },
  { id: "communication", label: "Communication", group: "General" },
  { id: "soft-skills", label: "Soft Skills", group: "General" },
];

/** O(1) lookup — id → label. Returns the raw id when unknown so the
 *  UI never blanks out on a stale value. */
const CATEGORY_BY_ID: Record<string, QuestionCategory> = Object.fromEntries(
  QUESTION_CATEGORIES.map((c) => [c.id, c])
);

export function categoryLabel(id?: string): string {
  if (!id) return "—";
  return CATEGORY_BY_ID[id]?.label ?? id;
}

/** Group catalog entries for a `<select><optgroup>` render. */
export function groupedCategories(): {
  group: QuestionCategory["group"];
  items: QuestionCategory[];
}[] {
  const order: QuestionCategory["group"][] = [
    "Languages",
    "Frontend",
    "Backend",
    "Mobile",
    "Database",
    "DevOps & Cloud",
    "Engineering Foundations",
    "Quality",
    "Design",
    "Product & Marketing",
    "Data & AI",
    "General",
  ];
  return order.map((g) => ({
    group: g,
    items: QUESTION_CATEGORIES.filter((c) => c.group === g),
  }));
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
