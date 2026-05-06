import { NextResponse } from "next/server";
import {
  defaultPayloadFor,
  type Difficulty,
  type Question,
  type QuestionType,
} from "@/entities/question";

/**
 * POST /api/questions/ai-generate
 *
 * Mock "AI" endpoint — returns a generated question draft based on the
 * provided params. No real model is invoked; this just synthesises a
 * realistic-looking shape so the demo flow is end-to-end.
 *
 * Body: { type, difficulty, tags, description }
 */
export async function POST(req: Request) {
  const body = (await req.json()) as {
    type?: QuestionType;
    difficulty?: Difficulty;
    tags?: string[];
    description?: string;
  };
  const type = (body.type ?? "essay") as QuestionType;
  const difficulty = body.difficulty ?? "Medium";
  const tags = body.tags ?? [];
  const description =
    body.description?.trim() ||
    "Demonstrate competence with the topic and explain your reasoning.";

  // Tiny grab-bag of "AI" titles per type so regenerate feels different.
  const TITLE_POOL: Record<QuestionType, string[]> = {
    essay: [
      "Compare two approaches to the topic and pick one",
      "Explain how you would teach this concept to a junior",
      "Walk through a real project where this came up",
    ],
    "multiple-choice": [
      "Pick the most accurate statement",
      "Which of these is NOT correct?",
      "Identify the strongest argument",
    ],
    csharp: [
      "Implement the function described below",
      "Refactor the snippet to be idiomatic C#",
      "Spot the bug and fix the implementation",
    ],
    javascript: [
      "Implement the function described below",
      "Refactor the snippet to be idiomatic JavaScript",
      "Make this asynchronous code testable",
    ],
    testing: [
      "Design a test plan covering this scenario",
      "List the cases you'd add to a regression suite",
      "Outline an end-to-end test for this flow",
    ],
  };

  const titles = TITLE_POOL[type];
  const title = titles[Math.floor(Math.random() * titles.length)];

  // Pretend latency so the UI gets to flash a "Generating…" state.
  await new Promise((r) => setTimeout(r, 600));

  const id = `q-ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();
  const draft: Question = {
    id,
    title,
    type,
    difficulty,
    status: "Draft",
    tags,
    questionContent: `${description}\n\nProvide concrete examples and trade-offs in your answer.`,
    createdAtISO: now,
    updatedAtISO: now,
    ...defaultPayloadFor(type),
  };

  // Lightly populate per-type payloads so accept-and-edit isn't empty.
  if (type === "multiple-choice" && draft.multipleChoice) {
    draft.multipleChoice.options = [
      {
        id: "ai-opt-a",
        text: "An accurate, complete description of the topic.",
        correct: true,
      },
      {
        id: "ai-opt-b",
        text: "A common misconception about the topic.",
        correct: false,
      },
      {
        id: "ai-opt-c",
        text: "A partial answer that misses a key nuance.",
        correct: false,
      },
      {
        id: "ai-opt-d",
        text: "An unrelated concept that sounds similar.",
        correct: false,
      },
    ];
  } else if (type === "testing" && draft.testing) {
    draft.testing.ideas = [
      { id: "ai-idea-happy", text: "Happy-path scenario covered" },
      { id: "ai-idea-edge", text: "At least one edge case considered" },
      { id: "ai-idea-error", text: "Error / failure handling described" },
      { id: "ai-idea-perf", text: "Performance / scalability touched on" },
    ];
  }

  return NextResponse.json({ question: draft });
}
