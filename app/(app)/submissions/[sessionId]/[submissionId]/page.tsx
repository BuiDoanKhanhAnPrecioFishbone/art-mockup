"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Eye,
  Sparkles,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useToast } from "@/shared/ui/toast";
import {
  deriveIntegrityStatus,
  type Submission,
  type SubmissionFinalReview,
  type Test,
  type TestSession,
} from "@/entities/test";

const FINAL_REVIEWS: SubmissionFinalReview[] = [
  "Pending",
  "Under Review",
  "Passed",
  "Failed",
];

const REVIEW_TONE: Record<SubmissionFinalReview, string> = {
  Pending: "bg-gray-100 text-gray-600",
  "Under Review": "bg-amber-100 text-amber-700",
  Passed: "bg-emerald-100 text-emerald-700",
  Failed: "bg-rose-100 text-rose-700",
};

export default function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string; submissionId: string }>;
}) {
  const { sessionId, submissionId } = use(params);
  const { showToast } = useToast();
  const [session, setSession] = useState<TestSession | null>(null);
  const [test, setTest] = useState<Test | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    fetch(`/api/submissions/${sessionId}`)
      .then((r) => r.json())
      .then((d) => {
        setSession(d.session ?? null);
        setTest(d.test ?? null);
        const found = (d.submissions ?? []).find(
          (s: Submission) => s.id === submissionId
        );
        setSubmission(found ?? null);
      });
  }, [sessionId, submissionId]);

  if (!submission || !session) {
    return (
      <div className="px-8 py-12 text-center text-sm text-gray-500">
        Loading submission…
      </div>
    );
  }

  const integrityStatus = deriveIntegrityStatus(submission.integrity);

  function setFinalReview(v: SubmissionFinalReview) {
    setSubmission((prev) => (prev ? { ...prev, finalReview: v } : prev));
    showToast("success", `Final review marked as "${v}".`);
  }

  function rewriteWithAi() {
    showToast(
      "success",
      "AI rewrite is a mock action in this demo — note unchanged."
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-8 py-5">
        <Link
          href={`/submissions/${session.id}`}
          className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={13} /> Back to {session.name}
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {submission.candidateName}
            </h1>
            <p className="text-xs text-gray-500">{submission.candidateEmail}</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase",
                integrityStatus === "Cheating"
                  ? "bg-rose-100 text-rose-700"
                  : "bg-emerald-100 text-emerald-700"
              )}
            >
              {integrityStatus === "Cheating" ? (
                <AlertTriangle size={11} />
              ) : (
                <CheckCircle2 size={11} />
              )}
              {integrityStatus}
            </span>
            {submission.finalReview && (
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                  REVIEW_TONE[submission.finalReview]
                )}
              >
                {submission.finalReview}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 px-8 py-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Left column — overview, skills, integrity, questions */}
        <div className="space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">
              Test Result Overview
            </h2>
            <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
              <Stat label="Test" value={test?.title ?? "—"} />
              <Stat
                label="Pass ratio"
                value={`${test?.passRatioPercent ?? "—"}%`}
              />
              <Stat
                label="Submitted"
                value={
                  submission.submittedAtISO
                    ? new Date(submission.submittedAtISO).toLocaleString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                    : "—"
                }
              />
              <Stat
                label="Total score"
                value={
                  typeof submission.scorePercent === "number"
                    ? `${submission.scorePercent}%`
                    : "—"
                }
              />
            </dl>

            {/* Difficulty breakdown if present */}
            {submission.questionResults && (
              <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                {(["Easy", "Medium", "Hard"] as const).map((d) => {
                  const rows = submission.questionResults!.filter(
                    (r) => r.difficulty === d
                  );
                  const scored = rows.reduce((acc, r) => acc + r.scored, 0);
                  const max = rows.reduce((acc, r) => acc + r.max, 0);
                  return (
                    <div
                      key={d}
                      className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2"
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                        {d}
                      </p>
                      <p className="text-sm font-medium text-gray-800">
                        {rows.length} question{rows.length === 1 ? "" : "s"}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {max > 0 ? `${scored} / ${max} pts` : "—"}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {submission.skillBreakdown && submission.skillBreakdown.length > 0 && (
            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold text-gray-900">
                Skill Performance
              </h2>
              <div className="space-y-3">
                {submission.skillBreakdown.map((s) => (
                  <div key={s.skill}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-700">
                        {s.skill}
                      </span>
                      <span className="text-gray-500">{s.percent}%</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={cn(
                          "h-full transition-all",
                          s.percent >= 80
                            ? "bg-emerald-500"
                            : s.percent >= 50
                              ? "bg-amber-500"
                              : "bg-rose-500"
                        )}
                        style={{ width: `${s.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-gray-900">
              <AlertTriangle size={14} className="text-amber-500" />
              Integrity Summary
            </h2>
            <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-5">
              <Stat
                label="Leaving tab"
                value={`${submission.integrity?.leavingTabCount ?? 0}`}
              />
              <Stat
                label="Copy / Paste"
                value={`${submission.integrity?.copyPasteCount ?? 0}`}
              />
              <Stat
                label="DevTools"
                value={`${submission.integrity?.devtoolsOpenCount ?? 0}`}
              />
              <Stat
                label="Multi-instance"
                value={`${submission.integrity?.multiInstanceCount ?? 0}`}
              />
              <Stat
                label="Multi-monitor"
                value={
                  submission.integrity?.multiMonitorFlag ? "Yes" : "No"
                }
              />
            </div>
          </section>

          {submission.questionResults && (
            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold text-gray-900">
                Question Submission
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="text-left text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="p-2">#</th>
                      <th className="p-2">Title</th>
                      <th className="p-2">Type</th>
                      <th className="p-2">Difficulty</th>
                      <th className="p-2">Tags</th>
                      <th className="p-2 text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submission.questionResults.map((r, i) => (
                      <tr key={r.questionId} className="border-t border-gray-100">
                        <td className="p-2 text-gray-400">{i + 1}</td>
                        <td className="p-2 font-medium text-gray-800">
                          {r.title}
                        </td>
                        <td className="p-2 text-gray-700">{r.type}</td>
                        <td className="p-2 text-gray-700">{r.difficulty}</td>
                        <td className="p-2">
                          <span className="inline-flex flex-wrap gap-1">
                            {r.tags.map((t) => (
                              <span
                                key={t}
                                className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600"
                              >
                                {t}
                              </span>
                            ))}
                          </span>
                        </td>
                        <td className="p-2 text-right">
                          <span className="font-medium text-gray-800">
                            {r.scored}
                          </span>
                          <span className="text-gray-400"> / {r.max}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Link
                href={`/submissions/${sessionId}/${submissionId}/review`}
                className="mt-4 inline-flex items-center gap-1 rounded-lg border border-violet-300 bg-white px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-50"
              >
                <Eye size={12} /> Review full submission
              </Link>
            </section>
          )}
        </div>

        {/* Right column — final review + AI notes */}
        <div className="space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-2 text-sm font-semibold text-gray-900">
              Final Review Result
            </h2>
            <p className="mb-3 text-[11px] text-gray-500">
              HR / Reviewer&rsquo;s verdict — feeds into the candidate&rsquo;s pipeline
              decision.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {FINAL_REVIEWS.map((v) => {
                const active = submission.finalReview === v;
                return (
                  <button
                    key={v}
                    onClick={() => setFinalReview(v)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                      active
                        ? "border-violet-500 bg-violet-50 text-violet-700"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    {v}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border border-violet-100 bg-violet-50/40 p-5">
            <h2 className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-900">
              <Sparkles size={14} className="text-violet-600" />
              AI Review for Candidate
            </h2>
            <p className="text-xs leading-relaxed text-gray-700">
              {submission.aiReviewerNotes ??
                "AI hasn't drafted notes for this submission yet."}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={rewriteWithAi}
                className="inline-flex items-center gap-1 rounded border border-violet-300 bg-white px-2.5 py-1 text-[11px] font-medium text-violet-700 hover:bg-violet-100"
              >
                <Sparkles size={11} />
                Rewrite with AI
              </button>
              <button
                onClick={() =>
                  showToast("success", "AI notes saved (demo only).")
                }
                className="inline-flex items-center gap-1 rounded bg-violet-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-violet-700"
              >
                Save
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 text-xs text-gray-500">
            <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900">
              <Clock size={13} /> Timing
            </h2>
            <p>
              Started:{" "}
              <strong className="text-gray-700">
                {new Date(submission.startedAtISO).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </strong>
            </p>
            <p className="mt-1">
              Submitted:{" "}
              <strong className="text-gray-700">
                {submission.submittedAtISO
                  ? new Date(submission.submittedAtISO).toLocaleString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )
                  : "—"}
              </strong>
            </p>
            {submission.forceSubmitted && (
              <p className="mt-2 rounded bg-rose-50 px-2 py-1 text-[11px] text-rose-700">
                Force-submitted by the system.
              </p>
            )}
            {submission.excludeReason && (
              <p className="mt-2 rounded bg-amber-50 px-2 py-1 text-[11px] text-amber-700">
                Excluded: {submission.excludeReason}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}
