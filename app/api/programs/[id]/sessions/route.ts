import { NextResponse } from "next/server";
import { getProgram } from "@/entities/program/api/fixtures";
import {
  listSessions,
  listSubmissions,
  listTests,
} from "@/entities/test/api/fixtures";
import type { Test, TestSession } from "@/entities/test";
import type { WorkflowStage, WorkflowStep } from "@/entities/program/model/workflow";

/** Per-session card payload used by both the HR and Reviewer variants
 *  of the program Sessions tab. Shared so the API has one source of
 *  truth for the counters and the HR widget doesn't have to re-derive
 *  Review-Process % on the client. */
export interface ProgramSessionCard {
  session: TestSession;
  test: Test | null;
  /** Pretty label for the wireframe's "Cloned from: <test> — <variant>"
   *  line. Falls back to the test title when no variant info exists. */
  clonedFrom: string;
  counts: {
    /** Total submissions assigned to this session. */
    submissions: number;
    /** Submissions whose final review is Passed / Failed. */
    completedReviews: number;
    /** Submitted by the candidate but reviewer hasn't issued a verdict
     *  yet. */
    underReview: number;
    /** Candidate hasn't finished the test (in-progress / abandoned). */
    pending: number;
  };
  /** 0-100 — completedReviews / submissions, rounded. 0 when no
   *  submissions yet. */
  reviewProcessPercent: number;
  /** Reviewer-shape counters kept here so a single payload feeds the
   *  legacy Reviewer-view rows without a second round-trip. */
  reviewerCounts: {
    pending: number;
    underReview: number;
    done: number;
    total: number;
  };
}

interface StepGroup {
  step: WorkflowStep;
  sessions: ProgramSessionCard[];
}

interface StageGroup {
  stage: WorkflowStage;
  /** "Test" steps that exist on this stage — drives the "N Step: Test"
   *  badge in the HR view header. */
  testStepCount: number;
  /** Total sessions across this stage's steps. */
  sessionCount: number;
  steps: StepGroup[];
}

/** Sessions surfaced under a Program — grouped by stage / step for the
 *  HR view, with per-row counters that also satisfy the Reviewer
 *  variant. The Reviewer view flattens `stages[].steps[].sessions[]`
 *  into a single list. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const program = getProgram(id);
  if (!program)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const allSessions = listSessions();
  const tests = listTests();
  const testById = new Map<string, Test>(tests.map((t) => [t.id, t]));

  const programTestIds = new Set<string>();
  for (const stage of program.workflow?.stages ?? []) {
    for (const step of stage.steps) {
      for (const t of step.testIds ?? []) programTestIds.add(t);
    }
  }
  const programSessions: TestSession[] =
    programTestIds.size > 0
      ? allSessions.filter((s) => programTestIds.has(s.testId))
      : allSessions;

  function buildCard(session: TestSession): ProgramSessionCard {
    const subs = listSubmissions(session.id);
    const completedReviews = subs.filter(
      (s) => s.finalReview === "Passed" || s.finalReview === "Failed"
    ).length;
    const underReview = subs.filter(
      (s) =>
        s.status === "submitted" &&
        s.finalReview !== "Passed" &&
        s.finalReview !== "Failed"
    ).length;
    const pending = subs.filter(
      (s) => s.status === "in-progress" || s.status === "abandoned"
    ).length;
    const submissions = subs.length;
    const test = testById.get(session.testId) ?? null;
    return {
      session,
      test,
      clonedFrom: test ? `Cloned from: ${test.title}` : "",
      counts: { submissions, completedReviews, underReview, pending },
      reviewProcessPercent:
        submissions > 0
          ? Math.round((completedReviews / submissions) * 100)
          : 0,
      reviewerCounts: {
        pending,
        underReview,
        done: completedReviews,
        total: submissions,
      },
    };
  }

  // Build the stage / step / session tree in workflow order.
  const stages: StageGroup[] = (program.workflow?.stages ?? []).map((stage) => {
    const steps: StepGroup[] = stage.steps.map((step) => {
      const stepSessions =
        step.type === "test"
          ? programSessions
              .filter((s) => (step.testIds ?? []).includes(s.testId))
              .map(buildCard)
          : [];
      return { step, sessions: stepSessions };
    });
    return {
      stage,
      testStepCount: stage.steps.filter((s) => s.type === "test").length,
      sessionCount: steps.reduce((sum, s) => sum + s.sessions.length, 0),
      steps,
    };
  });

  // Demo allowance: when the program has no Test steps configured,
  // wrap every existing session under a synthetic stage so the tab is
  // not empty.
  if (stages.every((g) => g.sessionCount === 0) && programSessions.length > 0) {
    const synthetic: StageGroup = {
      stage: {
        id: "stage-unassigned",
        name: "Unassigned",
        steps: [],
      },
      testStepCount: 1,
      sessionCount: programSessions.length,
      steps: [
        {
          step: {
            id: "step-unassigned",
            name: "Test sessions",
            type: "test",
            timelineDays: 0,
            instruction: "",
          },
          sessions: programSessions.map(buildCard),
        },
      ],
    };
    stages.push(synthetic);
  }

  // Flat list for the legacy Reviewer-view widget.
  const flat = stages.flatMap((sg) => sg.steps.flatMap((st) => st.sessions));

  return NextResponse.json({
    stages,
    rows: flat.map((c) => ({
      session: c.session,
      test: c.test,
      counts: c.reviewerCounts,
    })),
    totals: {
      sessions: flat.length,
    },
  });
}
