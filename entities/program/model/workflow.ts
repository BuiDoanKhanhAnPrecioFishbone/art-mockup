/**
 * Per-program recruitment workflow.
 *
 * The workflow is a sequence of stages, each containing one or more steps.
 * A program is usually started from a flow template (`flowTemplateId`) which
 * pre-populates the stages and steps. After that, the user can rename, add,
 * remove, or reorder stages and steps for this program only — changes do not
 * write back to the template.
 *
 * Step types:
 *   - 'default'    — a generic stage in the funnel (CV review, screening call …)
 *   - 'test'       — pick from a pool of test templates; sessions are created
 *                    per candidate from the chosen tests.
 *   - 'interview'  — attach a scorecard from the scorecard-template library;
 *                    its criteria can then be edited per program.
 *
 * Critical rule (from the customer's brief): switching the scorecard template
 * REPLACES the existing criteria with the new template's criteria. The UI
 * confirms before doing so.
 */

export type StepType = "default" | "interview" | "test";

export const STEP_TYPE_LABEL: Record<StepType, string> = {
  default: "Default",
  interview: "Interview",
  test: "Test",
};

export interface ScorecardCriterion {
  /** Stable id within this step. */
  id: string;
  /** ID of the criterion template this came from, if any. */
  templateId?: string;
  name: string;
  /** 1-5 weight / importance. */
  weight: number;
  description?: string;
}

export interface StepScorecard {
  /** Which scorecard template was applied. */
  templateId: string;
  criteria: ScorecardCriterion[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: StepType;
  /** Days the step typically takes (used for timeline/reminders). */
  timelineDays: number;
  instruction: string;
  /** Legacy single-reviewer field. New code reads `reviewerIds`. */
  reviewerId?: string;
  /** Multi-reviewer assignment. Falls back to [reviewerId] when missing. */
  reviewerIds?: string[];
  /** Auto-allocate candidates across the assigned reviewers (round-robin). */
  autoAllocate?: boolean;
  /** Cap how many of the assigned reviewers see any single candidate. */
  maxReviewersPerCandidate?: number;
  /** Require at least N of the reviewers to complete before the candidate
   *  can advance to the next step. */
  requireMinReviews?: number;
  /** Hide candidate list and info from reviewers who weren't assigned. */
  hideCandidateInfoFromUnassigned?: boolean;
  emailTemplateId?: string;
  /** Send the email automatically when a candidate enters this step. */
  autoSendEmail?: boolean;
  /** type === 'test' — list of test-template ids the candidate can be sent. */
  testIds?: string[];
  /** type === 'interview' — scorecard config. */
  scorecard?: StepScorecard;
}

export interface WorkflowStage {
  id: string;
  name: string;
  steps: WorkflowStep[];
}

export interface ProgramWorkflow {
  flowTemplateId?: string;
  stages: WorkflowStage[];
}

export function defaultWorkflow(): ProgramWorkflow {
  return { stages: [] };
}

export function newStage(name = "New Stage"): WorkflowStage {
  return { id: `stage-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name, steps: [] };
}

export function newStep(name = "New Step"): WorkflowStep {
  return {
    id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    type: "default",
    timelineDays: 3,
    instruction: "",
  };
}

export function newCriterion(name = "Untitled criterion"): ScorecardCriterion {
  return {
    id: `crit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    weight: 3,
  };
}
