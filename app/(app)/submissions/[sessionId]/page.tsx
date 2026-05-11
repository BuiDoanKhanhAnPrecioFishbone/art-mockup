"use client";

import { useEffect, useMemo, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import {
  FilterButton,
  FilterModal,
  countActiveFilters,
  isFieldActive,
  type FilterField,
  type FilterValues,
} from "@/shared/ui/filter";
import {
  SESSION_STATUS_TONE,
  deriveIntegrityStatus,
  type SessionStatus,
  type Submission,
  type SubmissionStatus,
  type Test,
  type TestSession,
} from "@/entities/test";

const STATUS_LABEL: Record<SubmissionStatus, string> = {
  "in-progress": "In progress",
  submitted: "Submitted",
  graded: "Graded",
  abandoned: "Abandoned",
};

const STATUS_TONE: Record<SubmissionStatus, string> = {
  "in-progress": "bg-amber-100 text-amber-700",
  submitted: "bg-sky-100 text-sky-700",
  graded: "bg-emerald-100 text-emerald-700",
  abandoned: "bg-gray-200 text-gray-600",
};

export default function SessionSubmissionsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const [session, setSession] = useState<TestSession | null>(null);
  const [test, setTest] = useState<Test | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValues>({});

  useEffect(() => {
    fetch(`/api/submissions/${sessionId}`)
      .then((r) => r.json())
      .then((d) => {
        setSession(d.session ?? null);
        setTest(d.test ?? null);
        setSubmissions(d.submissions ?? []);
      });
  }, [sessionId]);

  const fields: FilterField[] = useMemo(
    () => [
      {
        id: "status",
        label: "Status",
        kind: "multi-select",
        options: (
          ["in-progress", "submitted", "graded", "abandoned"] as SubmissionStatus[]
        ).map((s) => ({ value: s, label: STATUS_LABEL[s] })),
      },
      {
        id: "integrity",
        label: "Integrity",
        kind: "multi-select",
        options: [
          { value: "Undetected", label: "Undetected" },
          { value: "Cheating", label: "Cheating" },
        ],
      },
    ],
    []
  );

  const filtered = submissions.filter((s) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !s.candidateName.toLowerCase().includes(q) &&
        !s.candidateEmail.toLowerCase().includes(q)
      )
        return false;
    }
    const st = filterValues.status;
    if (isFieldActive(st) && st?.kind === "multi-select") {
      if (!st.values.includes(s.status)) return false;
    }
    const it = filterValues.integrity;
    if (isFieldActive(it) && it?.kind === "multi-select") {
      const status = deriveIntegrityStatus(s.integrity);
      if (!it.values.includes(status)) return false;
    }
    return true;
  });

  if (!session) {
    return (
      <div className="px-8 py-12 text-center text-sm text-gray-500">
        Loading session…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-8 py-5">
        <Link
          href="/submissions"
          className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={13} /> Back to Submissions
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs text-gray-400">Assessment / Submission</p>
            <h1 className="mt-1 text-xl font-bold text-gray-900">
              {session.name}
            </h1>
            <p className="mt-1 text-xs text-gray-500">
              {test ? `${test.title} · ${test.durationMinutes} min` : "Test"} ·
              Type: <strong>{session.type}</strong> · Access code:{" "}
              <span className="font-mono">{session.accessCode}</span>
            </p>
          </div>
          <SessionStatusPill status={session.status} />
        </div>
      </header>

      <div className="px-8 py-6">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 px-4 py-3">
            <div className="relative max-w-md flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by candidate name or email…"
                className="h-9 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm focus:border-violet-500 focus:outline-none"
              />
            </div>
            <FilterButton
              activeCount={countActiveFilters(filterValues)}
              onClick={() => setFilterOpen(true)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              {/* Wireframe columns (Reviewer view): Candidate / Status
               *  / Total of Score / Question Breakdown (Easy / Medium
               *  / Hard) / Comment / Final Result / Integrity. The
               *  per-difficulty cells aggregate from the submission's
               *  questionResults rows. */}
              <thead className="bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th rowSpan={2} className="p-3 align-bottom">
                    Candidate
                  </th>
                  <th rowSpan={2} className="p-3 align-bottom">
                    Status
                  </th>
                  <th rowSpan={2} className="p-3 align-bottom">
                    Total of Score
                  </th>
                  <th
                    colSpan={3}
                    className="border-b border-gray-100 p-3 text-center"
                  >
                    Question Breakdown
                  </th>
                  <th rowSpan={2} className="p-3 align-bottom">
                    Comment
                  </th>
                  <th rowSpan={2} className="p-3 align-bottom">
                    Final Result
                  </th>
                  <th rowSpan={2} className="p-3 align-bottom">
                    Integrity
                  </th>
                  <th
                    rowSpan={2}
                    className="w-12 p-3 text-right align-bottom"
                  >
                    Action
                  </th>
                </tr>
                <tr>
                  <th className="p-2 text-[10px]">Easy</th>
                  <th className="p-2 text-[10px]">Medium</th>
                  <th className="p-2 text-[10px]">Hard</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const integrityStatus = deriveIntegrityStatus(s.integrity);
                  const breakdown = computeBreakdown(s);
                  const verdict = s.finalReview ?? "Pending";
                  const comment = s.aiReviewerNotes;
                  return (
                    <tr key={s.id} className="border-t border-gray-100">
                      <td className="p-3">
                        <p className="font-medium text-gray-900">
                          {s.candidateName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {s.candidateEmail}
                        </p>
                      </td>
                      <td className="p-3">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
                            STATUS_TONE[s.status]
                          )}
                        >
                          {STATUS_LABEL[s.status]}
                        </span>
                        {s.forceSubmitted && (
                          <span className="ml-1.5 rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-rose-700">
                            Force-submitted
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {typeof s.scorePercent === "number" ? (
                          <ScoreBar percent={s.scorePercent} />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <BreakdownCell row={breakdown.easy} />
                      <BreakdownCell row={breakdown.medium} />
                      <BreakdownCell row={breakdown.hard} />
                      <td className="max-w-[220px] p-3 text-xs text-gray-700">
                        {comment ? (
                          <span className="line-clamp-2" title={comment}>
                            {comment}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <FinalResultPill verdict={verdict} />
                      </td>
                      <td className="p-3">
                        <span
                          className={cn(
                            "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                            integrityStatus === "Cheating"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-emerald-100 text-emerald-700"
                          )}
                        >
                          {integrityStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Link
                          href={`/submissions/${session.id}/${s.id}`}
                          className="text-xs font-medium text-violet-600 hover:text-violet-800"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="p-12 text-center text-sm text-gray-400"
                    >
                      No submissions match your filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <FilterModal
        open={filterOpen}
        fields={fields}
        initialValues={filterValues}
        onApply={(v) => {
          setFilterValues(v);
          setFilterOpen(false);
        }}
        onCancel={() => setFilterOpen(false)}
      />
    </div>
  );
}

function SessionStatusPill({ status }: { status: SessionStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        SESSION_STATUS_TONE[status]
      )}
    >
      {status}
    </span>
  );
}

function ScoreBar({ percent }: { percent: number }) {
  const tone =
    percent >= 80
      ? "bg-emerald-500"
      : percent >= 50
        ? "bg-amber-500"
        : "bg-rose-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-200">
        <div
          className={cn("h-full transition-all", tone)}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
      <span className="text-xs font-medium text-gray-700">{percent}%</span>
    </div>
  );
}

/* ---------- Per-difficulty breakdown helpers ---------- */

interface BreakdownRow {
  scored: number;
  max: number;
}

function emptyRow(): BreakdownRow {
  return { scored: 0, max: 0 };
}

/** Aggregate the submission's per-question results into 3 buckets
 *  (Easy / Medium / Hard). Difficulty is read from each row's
 *  string field; rows without a recognised difficulty fall back to
 *  Medium. Returns zero-rows for buckets the candidate had no
 *  questions in. */
function computeBreakdown(s: Submission): {
  easy: BreakdownRow;
  medium: BreakdownRow;
  hard: BreakdownRow;
} {
  const easy = emptyRow();
  const medium = emptyRow();
  const hard = emptyRow();
  for (const r of s.questionResults ?? []) {
    const target =
      r.difficulty === "Easy"
        ? easy
        : r.difficulty === "Hard"
          ? hard
          : medium;
    target.scored += r.scored;
    target.max += r.max;
  }
  return { easy, medium, hard };
}

function BreakdownCell({ row }: { row: BreakdownRow }) {
  if (row.max === 0) {
    return (
      <td className="p-3 text-center text-xs text-gray-300">—</td>
    );
  }
  return (
    <td className="p-3 text-center text-xs font-medium tabular-nums text-gray-800">
      {row.scored}/{row.max} pts
    </td>
  );
}

const FINAL_RESULT_TONE: Record<string, string> = {
  Passed: "bg-emerald-100 text-emerald-700",
  Failed: "bg-rose-100 text-rose-700",
  "Under Review": "bg-amber-100 text-amber-700",
  Pending: "bg-gray-100 text-gray-600",
};

function FinalResultPill({ verdict }: { verdict: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold",
        FINAL_RESULT_TONE[verdict] ?? FINAL_RESULT_TONE.Pending
      )}
    >
      {verdict}
    </span>
  );
}
