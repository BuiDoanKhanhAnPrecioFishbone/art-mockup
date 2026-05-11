"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Edit3, Sparkles } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { ReviewVerdict, StepReview } from "@/entities/candidate";
import type { WorkflowStep } from "@/entities/program";
import { ReviewerChip } from "./ReviewerAvatars";
import { RadarChart } from "./RadarChart";

const VERDICT_TONE: Record<ReviewVerdict, string> = {
  Pass: "bg-emerald-500 text-white",
  Fail: "bg-red-500 text-white",
  Consider: "bg-amber-400 text-white",
  "High Priority": "bg-violet-600 text-white",
};

const REVIEW_COLORS = [
  "#7c3aed",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#0ea5e9",
];

/** Interview-step review block — wireframe `3228:224395`. Each review
 *  expands into a radar chart of criterion scores + per-criterion
 *  chips with hover tooltips + the reviewer's note. Below the list
 *  sits the AI Reviewer's-Note panel with auto-fill / re-generate. */
export function InterviewStepReviews({
  step,
  reviews,
  aiSummary,
  isHr,
  onEditReview,
  onPatchSummary,
}: {
  step: WorkflowStep;
  reviews: StepReview[];
  aiSummary?: string;
  isHr: boolean;
  onEditReview: (review: StepReview) => void;
  onPatchSummary: (next: string) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(
    reviews[0]?.id ?? null
  );
  const [generating, setGenerating] = useState(false);

  function generateSummary() {
    setGenerating(true);
    window.setTimeout(() => {
      const lines = reviews.map(
        (r) =>
          `${r.reviewerEmail}: ${r.note?.slice(0, 80) ?? "no comment"}${
            (r.note?.length ?? 0) > 80 ? "…" : ""
          }`
      );
      const synth =
        lines.join("\n") +
        "\n\nAI summary: mixed signals across reviewers — see per-criterion gaps and align on the next step.";
      onPatchSummary(synth);
      setGenerating(false);
    }, 800);
  }

  const criteria = step.scorecard?.criteria ?? [];

  return (
    <div className="space-y-3">
      {reviews.map((rv, idx) => {
        const expanded = expandedId === rv.id;
        return (
          <article
            key={rv.id}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white"
          >
            <button
              type="button"
              onClick={() => setExpandedId(expanded ? null : rv.id)}
              className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-gray-50"
            >
              <ReviewerChip
                reviewerId={rv.reviewerId}
                email={rv.reviewerEmail}
                timeLabel={formatTimeAgo(
                  rv.editedAtISO ?? rv.submittedAtISO
                )}
                edited={Boolean(rv.editedAtISO)}
              />
              <div className="ml-auto flex items-center gap-2">
                {rv.overallScore != null && (
                  <span className="text-base font-semibold tabular-nums text-gray-900">
                    {rv.overallScore}/10
                  </span>
                )}
                {rv.verdict && (
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold",
                      VERDICT_TONE[rv.verdict]
                    )}
                  >
                    {rv.verdict}
                  </span>
                )}
                {expanded ? (
                  <ChevronUp size={14} className="text-gray-400" />
                ) : (
                  <ChevronDown size={14} className="text-gray-400" />
                )}
              </div>
            </button>

            {expanded && (
              <div className="border-t border-gray-100 px-4 py-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[180px_1fr]">
                  {/* Radar */}
                  <RadarChart
                    axes={(rv.criterionScores ?? []).map((c) => c.name)}
                    datasets={[
                      {
                        label: rv.reviewerEmail,
                        values: (rv.criterionScores ?? []).map(
                          (c) => c.score
                        ),
                        color: REVIEW_COLORS[idx % REVIEW_COLORS.length],
                      },
                    ]}
                    size={180}
                  />

                  {/* Chips */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Scores by Criteria
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(rv.criterionScores ?? []).map((c) => (
                        <span
                          key={c.criterionId}
                          title={c.note ?? "no comment"}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium",
                            scoreTone(c.score)
                          )}
                        >
                          {c.name}
                          <span className="font-semibold">
                            {c.score}/10
                          </span>
                        </span>
                      ))}
                    </div>

                    <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Note
                    </p>
                    <div className="mt-1 flex items-start justify-between gap-2 rounded border border-gray-100 bg-gray-50 px-3 py-2">
                      <p className="whitespace-pre-line text-sm text-gray-700">
                        {rv.note}
                      </p>
                      <button
                        type="button"
                        onClick={() => onEditReview(rv)}
                        className="shrink-0 rounded p-1 text-gray-400 hover:bg-white hover:text-gray-700"
                      >
                        <Edit3 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </article>
        );
      })}

      {/* AI Reviewer's Note panel */}
      {(reviews.length > 0 || aiSummary) && (
        <div className="rounded-lg border border-violet-100 bg-violet-50/30 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-violet-700">
              <Sparkles size={12} /> Reviewer&rsquo;s Note
            </p>
            {isHr && (
              <button
                type="button"
                onClick={generateSummary}
                disabled={generating || reviews.length === 0}
                className="inline-flex items-center gap-1 rounded-md border border-violet-300 bg-white px-3 py-1 text-[11px] font-medium text-violet-700 hover:bg-violet-100 disabled:opacity-60"
              >
                <Sparkles size={11} />
                {aiSummary ? "Re-generate" : "AI Auto-fill"}
              </button>
            )}
          </div>
          {aiSummary ? (
            <p className="mt-2 whitespace-pre-line text-sm text-gray-700">
              {aiSummary}
            </p>
          ) : (
            <p className="mt-2 text-xs italic text-gray-400">
              {generating
                ? "AI Polishing…"
                : "AI Summary and insight here…"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function scoreTone(score: number): string {
  if (score >= 8) return "bg-emerald-100 text-emerald-700";
  if (score >= 5) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

function formatTimeAgo(iso: string): string {
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
