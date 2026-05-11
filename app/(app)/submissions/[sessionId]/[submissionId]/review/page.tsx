import { notFound } from "next/navigation";
import {
  getSession,
  getSubmission,
  getTest,
} from "@/entities/test/api/fixtures";
import { getQuestion } from "@/entities/question/api/fixtures";
import type { Question } from "@/entities/question";
import { SubmissionReviewView } from "@/widgets/submission-review";

/** Per-question review surface — wireframe TUCQDUD1WLKCSAnIY8ed7a /
 *  2010:47072. The reviewer drills from the Submission Detail page
 *  into this view to grade question-by-question. */
export default async function SubmissionReviewPage({
  params,
}: {
  params: Promise<{ sessionId: string; submissionId: string }>;
}) {
  const { sessionId, submissionId } = await params;
  const session = getSession(sessionId);
  const submission = getSubmission(submissionId);
  if (!session || !submission || submission.sessionId !== sessionId) {
    notFound();
  }
  const test = getTest(session.testId);

  // Resolve the question objects in author order. Static tests use
  // the test's `staticQuestions` ref list. Dynamic tests fall back to
  // whatever the submission's `questionResults` references — the
  // dynamic engine snapshots the rendered set per session, so this is
  // the most accurate reconstruction we have post-hoc.
  let questions: Question[] = [];
  if (test?.compositionMode === "static") {
    questions = [...test.staticQuestions]
      .sort((a, b) => a.order - b.order)
      .map((ref) => getQuestion(ref.questionId))
      .filter((q): q is Question => Boolean(q));
  }
  if (questions.length === 0 && submission.questionResults) {
    questions = submission.questionResults
      .map((r) => getQuestion(r.questionId))
      .filter((q): q is Question => Boolean(q));
  }

  return (
    <SubmissionReviewView
      session={session}
      submission={submission}
      questions={questions}
    />
  );
}
