import { NextResponse } from "next/server";
import {
  addQuestion,
  listQuestions,
} from "@/entities/question/api/fixtures";
import {
  defaultPayloadFor,
  type Question,
  type QuestionType,
} from "@/entities/question";

export function GET() {
  return NextResponse.json({ questions: listQuestions() });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<Question>;
  if (!body.title?.trim() || !body.type) {
    return NextResponse.json(
      { error: "title and type are required." },
      { status: 400 }
    );
  }
  const id = `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();
  const defaults = defaultPayloadFor(body.type as QuestionType);
  const q: Question = {
    id,
    title: body.title.trim(),
    type: body.type as QuestionType,
    difficulty: body.difficulty ?? "Medium",
    status: body.status ?? "Unpublished",
    tags: body.tags ?? [],
    questionContent: body.questionContent ?? "",
    createdAtISO: now,
    updatedAtISO: now,
    ...defaults,
    ...(body.multipleChoice ? { multipleChoice: body.multipleChoice } : {}),
    ...(body.essay ? { essay: body.essay } : {}),
    ...(body.testing ? { testing: body.testing } : {}),
    ...(body.code ? { code: body.code } : {}),
  };
  addQuestion(q);
  return NextResponse.json({ question: q }, { status: 201 });
}
