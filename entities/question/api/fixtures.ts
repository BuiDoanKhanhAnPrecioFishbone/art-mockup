import type { Question } from "../model/types";

/**
 * Seed questions covering all four question types so the demo shows
 * realistic content across the editor variants. Backed by globalThis to
 * survive Next.js per-route bundling.
 */

const NOW = Date.now();
const DAY = 24 * 60 * 60 * 1000;

const SEED: Question[] = [
  {
    id: "q-clean-code",
    title: "What are the best practices for writing clean code?",
    type: "essay",
    difficulty: "Easy",
    status: "Published",
    categoryId: "javascript",
    tags: ["JavaScript", "Algorithms", "Frontend"],
    questionContent:
      "Describe the principles you follow to keep a JavaScript codebase clean. Cover naming, function size, separation of concerns, and review etiquette.",
    createdAtISO: new Date(NOW - 3 * DAY).toISOString(),
    updatedAtISO: new Date(NOW - 3 * DAY).toISOString(),
    essay: {
      sampleAnswer:
        "A great answer mentions DRY, single-responsibility functions, descriptive naming over comments, and small, testable units.",
      rubric:
        "Award up to 4 points: 1 for naming, 1 for function size, 1 for separation of concerns, 1 for review etiquette.",
    },
  },
  {
    id: "q-validate-string",
    title: "Validate a String with Regular Expressions",
    type: "javascript",
    difficulty: "Easy",
    status: "Published",
    categoryId: "javascript",
    tags: ["JavaScript", "Algorithms", "Frontend"],
    questionContent:
      "Write a function `isValidEmail(input: string): boolean` that returns `true` if the input is a valid email address using regular expressions only.",
    createdAtISO: new Date(NOW - 5 * DAY).toISOString(),
    updatedAtISO: new Date(NOW - 1 * DAY).toISOString(),
    code: {
      starter:
        "function isValidEmail(input) {\n  // your regex here\n  return false;\n}\n\nmodule.exports = { isValidEmail };",
      solution:
        "function isValidEmail(input) {\n  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(input);\n}\n\nmodule.exports = { isValidEmail };",
      testCases: [
        {
          id: "tc-valid",
          title: "Valid Email",
          description: "Returns true for a standard address.",
          executionLimitMs: 500,
          code: "const { isValidEmail } = require('./solution');\nif (!isValidEmail('alice@example.com')) throw new Error('expected true');",
          result: "passed",
          visibleInTest: true,
        },
        {
          id: "tc-missing-at",
          title: "Validate a String with Regular Expressions",
          description: "Rejects an address missing the @ symbol.",
          executionLimitMs: 500,
          code: "const { isValidEmail } = require('./solution');\nif (isValidEmail('aliceexample.com')) throw new Error('expected false');",
          result: "failed",
          resultMessage:
            "Expected isValidEmail('aliceexample.com') to be false, got true.",
          visibleInTest: true,
        },
        ...Array.from({ length: 9 }, (_, i) => ({
          id: `tc-extra-${i + 1}`,
          title: "Validate a String with Regular Expressions",
          description: "Edge-case coverage.",
          executionLimitMs: 500,
          code: `// edge case ${i + 1}\n`,
          result: "not-run" as const,
          visibleInTest: i % 3 !== 0,
        })),
      ],
    },
  },
  {
    id: "q-async-multithread",
    title: "Understanding Async vs Multithread in Fullstack Development",
    type: "essay",
    difficulty: "Easy",
    status: "Published",
    categoryId: "system-design",
    tags: ["JavaScript", "Algorithms", "Frontend"],
    questionContent:
      "Compare cooperative async (event loops) with preemptive multi-threading. When does a fullstack engineer pick one over the other?",
    createdAtISO: new Date(NOW - 6 * DAY).toISOString(),
    updatedAtISO: new Date(NOW - 6 * DAY).toISOString(),
    essay: {
      sampleAnswer:
        "Async excels at I/O-bound work and is single-threaded; multi-threading wins for CPU-bound parallelism. A senior answer covers GIL/Worker threads, scheduling, and shared-state hazards.",
    },
  },
  {
    id: "q-csharp-linq",
    title: "Group and aggregate orders with LINQ",
    type: "csharp",
    difficulty: "Medium",
    status: "Published",
    categoryId: "csharp",
    tags: ["C#", ".Net", "Back-end"],
    questionContent:
      "Given `IEnumerable<Order>` with fields `(int CustomerId, decimal Total)`, return a dictionary of customerId → total spend using LINQ.",
    createdAtISO: new Date(NOW - 8 * DAY).toISOString(),
    updatedAtISO: new Date(NOW - 2 * DAY).toISOString(),
    code: {
      starter:
        "using System;\nusing System.Collections.Generic;\nusing System.Linq;\n\npublic record Order(int CustomerId, decimal Total);\n\npublic static class Solution {\n    public static Dictionary<int, decimal> Totals(IEnumerable<Order> orders) {\n        // your code here\n        return new();\n    }\n}",
      solution:
        "using System;\nusing System.Collections.Generic;\nusing System.Linq;\n\npublic record Order(int CustomerId, decimal Total);\n\npublic static class Solution {\n    public static Dictionary<int, decimal> Totals(IEnumerable<Order> orders) =>\n        orders.GroupBy(o => o.CustomerId)\n              .ToDictionary(g => g.Key, g => g.Sum(o => o.Total));\n}",
      testCases: [
        {
          id: "tc-linq-1",
          title: "Single customer aggregates correctly",
          executionLimitMs: 1000,
          code: "// Assert single customer total = 30",
          result: "passed",
          visibleInTest: true,
        },
        {
          id: "tc-linq-2",
          title: "Two customers aggregate independently",
          executionLimitMs: 1000,
          code: "// Assert customers 1 and 2 totals are independent",
          result: "passed",
          visibleInTest: true,
        },
        {
          id: "tc-linq-3",
          title: "Empty input returns empty dictionary",
          executionLimitMs: 1000,
          code: "// Assert empty input → empty dictionary",
          result: "not-run",
          visibleInTest: false,
        },
      ],
    },
  },
  {
    id: "q-mc-qa",
    title: "Which statement about QA testing is most accurate?",
    type: "multiple-choice",
    difficulty: "Easy",
    status: "Published",
    categoryId: "qa-testing",
    tags: ["QA", "Testing"],
    questionContent:
      "Pick the statement that best describes the role of QA in modern software teams.",
    createdAtISO: new Date(NOW - 1 * DAY).toISOString(),
    updatedAtISO: new Date(NOW - 1 * DAY).toISOString(),
    multipleChoice: {
      multiSelect: false,
      options: [
        {
          id: "mc-a",
          text: "QA testing encompasses much more than just identifying bugs during software development.",
          correct: false,
        },
        {
          id: "mc-b",
          text: "QA testing encompasses much more than just identifying bugs during software development.",
          correct: false,
        },
        {
          id: "mc-c",
          text: "QA testing is not limited to finding bugs; it plays a crucial role in the overall software development process.",
          correct: true,
        },
        {
          id: "mc-d",
          text: "QA testing encompasses much more than just identifying bugs during software development.",
          correct: false,
        },
      ],
    },
  },
  {
    id: "q-testing-checkout",
    title: "Walk through testing the checkout flow end-to-end",
    type: "testing",
    difficulty: "Medium",
    status: "Published",
    categoryId: "qa-testing",
    tags: ["QA", "Testing", "E2E"],
    questionContent:
      "Outline how you'd test a multi-step checkout flow before launch. List the cases you'd cover and how you'd structure them.",
    createdAtISO: new Date(NOW - 4 * DAY).toISOString(),
    updatedAtISO: new Date(NOW - 4 * DAY).toISOString(),
    testing: {
      sampleAnswer:
        "Cover happy path, payment failures, inventory out-of-stock, browser back/refresh, abandoned carts, and accessibility.",
      ideas: [
        { id: "idea-happy", text: "Happy-path purchase" },
        { id: "idea-payment", text: "Declined / failed payment handling" },
        { id: "idea-stock", text: "Item goes out-of-stock mid-checkout" },
        { id: "idea-back", text: "Browser back / refresh keeps cart" },
        { id: "idea-abandon", text: "Abandoned cart recovery email" },
        { id: "idea-a11y", text: "Keyboard / screen-reader accessibility" },
      ],
    },
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __artMockQuestionsStore: Question[] | undefined;
}

function store(): Question[] {
  if (!globalThis.__artMockQuestionsStore) {
    globalThis.__artMockQuestionsStore = [...SEED];
  }
  return globalThis.__artMockQuestionsStore;
}

export function listQuestions(): Question[] {
  return [...store()].sort(
    (a, b) => Date.parse(b.updatedAtISO) - Date.parse(a.updatedAtISO)
  );
}

export function getQuestion(id: string): Question | undefined {
  return store().find((q) => q.id === id);
}

export function addQuestion(q: Question): Question {
  store().unshift(q);
  return q;
}

export function updateQuestion(
  id: string,
  patch: Partial<Question>
): Question | undefined {
  const all = store();
  const idx = all.findIndex((q) => q.id === id);
  if (idx === -1) return undefined;
  all[idx] = {
    ...all[idx],
    ...patch,
    updatedAtISO: new Date().toISOString(),
  };
  return all[idx];
}

export function deleteQuestion(id: string): boolean {
  const all = store();
  const idx = all.findIndex((q) => q.id === id);
  if (idx === -1) return false;
  all.splice(idx, 1);
  return true;
}
