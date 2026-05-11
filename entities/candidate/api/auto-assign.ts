import type { Program, WorkflowStage, WorkflowStep } from "@/entities/program";
import type { Candidate } from "../model/types";
import { INACTIVE_CANDIDATE_STATUSES } from "../model/types";

/** Picked stage + step + reviewer for a fresh candidate entry. */
export interface AutoAssignment {
  stageId: string;
  stepId: string;
  reviewerIds: string[];
}

/** Implements Doc 02 §2.3 + §2.4:
 *  - Every candidate placed at the **first step of the first stage**.
 *  - Reviewer chosen as the one with the **fewest active candidates**
 *    in that step (status ≠ Rejected / Withdrawn).
 *  - Tie-break: lower reviewer id (stable sort).
 *  - No reviewers configured → returns `reviewerIds: []` so the caller
 *    can decide to block promotion or surface an HR error.
 *
 *  Pure / synchronous; takes the program + the current candidate list
 *  for that program. */
export function autoAssignNewEntry(
  program: Program,
  existingCandidates: Candidate[]
): AutoAssignment {
  const firstStage = program.workflow?.stages?.[0];
  const firstStep = firstStage?.steps?.[0];
  if (!firstStage || !firstStep) {
    return { stageId: "", stepId: "", reviewerIds: [] };
  }
  return {
    stageId: firstStage.id,
    stepId: firstStep.id,
    reviewerIds: pickReviewer(firstStep, firstStage, existingCandidates),
  };
}

/** Pick a reviewer for `step` based on current workload across the
 *  active candidates already in that step. Returns at most one
 *  reviewer id (wrapped in an array to fit the candidate model). */
export function pickReviewer(
  step: WorkflowStep,
  stage: WorkflowStage,
  existingCandidates: Candidate[]
): string[] {
  const candidatesAvailable = step.reviewerIds ?? [];
  // Spec also mentions a single legacy `reviewerId` field — accept it.
  const fallbackSingle = (step as { reviewerId?: string }).reviewerId;
  const reviewers = candidatesAvailable.length
    ? candidatesAvailable
    : fallbackSingle
      ? [fallbackSingle]
      : [];
  if (reviewers.length === 0) return [];
  if (reviewers.length === 1) return [reviewers[0]];

  // Count active candidates per reviewer in this step. Inactive
  // statuses (rejected / withdrawn / completed) are excluded from the
  // workload tally per Doc 02 §2.4.
  const stepCandidates = existingCandidates.filter(
    (c) =>
      c.currentStageId === stage.id &&
      c.currentStepId === step.id &&
      !INACTIVE_CANDIDATE_STATUSES.includes(c.status)
  );
  const counts = new Map<string, number>();
  for (const r of reviewers) counts.set(r, 0);
  for (const c of stepCandidates) {
    for (const r of c.reviewerIds) {
      if (counts.has(r)) counts.set(r, (counts.get(r) ?? 0) + 1);
    }
  }
  // Sort by (count asc, id asc) — stable tie-break.
  const sorted = [...counts.entries()].sort((a, b) => {
    if (a[1] !== b[1]) return a[1] - b[1];
    return a[0].localeCompare(b[0]);
  });
  return [sorted[0][0]];
}
