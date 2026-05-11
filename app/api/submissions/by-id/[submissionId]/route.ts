import { NextResponse } from "next/server";
import { getSubmission } from "@/entities/test/api/fixtures";
import { deriveIntegrityStatus } from "@/entities/test/model/types";

/** Lookup a single submission by id — used by the candidate-detail
 *  Pipeline & Review tab's test-step block to surface real score /
 *  question-breakdown / integrity numbers instead of hardcoded mocks
 *  (wireframe 3228:225272). */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  const { submissionId } = await params;
  const submission = getSubmission(submissionId);
  if (!submission) {
    return NextResponse.json({ submission: null }, { status: 404 });
  }
  return NextResponse.json({
    submission,
    integrityStatus: deriveIntegrityStatus(submission.integrity),
  });
}
