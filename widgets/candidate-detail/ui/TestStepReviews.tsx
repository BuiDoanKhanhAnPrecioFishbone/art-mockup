"use client";

import { useState } from "react";
import { AlertTriangle, Edit3, Sparkles } from "lucide-react";
import type {
  CandidateStepProgress,
  StepReview,
} from "@/entities/candidate";
import { ReviewerChip } from "./ReviewerAvatars";

/** Test-step review block — wireframe `3228:225272`. Per-reviewer
 *  notes carry the candidate's submission summary (Question Breakdown,
 *  Integrity, Score). HR view exposes an Edit pencil + AI Insight
 *  button on the Final Review row; Reviewer view is read-only. */
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
  // Mock submission breakdown — in a real build this would come from
  // /api/submissions/[id]. Numbers match the wireframe.
  const breakdown = { easy: { scored: 8, max: 10 }, medium: { scored: 5, max: 5 }, hard: { scored: 1, max: 3 } };
  const integrity = "Undetected" as const;
  const totalMax = breakdown.easy.max + breakdown.medium.max + breakdown.hard.max;
  const totalScored =
    breakdown.easy.scored + breakdown.medium.scored + breakdown.hard.scored;
  const score = Math.round((totalScored / totalMax) * 120);
  const verdictPass = score >= 80;

  return (
    <div className="space-y-3">
      {/* Final Review summary card (HR/Manager view shows AI Insight + Edit) */}
      {reviews.length > 0 && (
        <article className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_auto]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Final Review
              </p>
              <div className="mt-1 flex items-start gap-2">
                {!verdictPass && (
                  <AlertTriangle
                    size={14}
                    className="mt-0.5 shrink-0 text-amber-500"
                  />
                )}
                <p className="text-sm text-gray-700">
                  {reviews[reviews.length - 1].note ||
                    "The Admin Test discovered that the candidate's professional work used external assistance through other devices."}
                </p>
              </div>
            </div>

            <div className="space-y-1 text-xs text-gray-700">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Question Breakdown
              </p>
              <BreakdownRow label="Easy" value={`${breakdown.easy.scored}/${breakdown.easy.max}`} />
              <BreakdownRow label="Medium" value={`${breakdown.medium.scored}/${breakdown.medium.max}`} />
              <BreakdownRow label="Hard" value={`${breakdown.hard.scored}/${breakdown.hard.max}`} />
            </div>

            <div className="space-y-1 text-xs text-gray-700">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Average Score
              </p>
              <p className="text-sm font-semibold text-gray-900 tabular-nums">
                {score}/120
              </p>
              <p className="text-[10px] text-gray-400">
                Integrity ·{" "}
                <span className="font-medium text-emerald-600">
                  {integrity}
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
        <ReviewerRow key={rv.id} review={rv} score={score} verdictPass={verdictPass} onPatch={onPatchReview} />
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
  score,
  verdictPass,
  onPatch,
}: {
  review: StepReview;
  score: number;
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
            {score}/120
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
            <p className="text-sm text-gray-700">
              {review.note || "—"}
            </p>
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
