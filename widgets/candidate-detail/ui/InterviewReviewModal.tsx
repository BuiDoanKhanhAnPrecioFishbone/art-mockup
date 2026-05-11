"use client";

import { useMemo, useState } from "react";
import { Check, Sparkles, X } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import {
  REVIEW_VERDICTS,
  type InterviewCriterionScore,
  type ReviewVerdict,
  type StepReview,
} from "@/entities/candidate";
import type { WorkflowStep } from "@/entities/program";

/** Interview Review modal — wireframe `3228:224676` (3 variants).
 *  Sidebar of criteria + Overall Grade. Body switches between
 *  per-criterion 1-10 scoring (with band hint + per-criterion note)
 *  and the Overall Grade pane (1-10 + Result + Overall Note + AI
 *  Smart Polish). */
export function InterviewReviewModal({
  step,
  existing,
  onSave,
  onClose,
}: {
  step: WorkflowStep;
  existing: StepReview | null;
  onSave: (review: StepReview) => void;
  onClose: () => void;
}) {
  const criteria = step.scorecard?.criteria ?? [];

  // Hydrate the editor state from the existing review (if editing) or
  // a blank scaffold based on the step's scorecard.
  const [scores, setScores] = useState<InterviewCriterionScore[]>(() => {
    if (existing?.criterionScores) return existing.criterionScores;
    return criteria.map((c) => ({
      criterionId: c.id,
      name: c.name,
      score: 0,
    }));
  });
  const [overallScore, setOverallScore] = useState<number>(
    existing?.overallScore ?? 0
  );
  const [verdict, setVerdict] = useState<ReviewVerdict>(
    existing?.verdict ?? "Consider"
  );
  const [overallNote, setOverallNote] = useState(existing?.note ?? "");
  const [activeTab, setActiveTab] = useState<string>(
    criteria[0]?.id ?? "overall"
  );
  const [polishing, setPolishing] = useState(false);

  const tabs = useMemo(
    () => [
      ...criteria.map((c) => ({ id: c.id, label: c.name })),
      { id: "overall", label: "Overall Grade" },
    ],
    [criteria]
  );

  const completed = useMemo(() => {
    const ids = new Set<string>();
    for (const s of scores) if (s.score > 0) ids.add(s.criterionId);
    if (overallScore > 0) ids.add("overall");
    return ids;
  }, [scores, overallScore]);

  function patchScore(
    criterionId: string,
    patch: Partial<InterviewCriterionScore>
  ) {
    setScores((prev) =>
      prev.map((s) => (s.criterionId === criterionId ? { ...s, ...patch } : s))
    );
  }

  function smartPolish() {
    setPolishing(true);
    window.setTimeout(() => {
      const polished =
        overallNote.trim().length > 0
          ? `${overallNote.trim()}\n\n[Polished by AI]`
          : "Candidate demonstrates strong technical foundations across most criteria. Communication needs follow-up; technical depth is on-bar for the role.";
      setOverallNote(polished);
      setPolishing(false);
    }, 800);
  }

  function submit() {
    const review: StepReview = {
      id: existing?.id ?? `rv-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      reviewerId: existing?.reviewerId ?? "u-current",
      reviewerEmail: existing?.reviewerEmail ?? "you@art.com",
      submittedAtISO: existing?.submittedAtISO ?? new Date().toISOString(),
      editedAtISO: existing ? new Date().toISOString() : undefined,
      criterionScores: scores,
      overallScore,
      verdict,
      note: overallNote,
    };
    onSave(review);
  }

  const isOverall = activeTab === "overall";
  const activeScore = scores.find((s) => s.criterionId === activeTab) ?? null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-violet-50 text-violet-600">
              📝
            </span>
            <h2 className="text-lg font-semibold text-gray-900">
              Interview Review
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body — sidebar + pane */}
        <div className="grid flex-1 grid-cols-[200px_1fr] overflow-hidden">
          {/* Sidebar */}
          <aside className="overflow-y-auto border-r border-gray-100 py-3">
            <ul>
              {tabs.map((t) => {
                const active = activeTab === t.id;
                const done = completed.has(t.id);
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => setActiveTab(t.id)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-sm transition-colors",
                        active
                          ? "border-l-2 border-violet-600 bg-violet-50 text-violet-700"
                          : "border-l-2 border-transparent text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <span>{t.label}</span>
                      {done && (
                        <Check
                          size={13}
                          className="text-emerald-500"
                          aria-label="Scored"
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Pane */}
          <div className="flex-1 overflow-y-auto p-6">
            {isOverall ? (
              <OverallPane
                overallScore={overallScore}
                onScore={setOverallScore}
                verdict={verdict}
                onVerdict={setVerdict}
                overallNote={overallNote}
                onNote={setOverallNote}
                onPolish={smartPolish}
                polishing={polishing}
              />
            ) : activeScore ? (
              <CriterionPane
                name={activeScore.name}
                score={activeScore.score}
                note={activeScore.note ?? ""}
                onScore={(n) => patchScore(activeTab, { score: n })}
                onNote={(n) => patchScore(activeTab, { note: n })}
              />
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={overallScore === 0}
            className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-300"
            title={overallScore === 0 ? "Set an Overall Grade first" : ""}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Per-criterion pane ---------- */

const SCORE_BANDS = [
  { range: [1, 2], label: "Beginner", desc: "Limited exposure; needs heavy guidance." },
  { range: [3, 4], label: "Working", desc: "Can complete tasks with some guidance." },
  { range: [5, 6], label: "Intermediate", desc: "Meets basic standards. Designs practical systems. Knows how to handle N+1 queries and caching." },
  { range: [7, 8], label: "Advanced", desc: "Proactively raises the bar; mentors others." },
  { range: [9, 10], label: "Excellent", desc: "Industry-leading; sets new standards." },
];

function CriterionPane({
  name,
  score,
  note,
  onScore,
  onNote,
}: {
  name: string;
  score: number;
  note: string;
  onScore: (n: number) => void;
  onNote: (n: string) => void;
}) {
  const band = SCORE_BANDS.find(
    (b) => score >= b.range[0] && score <= b.range[1]
  );
  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900">{name}</h3>

      <div className="mt-4 flex items-center gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
          const active = score === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onScore(active ? 0 : n)}
              className={cn(
                "h-8 w-8 rounded border text-xs font-semibold",
                active
                  ? "border-violet-600 bg-violet-600 text-white"
                  : "border-gray-200 text-gray-700 hover:border-violet-300 hover:bg-violet-50"
              )}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div className="mt-1 grid grid-cols-5 text-[10px] text-gray-400">
        <span>Poor</span>
        <span className="text-center">Beginner</span>
        <span className="text-center">Intermediate</span>
        <span className="text-center">Advanced</span>
        <span className="text-right">Excellent</span>
      </div>

      {band && (
        <div className="mt-4 rounded-md border border-violet-100 bg-violet-50/50 px-3 py-2 text-xs text-gray-700">
          <p className="font-semibold text-violet-700">
            Score range: {band.range[0]}-{band.range[1]} ({band.label})
          </p>
          <p className="mt-0.5 text-gray-600">{band.desc}</p>
        </div>
      )}

      <label className="mt-5 block text-xs font-medium text-gray-700">
        Note (Score explanation)
      </label>
      <textarea
        rows={4}
        value={note}
        onChange={(e) => onNote(e.target.value)}
        placeholder="Quick note for this skill…"
        className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
      />
    </div>
  );
}

/* ---------- Overall pane ---------- */

function OverallPane({
  overallScore,
  onScore,
  verdict,
  onVerdict,
  overallNote,
  onNote,
  onPolish,
  polishing,
}: {
  overallScore: number;
  onScore: (n: number) => void;
  verdict: ReviewVerdict;
  onVerdict: (v: ReviewVerdict) => void;
  overallNote: string;
  onNote: (n: string) => void;
  onPolish: () => void;
  polishing: boolean;
}) {
  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900">Overall Grade</h3>

      <div className="mt-4 flex items-center gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
          const active = overallScore === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onScore(active ? 0 : n)}
              className={cn(
                "h-8 w-8 rounded border text-xs font-semibold",
                active
                  ? "border-violet-600 bg-violet-600 text-white"
                  : "border-gray-200 text-gray-700 hover:border-violet-300 hover:bg-violet-50"
              )}
            >
              {n}
            </button>
          );
        })}
      </div>

      <p className="mt-5 text-xs font-medium text-gray-700">Result</p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {REVIEW_VERDICTS.map((v) => {
          const active = verdict === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onVerdict(v)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-medium",
                active
                  ? "border-violet-600 bg-violet-600 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              )}
            >
              {v}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <label className="block text-xs font-medium text-gray-700">
          Overall Note
        </label>
        <button
          type="button"
          onClick={onPolish}
          disabled={polishing}
          className="inline-flex items-center gap-1 rounded-md border border-violet-300 bg-white px-2 py-1 text-[11px] text-violet-700 hover:bg-violet-50 disabled:opacity-60"
        >
          <Sparkles size={11} />
          {polishing ? "Polishing…" : "AI Smart Polish"}
        </button>
      </div>
      <textarea
        rows={5}
        value={overallNote}
        onChange={(e) => onNote(e.target.value)}
        placeholder="Comment your overall impression…"
        className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
      />
    </div>
  );
}
