import { NextResponse } from "next/server";
import {
  listSessions,
  listSubmissions,
  listTests,
} from "@/entities/test/api/fixtures";
import { listAllCandidates } from "@/entities/candidate/api/fixtures";
import { listPrograms } from "@/entities/program/api/fixtures";
import { REVIEWERS } from "@/shared/fixtures/reviewers";

/** Demo "current reviewer" — when the viewer flips the role to
 *  Reviewer they take on this user's identity. Pick `u-marcus`
 *  because the fixtures put him on the most active program steps,
 *  so the inbox lands with content. The header
 *  `x-demo-reviewer-id` overrides this for future flexibility. */
const DEMO_REVIEWER_ID = "u-marcus";

/** Reviewer Inbox — submissions waiting for the current reviewer
 *  to score. Filters:
 *    - Submission has been turned in (`status === "submitted"`).
 *    - Final review hasn't been issued yet (Pending / Under Review /
 *      missing).
 *    - The candidate's current step has the current reviewer in its
 *      assigned reviewer list (best-effort proxy for "assigned to
 *      you" since we don't track per-submission assignment yet).
 *  HR / Manager get the same payload — useful for spot-checking
 *  workload and forwarding submissions. */
export async function GET(req: Request) {
  const overrideId = req.headers.get("x-demo-reviewer-id");
  const reviewerId = overrideId ?? DEMO_REVIEWER_ID;
  const reviewer = REVIEWERS.find((r) => r.id === reviewerId);

  const sessions = listSessions();
  const sessionById = new Map(sessions.map((s) => [s.id, s]));
  const tests = listTests();
  const testById = new Map(tests.map((t) => [t.id, t]));
  const candidates = listAllCandidates();
  const candidateByEmail = new Map(
    candidates.map((c) => [c.email.toLowerCase(), c])
  );
  const programs = listPrograms();
  const programById = new Map(programs.map((p) => [p.id, p]));

  // Pull every submission across every session, then filter.
  const allSubs = sessions.flatMap((s) => listSubmissions(s.id));
  const rows = allSubs
    .filter((sub) => {
      // Only "needs review" entries surface in the inbox.
      if (sub.status !== "submitted") return false;
      const verdict = sub.finalReview;
      if (verdict === "Passed" || verdict === "Failed") return false;
      // Try to bind to a known candidate so we can inspect their
      // current step's reviewer assignment.
      const candidate = candidateByEmail.get(sub.candidateEmail.toLowerCase());
      if (!candidate) return true; // unknown candidate → always show (demo)
      const program = programById.get(candidate.programId);
      const step = program?.workflow?.stages
        .flatMap((stage) => stage.steps)
        .find((st) => st.id === candidate.currentStepId);
      if (!step) return true;
      const assignees = step.reviewerIds ?? (step.reviewerId ? [step.reviewerId] : []);
      // No assignees recorded → fall through and show (better to
      // surface than hide for the demo).
      if (assignees.length === 0) return true;
      return assignees.includes(reviewerId);
    })
    .map((sub) => {
      const session = sessionById.get(sub.sessionId);
      const test = session ? testById.get(session.testId) : null;
      const candidate = candidateByEmail.get(sub.candidateEmail.toLowerCase());
      const program = candidate
        ? programById.get(candidate.programId) ?? null
        : null;
      return {
        submission: sub,
        session: session ?? null,
        test: test ?? null,
        candidate: candidate ?? null,
        program: program
          ? { id: program.id, title: program.title }
          : null,
      };
    })
    .sort(
      (a, b) =>
        Date.parse(b.submission.submittedAtISO ?? b.submission.startedAtISO) -
        Date.parse(a.submission.submittedAtISO ?? a.submission.startedAtISO)
    );

  return NextResponse.json({
    reviewer: reviewer
      ? { id: reviewer.id, name: reviewer.name, role: reviewer.role }
      : null,
    rows,
  });
}
