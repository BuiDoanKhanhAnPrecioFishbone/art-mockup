"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  Award,
  ChevronDown,
  ChevronRight,
  Edit3,
  Lock,
  Plus,
  Sparkles,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import {
  REVIEW_VERDICTS,
  STEP_RESULTS,
  STEP_RESULT_TONE,
  canViewOtherReviews,
  type CandidateProfileData,
  type CandidateStepProgress,
  type ReviewVerdict,
  type StepResult,
  type StepReview,
} from "@/entities/candidate";
import type {
  Program,
  WorkflowStage,
  WorkflowStep,
} from "@/entities/program";
import type { SystemRole } from "@/entities/system-role";
import { useViewingRole } from "@/shared/lib/viewing-role";
import { ReviewerAvatars } from "./ReviewerAvatars";
import { DefaultStepReviews } from "./DefaultStepReviews";
import { InterviewStepReviews } from "./InterviewStepReviews";
import { InterviewReviewModal } from "./InterviewReviewModal";
import { TestStepReviews } from "./TestStepReviews";
import { ComparisonHubModal } from "./ComparisonHubModal";

/** Pipeline & Review tab — wireframe nodes 3228:224227 (Default),
 *  3228:224395 (Interview), 3228:225272 (Test). Vertical stack of
 *  step cards that the candidate has touched, with arrow connectors
 *  between them. Each card knows its shape from the workflow's
 *  `step.type`. */
export function PipelineReviewTab({
  candidateId,
  candidateName,
  programId,
  profile,
  onSavePipeline,
  saving,
}: {
  candidateId: string;
  candidateName: string;
  programId: string;
  profile: CandidateProfileData;
  onSavePipeline: (next: CandidateStepProgress[]) => void;
  saving: boolean;
}) {
  const [program, setProgram] = useState<Program | null>(null);
  const [roles, setRoles] = useState<SystemRole[]>([]);
  const [interviewModal, setInterviewModal] = useState<{
    step: WorkflowStep;
    progress: CandidateStepProgress;
    review: StepReview | null;
  } | null>(null);
  const [compareStepId, setCompareStepId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/programs/${programId}`)
      .then((r) => r.json())
      .then((d) => setProgram(d.program ?? null));
    fetch("/api/system-roles")
      .then((r) => r.json())
      .then((d) => setRoles(d.roles ?? []));
  }, [programId]);

  const { roleId } = useViewingRole(roles);

  /** Map of stepId → progress for fast lookup. */
  const progressByStep = useMemo(() => {
    const m = new Map<string, CandidateStepProgress>();
    for (const p of profile.pipeline ?? []) m.set(p.stepId, p);
    return m;
  }, [profile.pipeline]);

  /** Walk the workflow and emit { stage, step, progress } for every
   *  step the candidate has touched (i.e. has a progress record). */
  const visibleSteps = useMemo(() => {
    if (!program?.workflow) return [];
    const out: {
      stage: WorkflowStage;
      step: WorkflowStep;
      progress: CandidateStepProgress;
    }[] = [];
    for (const stage of program.workflow.stages) {
      for (const step of stage.steps) {
        const progress = progressByStep.get(step.id);
        if (progress) out.push({ stage, step, progress });
      }
    }
    return out;
  }, [program, progressByStep]);

  if (!program) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-400">
        Loading pipeline…
      </div>
    );
  }

  if (visibleSteps.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
        <p className="text-sm font-medium text-gray-700">
          No pipeline activity yet.
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Reviews appear here once the candidate enters a step.
        </p>
      </div>
    );
  }

  /** Patch a single step's progress and bubble up. */
  function patchStep(
    stepId: string,
    patch: Partial<CandidateStepProgress>
  ) {
    const next = (profile.pipeline ?? []).map((p) =>
      p.stepId === stepId ? { ...p, ...patch } : p
    );
    onSavePipeline(next);
  }

  return (
    <div className="space-y-1">
      {saving && (
        <p className="mb-2 text-right text-xs text-gray-400">Saving…</p>
      )}

      {visibleSteps.map((entry, i) => (
        <div key={entry.step.id}>
          <StepCard
            stage={entry.stage}
            step={entry.step}
            progress={entry.progress}
            roleId={roleId}
            onSave={(patch) => patchStep(entry.step.id, patch)}
            onAddInterviewReview={(review) =>
              setInterviewModal({
                step: entry.step,
                progress: entry.progress,
                review,
              })
            }
            onCompare={() => setCompareStepId(entry.step.id)}
          />

          {/* Arrow connector between steps */}
          {i < visibleSteps.length - 1 && (
            <div className="my-2 flex justify-center text-gray-400">
              <ArrowDown size={18} />
            </div>
          )}
        </div>
      ))}

      {/* Interview review modal */}
      {interviewModal && (
        <InterviewReviewModal
          step={interviewModal.step}
          existing={interviewModal.review}
          onSave={(rev) => {
            const progress = interviewModal.progress;
            const exists = progress.reviews.some((r) => r.id === rev.id);
            const nextReviews = exists
              ? progress.reviews.map((r) => (r.id === rev.id ? rev : r))
              : [...progress.reviews, rev];
            patchStep(progress.stepId, { reviews: nextReviews });
            setInterviewModal(null);
          }}
          onClose={() => setInterviewModal(null)}
        />
      )}

      {/* Comparison hub modal */}
      {compareStepId && (
        <ComparisonHubModal
          programId={programId}
          stepId={compareStepId}
          anchorCandidateId={candidateId}
          anchorCandidateName={candidateName}
          onClose={() => setCompareStepId(null)}
        />
      )}
    </div>
  );
}

/* ---------- Per-step card ---------- */

function StepCard({
  stage,
  step,
  progress,
  roleId,
  onSave,
  onAddInterviewReview,
  onCompare,
}: {
  stage: WorkflowStage;
  step: WorkflowStep;
  progress: CandidateStepProgress;
  roleId: string;
  onSave: (patch: Partial<CandidateStepProgress>) => void;
  onAddInterviewReview: (review: StepReview | null) => void;
  onCompare: () => void;
}) {
  const [editingHeader, setEditingHeader] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(true);
  const isHr = roleId !== "role-reviewer" && roleId !== "role-candidate";

  // Reviewer-as-current-user: pick a fixed reviewer id when in
  // Reviewer view so we can demonstrate the blind-review rule.
  const currentReviewerId =
    roleId === "role-reviewer"
      ? progress.reviewerIds[0] ?? null
      : null;

  const canSeeOthers = canViewOtherReviews(
    roleId,
    currentReviewerId,
    progress.reviews
  );
  const ownReview =
    currentReviewerId
      ? progress.reviews.find((r) => r.reviewerId === currentReviewerId)
      : null;
  const visibleReviews = canSeeOthers
    ? progress.reviews
    : ownReview
      ? [ownReview]
      : [];

  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Header */}
      <StepHeader
        stage={stage}
        step={step}
        progress={progress}
        editing={editingHeader}
        canEdit={isHr}
        onToggleEdit={() => setEditingHeader((v) => !v)}
        onSave={(patch) => {
          onSave(patch);
          setEditingHeader(false);
        }}
      />

      {/* Reviews summary bar */}
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-50 px-5 py-2.5">
        <button
          type="button"
          onClick={() => setReviewsOpen((v) => !v)}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-800 hover:text-gray-900"
        >
          {reviewsOpen ? (
            <ChevronDown size={14} />
          ) : (
            <ChevronRight size={14} />
          )}
          Reviews ({progress.reviews.length}/{progress.reviewerIds.length})
        </button>

        <div className="flex items-center gap-2">
          {step.type === "interview" && progress.reviews.length > 0 && (
            <button
              type="button"
              onClick={onCompare}
              className="inline-flex items-center gap-1 rounded-md border border-violet-300 bg-white px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-50"
            >
              Compare
            </button>
          )}
          {step.type === "test" && progress.submissionId && (
            <a
              href={`/submissions/${
                progress.submissionId.split("-")[0] === "sub"
                  ? "sess-3"
                  : progress.submissionId
              }/${progress.submissionId}`}
              className="inline-flex items-center gap-1 rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700"
            >
              Go to Test Submission →
            </a>
          )}
          {step.type !== "test" && (
            <button
              type="button"
              onClick={() => {
                if (step.type === "interview") {
                  onAddInterviewReview(ownReview ?? null);
                } else {
                  // Default step — add a blank review locally (the
                  // child component handles inline edit).
                  onAddInterviewReview(null);
                }
              }}
              className="inline-flex items-center gap-1 rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700"
            >
              <Plus size={11} />
              {ownReview ? "Edit my Review" : "Add my Review"}
            </button>
          )}
        </div>
      </div>

      {/* Reviews body */}
      {reviewsOpen && (
        <div className="px-5 py-4">
          {!canSeeOthers && !ownReview ? (
            <BlindReviewLocked />
          ) : step.type === "interview" ? (
            <InterviewStepReviews
              step={step}
              reviews={visibleReviews}
              aiSummary={progress.aiReviewerSummary}
              isHr={isHr}
              onEditReview={(rev) => onAddInterviewReview(rev)}
              onPatchSummary={(s) => onSave({ aiReviewerSummary: s })}
            />
          ) : step.type === "test" ? (
            <TestStepReviews
              reviews={visibleReviews}
              progress={progress}
              isHr={isHr}
              onPatchReview={(rev) => {
                const next = progress.reviews.map((r) =>
                  r.id === rev.id ? rev : r
                );
                onSave({ reviews: next });
              }}
            />
          ) : (
            <DefaultStepReviews
              reviews={visibleReviews}
              currentReviewerId={currentReviewerId}
              isHr={isHr}
              onAddOrUpdate={(rev) => {
                const exists = progress.reviews.some(
                  (r) => r.id === rev.id
                );
                const next = exists
                  ? progress.reviews.map((r) =>
                      r.id === rev.id ? rev : r
                    )
                  : [...progress.reviews, rev];
                onSave({ reviews: next });
              }}
            />
          )}
        </div>
      )}
    </section>
  );
}

/* ---------- Step header (booked / reviewers / step result) ---------- */

function StepHeader({
  stage,
  step,
  progress,
  editing,
  canEdit,
  onToggleEdit,
  onSave,
}: {
  stage: WorkflowStage;
  step: WorkflowStep;
  progress: CandidateStepProgress;
  editing: boolean;
  canEdit: boolean;
  onToggleEdit: () => void;
  onSave: (patch: Partial<CandidateStepProgress>) => void;
}) {
  const [draft, setDraft] = useState(progress);
  useEffect(() => setDraft(progress), [progress.stepId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="px-5 py-3">
      {/* Stage / step name strip */}
      <div className="mb-2 flex items-center gap-2 text-xs">
        <span className="rounded bg-violet-50 px-1.5 py-0.5 font-medium text-violet-700">
          {stage.name}
        </span>
        <ChevronRight size={11} className="text-gray-400" />
        <span className="font-medium text-gray-800">{step.name}</span>
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-gray-500">
          {step.type}
        </span>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-[1fr_1.2fr_1fr_auto]">
        {/* Booked Date */}
        <Field label="Booked Date">
          {editing ? (
            <input
              type="date"
              value={draft.bookedDateISO ?? ""}
              onChange={(e) =>
                setDraft((d) => ({ ...d, bookedDateISO: e.target.value }))
              }
              className={inputClass}
            />
          ) : (
            <p className="text-sm text-gray-900">
              {progress.bookedDateISO
                ? `${progress.bookedTimeLabel ?? ""} ${formatDate(
                    progress.bookedDateISO
                  )}`.trim()
                : "Not booked"}
            </p>
          )}
        </Field>

        {/* Reviewers */}
        <Field label="Reviewer *">
          <div className="flex items-center gap-2">
            <ReviewerAvatars
              reviewerIds={progress.reviewerIds}
              size="sm"
              max={4}
            />
            {progress.notifyReviewers && (
              <span className="inline-flex items-center rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                Notify
              </span>
            )}
          </div>
        </Field>

        {/* Step Result */}
        <Field label="Step Result">
          {editing ? (
            <select
              value={draft.stepResult ?? ""}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  stepResult: (e.target.value || undefined) as
                    | StepResult
                    | undefined,
                }))
              }
              className={inputClass}
            >
              <option value="">Please Select</option>
              {STEP_RESULTS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          ) : (
            <p
              className={cn(
                "text-sm font-semibold underline-offset-2",
                progress.stepResult
                  ? STEP_RESULT_TONE[progress.stepResult]
                  : "text-gray-400"
              )}
            >
              {progress.stepResult ?? "—"}
            </p>
          )}
        </Field>

        {/* Edit / Save / Cancel */}
        {canEdit && (
          <div className="flex items-start gap-1 pt-5">
            {editing ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setDraft(progress);
                    onToggleEdit();
                  }}
                  className="rounded-md border border-gray-200 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => onSave(draft)}
                  className="rounded-md bg-violet-600 px-3 py-1 text-xs font-medium text-white hover:bg-violet-700"
                >
                  Save
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onToggleEdit}
                className="rounded p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                title="Edit step header"
              >
                <Edit3 size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium text-gray-500">{label}</p>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

/* ---------- Blind-review locked card ---------- */

function BlindReviewLocked() {
  return (
    <div className="rounded-lg border border-dashed border-violet-200 bg-violet-50/40 px-6 py-10 text-center">
      <span className="grid h-10 w-10 mx-auto place-items-center rounded-full bg-violet-100 text-violet-600">
        <Lock size={18} />
      </span>
      <p className="mt-3 text-sm font-semibold text-violet-700">
        Blind Review Active
      </p>
      <p className="mt-1 text-xs text-gray-600">
        Submit your review to unlock viewing results from other Reviewers.
        <br />
        Avoid anchoring bias.
      </p>
    </div>
  );
}

/* ---------- helpers shared with sub-files ---------- */

const inputClass =
  "block w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500";

function formatDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
}

/* Re-export types used by sibling files. */
export type { ReviewVerdict };
export { REVIEW_VERDICTS };
export const PIPELINE_TAB_HELPERS = { formatDate, inputClass, Award, Sparkles };
