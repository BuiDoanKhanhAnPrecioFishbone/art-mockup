import { NextResponse } from "next/server";
import { getSession, getTest } from "@/entities/test/api/fixtures";
import { getQuestion, listQuestions } from "@/entities/question/api/fixtures";
import type { Question } from "@/entities/question";

/** Candidate-facing payload for the test runner. Returns the session,
 *  the underlying test, and the resolved question list (static refs +
 *  a dynamic-pool sample for tests in dynamic mode). */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = getSession(sessionId);
  if (!session)
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  const test = getTest(session.testId);
  if (!test)
    return NextResponse.json({ error: "Test not found" }, { status: 404 });

  // Resolve question list. Static mode looks up by id in author order.
  // Dynamic mode samples N questions from the pool per condition (the
  // mock is deterministic so the same session yields the same set).
  const questions: Question[] = [];
  if (test.compositionMode === "static") {
    for (const ref of [...test.staticQuestions].sort(
      (a, b) => a.order - b.order
    )) {
      const q = getQuestion(ref.questionId);
      if (q) questions.push(q);
    }
  } else {
    const pool = listQuestions();
    for (const cond of [...test.dynamicConditions].sort(
      (a, b) => a.order - b.order
    )) {
      const matches = pool.filter(
        (q) =>
          (!cond.type || q.type === cond.type) &&
          (!cond.difficulty || q.difficulty === cond.difficulty)
      );
      questions.push(...matches.slice(0, cond.quantity));
    }
  }

  return NextResponse.json({ session, test, questions });
}
