"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Edit3, Sparkles } from "lucide-react";
import type {
  CandidateStepProgress,
  StepReview,
} from "@/entities/candidate";
import type { Submission } from "@/entities/test";
import { ReviewerChip } from "./ReviewerAvatars";

/** Test-step review block — wireframe `3228:225272`.
 *
 *  Score, Question Breakdown and Integrity are read from the linked
 *  submission (`progress.submissionId`) — never hardcoded — so the
 *  card reflects the candidate's real test result. The Final Review
 *  summary uses the submission's `aiReviewerNotes`, and shows a
 *  yellow warning if the submission's integrity counters were
 *  flagged. */
export function TestStepReviews({
  reviews,
  progress,
  isHr,
  onPatchReview,
}: {
  reviews: StepReview[];
  progress: CandidateStepProgress;
  isHr: boolean;
  onPatchReview: (review: StepReview) => void;
}) {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [integrityStatus, setIntegrityStatus] = useState<
    "Undetected" | "Cheating" | null
  >(null);

  useEffect(() => {
    if (!progress.submissionId) {
      setSubmission(null);
      setIntegrityStatus(null);
      return;
    }
    fetch(`/api/submissions/by-id/${progress.submissionId}`)
      .then((r) => r.json())
      .then((d) => {
        setSubmission(d.submission ?? null);
        setIntegrityStatus(d.integrityStatus ?? null);
      })
      .catch(() => {
        setSubmission(null);
        setIntegrityStatus(null);
      });
  }, [progress.submissionId]);

  // Roll the per-question results up by difficulty so we can render
  // the Easy / Medium / Hard breakdown like the wireframe.
  const breakdown = useMemo(() => {
    const buckets: Record<string, { scored: number; max: number }> = {
      Easy: { scored: 0, max: 0 },
      Medium: { scored: 0, max: 0 },
      Hard: { scored: 0, max: 0 },
    };
    for (const q of submission?.questionResults ?? []) {
      const key = buckets[q.difficulty] ? q.difficulty : "Easy";
      buckets[key].scored += q.scored;
      buckets[key].max += q.max;
    }
    return buckets;
  }, [submission]);

  const totals = useMemo(() => {
    const scored =
      breakdown.Easy.scored + breakdown.Medium.scored + breakdown.Hard.scored;
    const max = breakdown.Easy.max + breakdown.Medium.max + breakdown.Hard.max;
    return { scored, max };
  }, [breakdown]);

  const integrityFlagged = integrityStatus === "Cheating";
  const verdictPass = submission?.finalReview
    ? submission.finalReview === "Passed"
    : totals.max > 0 && totals.scored / totals.max >= 0.7;

  // Final Review banner copy — prefers the submission's AI notes; if
  // integrity is flagged, surface the specific reason in the wireframe
  // text style.
  const finalReviewText =
    submission?.aiReviewerNotes ??
    (integrityFlagged
      ? "The Admin Test discovered that the candidate's professional work used external assistance through other devices."
      : reviews[reviews.length - 1]?.note ??
        "All reviewers have completed their notes.");

  return (
    <div className="space-y-3">
      {/* Final Review summary — only shown once all assigned reviewers
       *  have submitted a note (matches wireframe's "Reviews (3/3)"
       *  state). HR view exposes AI Insight + Edit affordances. */}
      {reviews.length > 0 &&
        reviews.length >= (progress.reviewerIds.length || 1) && (
          <article className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_auto]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Final Review
                </p>
                <div className="mt-1 flex items-start gap-2">
                  {integrityFlagged && (
                    <AlertTriangle
                      size={14}
                      className="mt-0.5 shrink-0 text-amber-500"
                    />
                  )}
                  <p className="text-sm text-gray-700">{finalReviewText}</p>
                </div>
              </div>

              <div className="space-y-1 text-xs text-gray-700">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Question Breakdown
                </p>
                <BreakdownRow
                  label="Easy"
                  value={fmt(breakdown.Easy.scored, breakdown.Easy.max)}
                />
                <BreakdownRow
                  label="Medium"
                  value={fmt(breakdown.Medium.scored, breakdown.Medium.max)}
                />
                <BreakdownRow
                  label="Hard"
                  value={fmt(breakdown.Hard.scored, breakdown.Hard.max)}
                />
              </div>

              <div className="space-y-1 text-xs text-gray-700">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Average Score
                </p>
                <p className="text-sm font-semibold text-gray-900 tabular-nums">
                  {totals.max > 0 ? `${totals.scored}/${totals.max}` : "—"}
                </p>
                <p className="text-[10px] text-gray-400">
                  Integrity ·{" "}
                  <span
                    className={
                      integrityFlagged
                        ? "font-medium text-amber-600"
                        : "font-medium text-emerald-600"
                    }
                  >
                    {integrityStatus ?? "—"}
                  </span>
                </p>
              </div>
            </div>

            {isHr && (
              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-md border border-violet-300 bg-white px-2 py-1 text-[11px] text-violet-700 hover:bg-violet-50"
                >
                  <Sparkles size={11} /> AI Insight
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-50"
                >
                  <Edit3 size={11} /> Edit
                </button>
              </div>
            )}
          </article>
        )}

      {/* Per-reviewer rows */}
      {reviews.map((rv) => (
        <ReviewerRow
          key={rv.id}
          review={rv}
          scoreScored={totals.scored}
          scoreMax={totals.max}
          breakdown={breakdown}
          integrityStatus={integrityStatus}
          verdictPass={verdictPass}
          onPatch={onPatchReview}
        />
      ))}

      {reviews.length === 0 && (
        <p className="rounded-md border border-dashed border-gray-200 px-4 py-6 text-center text-xs text-gray-500">
          No reviewer notes yet. Open the test submission to leave one.
        </p>
      )}
    </div>
  );
}

function ReviewerRow({
  review,
  scoreScored,
  scoreMax,
  breakdown,
  integrityStatus,
  verdictPass,
  onPatch,
}: {
  review: StepReview;
  scoreScored: number;
  scoreMax: number;
  breakdown: Record<string, { scored: number; max: number }>;
  integrityStatus: "Undetected" | "Cheating" | null;
  verdictPass: boolean;
  onPatch: (next: StepReview) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(review.note ?? "");
  return (
    <article className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5">
        <ReviewerChip
          reviewerId={review.reviewerId}
          email={review.reviewerEmail}
          timeLabel={timeAgo(review.editedAtISO ?? review.submittedAtISO)}
          edited={Boolean(review.editedAtISO)}
        />
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold tabular-nums text-gray-900">
            {scoreMax > 0 ? `${scoreScored}/${scoreMax}` : "—"}
          </span>
          <span
            className={
              verdictPass
                ? "inline-flex items-center rounded bg-emerald-500 px-2 py-0.5 text-[11px] font-semibold text-white"
                : "inline-flex items-center rounded bg-red-500 px-2 py-0.5 text-[11px] font-semibold text-white"
            }
          >
            {verdictPass ? "Pass" : "Fail"}
          </span>
        </div>
      </div>

      <div className="border-t border-gray-100 px-4 py-3">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_auto]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Reviewer&rsquo;s Note
            </p>
            {editing ? (
              <>
                <textarea
                  rows={3}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDraft(review.note ?? "");
                      setEditing(false);
                    }}
                    className="rounded-md border border-gray-200 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onPatch({
                        ...review,
                        note: draft,
                        editedAtISO: new Date().toISOString(),
                      });
                      setEditing(false);
                    }}
                    className="rounded-md bg-violet-600 px-3 py-1 text-xs font-medium text-white hover:bg-violet-700"
                  >
                    Save
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-1 flex items-start justify-between gap-2">
                <p className="text-sm text-gray-700">{review.note || "—"}</p>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                >
                  <Edit3 size={13} />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-1 text-xs text-gray-700">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Question Breakdown
            </p>
            <BreakdownRow
              label="Easy"
              value={fmt(breakdown.Easy.scored, breakdown.Easy.max)}
            />
            <BreakdownRow
              label="Medium"
              value={fmt(breakdown.Medium.scored, breakdown.Medium.max)}
            />
            <BreakdownRow
              label="Hard"
              value={fmt(breakdown.Hard.scored, breakdown.Hard.max)}
            />
          </div>

          <div className="space-y-1 text-xs text-gray-700">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Integrity
            </p>
            <span
              className={
                integrityStatus === "Cheating"
                  ? "inline-flex items-center rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-700"
                  : "inline-flex items-center rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[11px] font-medium text-gray-700"
              }
            >
              {integrityStatus ?? "—"}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function BreakdownRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex items-center justify-between gap-3">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </p>
  );
}

function fmt(scored: number, max: number): string {
  if (max === 0) return "—";
  return `${scored}/${max}`;
}

function timeAgo(iso: string): string {
  const ms = Date.now() - Date.parse(iso);
  if (Number.isNaN(ms)) return iso;
  const minutes = Math.round(ms / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
