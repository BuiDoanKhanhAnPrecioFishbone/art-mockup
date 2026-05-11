import { NextResponse } from "next/server";
import {
  deleteQuestion,
  getQuestion,
  updateQuestion,
} from "@/entities/question/api/fixtures";
import { listTests } from "@/entities/test/api/fixtures";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const q = getQuestion(id);
  if (!q) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ question: q });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const existing = getQuestion(id);
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const patch = await req.json();

  // Doc 05 §5.1: question type is immutable after first use in a
  // Published test. Reject the patch if it would change the type and
  // any Published test references this question.
  if (typeof patch.type === "string" && patch.type !== existing.type) {
    const tests = listTests();
    const referenced = tests.some(
      (t) =>
        t.status === "Published" &&
        t.staticQuestions.some((ref) => ref.questionId === id)
    );
    if (referenced) {
      return NextResponse.json(
        {
          error:
            "Question type cannot be changed — it is referenced by at least one Published test.",
        },
        { status: 409 }
      );
    }
  }

  const updated = updateQuestion(id, patch);
  if (!updated)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ question: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ok = deleteQuestion(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
