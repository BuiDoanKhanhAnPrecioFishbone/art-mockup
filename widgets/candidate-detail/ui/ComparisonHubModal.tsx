"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { Candidate, CandidateProfileData } from "@/entities/candidate";
import { RadarChart } from "./RadarChart";

const PALETTE = [
  "#7c3aed",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#0ea5e9",
];

interface CandidateRow {
  candidate: Candidate;
  profile: CandidateProfileData | null;
}

/** Comparison Hub modal — wireframe `3228:224894`. Multi-dimensional
 *  side-by-side analysis of multiple candidates on the same step.
 *  Sidebar lets HR pick which steps to compare on; body shows a
 *  big radar chart + a numeric scoring table; footer surfaces an
 *  AI-generated hiring decision recommendation. */
export function ComparisonHubModal({
  programId,
  stepId,
  anchorCandidateId,
  anchorCandidateName,
  onClose,
}: {
  programId: string;
  stepId: string;
  anchorCandidateId: string;
  anchorCandidateName: string;
  onClose: () => void;
}) {
  const [siblings, setSiblings] = useState<CandidateRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([
    anchorCandidateId,
  ]);
  const [aiText, setAiText] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Fetch the program's candidates + their profiles. Done in two
  // round-trips for simplicity (the real product would have a
  // batched endpoint).
  useEffect(() => {
    fetch(`/api/programs/${programId}`)
      .then((r) => r.json())
      .then(async (programData) => {
        const candRes = await fetch(`/api/programs/${programId}/candidates`);
        const candData = await candRes.json();
        const candidates: Candidate[] = candData.candidates ?? [];
        const rows: CandidateRow[] = await Promise.all(
          candidates.map(async (c) => {
            const r = await fetch(`/api/candidates/${c.id}/profile`);
            const d = await r.json();
            return { candidate: c, profile: d.profile ?? null };
          })
        );
        setSiblings(rows);
        // Demo: auto-select the first 2 candidates that have reviews
        // for this step.
        const withReviews = rows.filter(
          (r) =>
            (r.profile?.pipeline ?? []).some(
              (p) => p.stepId === stepId && p.reviews.length > 0
            )
        );
        if (withReviews.length > 1) {
          setSelectedIds(
            withReviews.slice(0, 2).map((r) => r.candidate.id)
          );
        }
        // hush unused
        void programData;
      });
  }, [programId, stepId]);

  // Derive the per-candidate criterion averages used by the chart +
  // table. Each candidate's score on a criterion = average across
  // their reviews on this step.
  const matrix = useMemo(() => {
    const selected = siblings.filter((r) =>
      selectedIds.includes(r.candidate.id)
    );
    const axesSet = new Set<string>();
    const data: { id: string; name: string; values: Record<string, number> }[] =
      [];
    for (const row of selected) {
      const progress = (row.profile?.pipeline ?? []).find(
        (p) => p.stepId === stepId
      );
      const scores: Record<string, number[]> = {};
      for (const rv of progress?.reviews ?? []) {
        for (const c of rv.criterionScores ?? []) {
          axesSet.add(c.name);
          if (!scores[c.name]) scores[c.name] = [];
          scores[c.name].push(c.score);
        }
      }
      const avg: Record<string, number> = {};
      for (const [name, vals] of Object.entries(scores)) {
        avg[name] = vals.reduce((a, b) => a + b, 0) / vals.length;
      }
      data.push({
        id: row.candidate.id,
        name: row.candidate.name,
        values: avg,
      });
    }
    const axes = Array.from(axesSet);
    return { axes, data };
  }, [siblings, selectedIds, stepId]);

  function generateInsight() {
    setGenerating(true);
    window.setTimeout(() => {
      const names = matrix.data.map((d) => d.name);
      const text = `Hiring Decision:
${names[0] ?? "Candidate A"} edges ahead on technical depth, while ${
        names[1] ?? "Candidate B"
      } shows stronger communication. Recommended next step: schedule a culture-fit follow-up with both before final decision.`;
      setAiText(text);
      setGenerating(false);
    }, 800);
  }

  const eligibleSiblings = siblings.filter((r) =>
    (r.profile?.pipeline ?? []).some(
      (p) => p.stepId === stepId && p.reviews.length > 0
    )
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Comparison Hub
            </h2>
            <p className="text-xs text-gray-500">
              Multidimensional analysis, visual comparisons, and
              AI-assisted decision making.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid flex-1 grid-cols-[200px_1fr] overflow-hidden">
          {/* Sidebar — candidate picker (chip list) */}
          <aside className="overflow-y-auto border-r border-gray-100 px-3 py-3">
            <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Candidates *
            </p>
            <ul className="space-y-1">
              {eligibleSiblings.map((row) => {
                const active = selectedIds.includes(row.candidate.id);
                return (
                  <li key={row.candidate.id}>
                    <label
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-xs",
                        active
                          ? "border-violet-300 bg-violet-50 text-violet-700"
                          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={(e) =>
                          setSelectedIds((ids) =>
                            e.target.checked
                              ? [...ids, row.candidate.id]
                              : ids.filter((id) => id !== row.candidate.id)
                          )
                        }
                        className="h-3.5 w-3.5 rounded border-gray-300 text-violet-600"
                      />
                      <span className="truncate">{row.candidate.name}</span>
                    </label>
                  </li>
                );
              })}
              {eligibleSiblings.length === 0 && (
                <li className="px-2 py-2 text-xs text-gray-400">
                  No comparable candidates yet.
                </li>
              )}
            </ul>
          </aside>

          {/* Body */}
          <div className="flex flex-col overflow-y-auto">
            <div className="grid flex-1 grid-cols-1 gap-4 p-6 md:grid-cols-[1fr_1.2fr]">
              {/* Chart */}
              <div>
                {matrix.data.length === 0 || matrix.axes.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <>
                    <RadarChart
                      axes={matrix.axes}
                      datasets={matrix.data.map((d, i) => ({
                        label: d.name,
                        values: matrix.axes.map((a) => d.values[a] ?? 0),
                        color: PALETTE[i % PALETTE.length],
                      }))}
                      size={260}
                    />
                    {/* Legend */}
                    <div className="mt-2 flex flex-wrap gap-3 text-[11px]">
                      {matrix.data.map((d, i) => (
                        <span
                          key={d.id}
                          className="inline-flex items-center gap-1 text-gray-700"
                        >
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{
                              background: PALETTE[i % PALETTE.length],
                            }}
                          />
                          {d.name}
                          {d.id === anchorCandidateId &&
                            " (this candidate)"}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Score table */}
              {matrix.axes.length > 0 && (
                <ScoreTable matrix={matrix} />
              )}
            </div>

            {/* AI Insight */}
            <div className="border-t border-gray-100 bg-violet-50/30 p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-violet-700">
                  <Sparkles size={12} /> AI Insight
                </p>
                <button
                  type="button"
                  onClick={generateInsight}
                  disabled={generating || matrix.data.length < 2}
                  className="inline-flex items-center gap-1 rounded-md border border-violet-300 bg-white px-2.5 py-1 text-[11px] text-violet-700 hover:bg-violet-100 disabled:opacity-60"
                  title={
                    matrix.data.length < 2
                      ? "Pick at least two candidates first"
                      : ""
                  }
                >
                  <Sparkles size={11} />
                  {generating
                    ? "Generating…"
                    : aiText
                      ? "Re-generate"
                      : "Generate"}
                </button>
              </div>
              {aiText ? (
                <p className="mt-2 whitespace-pre-line text-sm text-gray-700">
                  {aiText}
                </p>
              ) : (
                <p className="mt-2 text-xs italic text-gray-400">
                  Generate to surface side-by-side strengths, gaps, and a
                  recommended next step. Anchored to {anchorCandidateName}.
                </p>
              )}
            </div>
          </div>
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

/* ---------- Score table ---------- */

function ScoreTable({
  matrix,
}: {
  matrix: {
    axes: string[];
    data: { id: string; name: string; values: Record<string, number> }[];
  };
}) {
  function tone(value: number, others: number[]): string {
    const max = Math.max(...others, value);
    if (value === max && others.some((v) => v < max))
      return "bg-emerald-50 text-emerald-700";
    if (value > 0 && value < max - 1) return "bg-red-50 text-red-700";
    return "text-gray-700";
  }

  return (
    <div className="overflow-x-auto rounded-md border border-gray-200">
      <table className="min-w-full text-xs">
        <thead className="bg-gray-50 text-left text-[11px] uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-3 py-2 font-medium">Criteria</th>
            {matrix.data.map((d) => (
              <th key={d.id} className="px-3 py-2 font-medium">
                {d.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.axes.map((a) => {
            const row = matrix.data.map((d) => d.values[a] ?? 0);
            return (
              <tr key={a} className="border-t border-gray-100">
                <td className="px-3 py-2 font-medium text-gray-700">{a}</td>
                {matrix.data.map((d, i) => {
                  const v = d.values[a] ?? 0;
                  return (
                    <td
                      key={d.id}
                      className={cn(
                        "px-3 py-2 tabular-nums",
                        tone(v, row.filter((_, idx) => idx !== i))
                      )}
                    >
                      {v > 0 ? v.toFixed(1) : "—"}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Empty state ---------- */

function EmptyChart() {
  return (
    <div className="flex h-64 flex-col items-center justify-center rounded-md border border-dashed border-gray-200 bg-gray-50/40 px-6 text-center">
      <span className="text-2xl">⭐️</span>
      <p className="mt-2 text-xs font-semibold text-gray-700">
        No chart data available
      </p>
      <p className="mt-1 text-[11px] text-gray-500">
        To view the comparison radar chart, you must select at least 1
        Reviewer in the assessment framework.
      </p>
    </div>
  );
}
