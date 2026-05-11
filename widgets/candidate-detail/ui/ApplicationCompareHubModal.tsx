"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import {
  APPLICATION_OUTCOME_TONE,
  type ApplicationStageFeedback,
  type ApplicationStageRating,
  type CandidateApplicationHistory,
} from "@/entities/candidate";

const RATING_TONE: Record<
  NonNullable<ApplicationStageRating["tone"]>,
  string
> = {
  good: "bg-emerald-100 text-emerald-700",
  ok: "bg-amber-100 text-amber-700",
  bad: "bg-red-100 text-red-700",
  neutral: "bg-gray-100 text-gray-700",
};

const HEADLINE_TONE_RE = /(\d+(?:\.\d+)?)\s*\/\s*\d/;

/** Application Comparison Hub — wireframe `3228:226099`. Compares two
 *  past applications side-by-side; AI Insight banner at the top, then
 *  one column per application showing program meta + a stack of
 *  stage-feedback cards. */
export function ApplicationCompareHubModal({
  history,
  onClose,
}: {
  history: CandidateApplicationHistory[];
  onClose: () => void;
}) {
  // Default selection: first application + the next one.
  const [leftId, setLeftId] = useState<string>(history[0]?.id ?? "");
  const [rightId, setRightId] = useState<string>(history[1]?.id ?? "");

  const left = history.find((h) => h.id === leftId) ?? history[0];
  const right = history.find((h) => h.id === rightId) ?? history[1];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-4">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-violet-50 text-violet-600">
              ⚖️
            </span>
            <div>
              <h2 className="inline-flex items-center gap-1.5 text-lg font-semibold text-gray-900">
                Comparison Hub
                <span
                  title="Side-by-side view of past applications"
                  className="grid h-4 w-4 cursor-help place-items-center rounded-full bg-gray-200 text-[10px] text-gray-600"
                >
                  ?
                </span>
              </h2>
              <p className="text-xs text-gray-500">
                Multidimensional analysis, visual comparisons, and
                AI-assisted decision making.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Application pickers — only show if more than 2 applications */}
        {history.length > 2 && (
          <div className="grid grid-cols-2 gap-4 border-b border-gray-100 bg-gray-50 px-6 py-3">
            <ApplicationPicker
              label="Application A"
              value={leftId}
              options={history.filter((h) => h.id !== rightId)}
              onChange={setLeftId}
            />
            <ApplicationPicker
              label="Application B"
              value={rightId}
              options={history.filter((h) => h.id !== leftId)}
              onChange={setRightId}
            />
          </div>
        )}

        {/* Body — two columns */}
        <div className="grid flex-1 grid-cols-1 gap-0 overflow-y-auto md:grid-cols-2 md:divide-x md:divide-gray-100">
          {[left, right].map((app, i) =>
            app ? (
              <ApplicationColumn key={app.id + i} application={app} />
            ) : (
              <div
                key={i}
                className="p-6 text-center text-sm text-gray-400"
              >
                Pick another application to compare.
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Per-application column ---------- */

function ApplicationColumn({
  application,
}: {
  application: CandidateApplicationHistory;
}) {
  return (
    <div className="space-y-3 p-5">
      {/* AI Insight banner — wireframe purple panel */}
      {application.aiInsight && (
        <div className="rounded-lg border border-violet-100 bg-violet-50/40 p-3">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-violet-700">
            <Sparkles size={11} /> AI Insight
          </p>
          <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-gray-700">
            {application.aiInsight}
          </p>
        </div>
      )}

      {/* Application meta */}
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900">
            {application.jobTitle} - {application.jobLevel}
          </p>
          <span
            className={cn(
              "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold",
              APPLICATION_OUTCOME_TONE[application.outcome]
            )}
          >
            {application.outcome}
          </span>
        </div>
        <p className="text-[11px] text-gray-500">
          {formatRange(application.startDate, application.endDate)}
        </p>
      </div>

      {/* Per-stage cards */}
      <div className="space-y-2">
        {(application.stageFeedback ?? []).map((sf, i) => (
          <StageCard key={sf.stageName + i} feedback={sf} />
        ))}
        {!application.stageFeedback?.length && (
          <p className="rounded-md border border-dashed border-gray-200 px-3 py-4 text-center text-xs text-gray-400">
            No stage feedback recorded for this application.
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------- Stage card ---------- */

function StageCard({ feedback }: { feedback: ApplicationStageFeedback }) {
  const headlineTone = headlineToneFor(
    feedback.headlineScore,
    feedback.outcomeChip
  );
  return (
    <article className="overflow-hidden rounded-md border border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 bg-gray-50 px-3 py-2">
        <p className="text-xs font-semibold text-gray-900">
          {feedback.stageName}
        </p>
        <div className="flex items-center gap-1.5">
          {feedback.headlineScore && (
            <span
              className={cn(
                "inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold",
                headlineTone
              )}
            >
              {feedback.headlineScore}
            </span>
          )}
          {feedback.outcomeChip && (
            <span
              className={cn(
                "inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold",
                feedback.outcomeChip === "Passed"
                  ? "bg-emerald-100 text-emerald-700"
                  : feedback.outcomeChip === "Failed"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700"
              )}
            >
              {feedback.outcomeChip}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="space-y-2 px-3 py-2.5">
        <p className="whitespace-pre-line text-xs text-gray-700">
          {feedback.summary}
        </p>

        {feedback.ratings && feedback.ratings.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {feedback.ratings.map((r) => (
              <span
                key={r.name}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium",
                  RATING_TONE[r.tone ?? "neutral"]
                )}
              >
                {r.name}
                <span className="font-semibold">{r.value}</span>
              </span>
            ))}
          </div>
        )}

        {feedback.failureReason && (
          <p className="mt-2 rounded border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-medium text-red-700">
            {feedback.failureReason}
          </p>
        )}
      </div>
    </article>
  );
}

function headlineToneFor(
  headline: string | undefined,
  outcome: string | undefined
): string {
  if (!headline) return "bg-gray-100 text-gray-700";
  if (outcome === "Passed") return "bg-emerald-100 text-emerald-700";
  if (outcome === "Failed") return "bg-red-100 text-red-700";
  const m = HEADLINE_TONE_RE.exec(headline);
  if (m) {
    const score = Number(m[1]);
    if (!Number.isNaN(score)) {
      if (score >= 7) return "bg-emerald-100 text-emerald-700";
      if (score >= 5) return "bg-amber-100 text-amber-700";
      return "bg-red-100 text-red-700";
    }
  }
  return "bg-gray-100 text-gray-700";
}

/* ---------- Application picker ---------- */

function ApplicationPicker({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: CandidateApplicationHistory[];
  onChange: (id: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-gray-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.programName} ({o.outcome})
          </option>
        ))}
      </select>
    </label>
  );
}

/* ---------- helpers ---------- */

function formatRange(start: string, end?: string): string {
  const fmt = (s?: string) => {
    if (!s) return "—";
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };
  if (!end) return `${fmt(start)} → present`;
  return `${fmt(start)} → ${fmt(end)}`;
}
