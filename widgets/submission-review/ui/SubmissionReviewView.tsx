"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Clipboard,
  Copy,
  Mail,
  Monitor,
  PanelLeft,
  Shield,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useToast } from "@/shared/ui/toast";
import {
  QUESTION_TYPE_LABEL,
  isCodeType,
  type Question,
} from "@/entities/question";
import type { Submission, SubmissionIntegrity, TestSession } from "@/entities/test";

type QuestionTab = "submission" | "checking" | "ai";

const DIFFICULTY_TONE: Record<string, string> = {
  Easy: "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  Hard: "bg-red-100 text-red-700",
};

/** Per-question deep-dive review for one submission. Mirrors the
 *  wireframe at TUCQDUD1WLKCSAnIY8ed7a / 2010:47072 — top header
 *  with candidate identity, a horizontal pill nav for jumping to
 *  any of the N questions, then a stack of collapsible cards (one
 *  per question) that switch shape by question type. */
const FINAL_REVIEW_OPTIONS = [
  "Pending",
  "Under Review",
  "Passed",
  "Failed",
] as const;
type FinalReviewValue = (typeof FINAL_REVIEW_OPTIONS)[number];

export function SubmissionReviewView({
  session,
  submission,
  questions,
}: {
  session: TestSession;
  submission: Submission;
  questions: Question[];
}) {
  const { showToast } = useToast();
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(questions.map((q) => q.id))
  );
  const [activeIdx, setActiveIdx] = useState(0);
  const [finalResult, setFinalResult] = useState<FinalReviewValue>(
    (submission.finalReview as FinalReviewValue) ?? "Pending"
  );
  const [updatingReview, setUpdatingReview] = useState(false);

  async function updateReview() {
    setUpdatingReview(true);
    try {
      // Mock: per Doc 09.5 the reviewer's verdict gets PATCHed back
      // to the submission. The toast confirms the action; in a real
      // build this would refresh the submission detail page on the
      // back-stack so the verdict propagates everywhere.
      await new Promise((r) => window.setTimeout(r, 400));
      showToast(
        "success",
        `Review submitted as "${finalResult}". Verdict will sync on the back-stack.`
      );
    } finally {
      setUpdatingReview(false);
    }
  }

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function jumpTo(idx: number) {
    setActiveIdx(idx);
    const q = questions[idx];
    if (!q) return;
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.add(q.id);
      return next;
    });
    // Scroll the card into view.
    const el = document.getElementById(`q-${q.id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-8 py-4">
          <nav className="text-xs text-gray-500">
            <Link href="/programs" className="underline hover:text-gray-700">
              Programs
            </Link>
            <span className="px-1.5 text-gray-300">/</span>
            <Link
              href={`/submissions/${session.id}`}
              className="text-violet-600 underline hover:text-violet-800"
            >
              {session.name}
            </Link>
            <span className="px-1.5 text-gray-300">/</span>
            <span className="font-medium text-gray-900">
              {submission.candidateName}
            </span>
          </nav>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Link
              href={`/submissions/${session.id}/${submission.id}`}
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft size={13} /> Back to Submission Details
            </Link>
            <span className="text-gray-300">|</span>
            <h1 className="text-2xl font-semibold text-gray-900">
              {submission.candidateName}
            </h1>
            <ScoreBadge submission={submission} />

            {/* Reviewer's Final Result + Update — wireframe header
             *  controls. Pending/Under Review keep the row open for
             *  more work; Passed/Failed locks the verdict in. */}
            <div className="ml-auto flex items-center gap-2">
              <label className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                Final Result
                <select
                  value={finalResult}
                  onChange={(e) =>
                    setFinalResult(e.target.value as FinalReviewValue)
                  }
                  className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs focus:border-violet-500 focus:outline-none"
                >
                  {FINAL_REVIEW_OPTIONS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={updateReview}
                disabled={updatingReview}
                className="rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700 disabled:bg-violet-300"
              >
                {updatingReview ? "Saving…" : "Update Review"}
              </button>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Mail size={12} /> {submission.candidateEmail}
            </span>
            {submission.integrity && (
              <IntegrityHints integrity={submission.integrity} />
            )}
          </div>
        </div>

        {/* Question pill nav */}
        <div className="mx-auto max-w-6xl px-8 pb-3">
          <div className="flex flex-wrap gap-1">
            {questions.map((q, i) => {
              const result = submission.questionResults?.find(
                (r) => r.questionId === q.id
              );
              const score = result ? result.scored / result.max : null;
              const tone =
                score == null
                  ? "border-gray-300 bg-white text-gray-500"
                  : score >= 1
                    ? "bg-emerald-500 text-white"
                    : score >= 0.6
                      ? "bg-amber-400 text-white"
                      : "bg-red-500 text-white";
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => jumpTo(i)}
                  className={cn(
                    "h-8 w-8 rounded text-[11px] font-semibold transition-colors",
                    tone,
                    i === activeIdx && "ring-2 ring-violet-300"
                  )}
                  title={q.title}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Body — per-question cards */}
      <main className="mx-auto max-w-6xl space-y-3 px-8 py-6">
        {questions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center text-sm text-gray-500">
            This submission has no recorded question results.
          </div>
        ) : (
          questions.map((q, i) => (
            <QuestionCard
              key={q.id}
              index={i + 1}
              question={q}
              submission={submission}
              answer={submission.answers?.[q.id] ?? ""}
              open={openIds.has(q.id)}
              onToggle={() => toggle(q.id)}
            />
          ))
        )}
      </main>
    </div>
  );
}

/* ---------- Header bits ---------- */

function ScoreBadge({ submission }: { submission: Submission }) {
  const tone =
    submission.scorePercent == null
      ? "bg-gray-100 text-gray-600"
      : submission.scorePercent >= 80
        ? "bg-emerald-100 text-emerald-700"
        : submission.scorePercent >= 60
          ? "bg-amber-100 text-amber-700"
          : "bg-red-100 text-red-700";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        tone
      )}
    >
      {submission.scorePercent != null
        ? `Score · ${submission.scorePercent}%`
        : "Not scored"}
    </span>
  );
}

function IntegrityHints({ integrity }: { integrity: SubmissionIntegrity }) {
  const events = [
    integrity.leavingTabCount > 0 && (
      <span
        key="leave"
        title="Times the candidate left the test tab"
        className="inline-flex items-center gap-1 text-amber-700"
      >
        <PanelLeft size={11} /> {integrity.leavingTabCount} tab leaves
      </span>
    ),
    integrity.copyPasteCount > 0 && (
      <span
        key="cp"
        title="Copy / paste events detected"
        className="inline-flex items-center gap-1 text-amber-700"
      >
        <Copy size={11} /> {integrity.copyPasteCount} paste(s)
      </span>
    ),
    integrity.devtoolsOpenCount > 0 && (
      <span key="dev" className="inline-flex items-center gap-1 text-red-700">
        <Wrench size={11} /> DevTools opened
      </span>
    ),
    integrity.multiInstanceCount > 0 && (
      <span key="mi" className="inline-flex items-center gap-1 text-red-700">
        <Shield size={11} /> Multiple instances
      </span>
    ),
    integrity.multiMonitorFlag && (
      <span key="mm" className="inline-flex items-center gap-1 text-red-700">
        <Monitor size={11} /> Multi-monitor
      </span>
    ),
  ].filter(Boolean);
  if (events.length === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-700">
        <Shield size={11} /> No integrity events
      </span>
    );
  }
  return <span className="flex flex-wrap items-center gap-3">{events}</span>;
}

/* ---------- Per-question card ---------- */

function QuestionCard({
  index,
  question,
  submission,
  answer,
  open,
  onToggle,
}: {
  index: number;
  question: Question;
  submission: Submission;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  const result = submission.questionResults?.find(
    (r) => r.questionId === question.id
  );
  const tabs: { id: QuestionTab; label: string }[] = [
    { id: "submission", label: "Submission" },
    { id: "checking", label: "Checking Details" },
    { id: "ai", label: "AI Analysis" },
  ];
  const [tab, setTab] = useState<QuestionTab>("submission");
  const { showToast } = useToast();

  return (
    <article
      id={`q-${question.id}`}
      className="overflow-hidden rounded-xl border border-gray-200 bg-white"
    >
      {/* Header — collapsible */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 border-b border-gray-100 bg-violet-50/40 px-5 py-3 text-left"
      >
        <span className="text-sm font-semibold text-violet-800">
          Question {index}: {question.title}
        </span>
        <span
          className={cn(
            "ml-1 inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase",
            "bg-violet-100 text-violet-700"
          )}
        >
          {QUESTION_TYPE_LABEL[question.type]}
        </span>
        <span
          className={cn(
            "inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase",
            DIFFICULTY_TONE[question.difficulty] ?? "bg-gray-100 text-gray-700"
          )}
        >
          {question.difficulty}
        </span>
        <span className="ml-auto text-gray-400">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {open && (
        <div className="grid grid-cols-1 gap-4 px-5 py-4 lg:grid-cols-[1fr_220px]">
          {/* Description (always visible above tabs) */}
          <div className="lg:col-span-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              Description
            </p>
            <p className="mt-1 whitespace-pre-line text-sm text-gray-700">
              {question.questionContent}
            </p>
          </div>

          {/* Question Points panel — sits to the right on wide screens */}
          <div className="lg:order-2 lg:col-start-2 lg:row-start-2">
            <QuestionPointsPanel
              maxPoints={result?.max ?? 10}
              initialPoints={result?.scored ?? 0}
              onSuggest={(suggested) => {
                showToast(
                  "success",
                  `AI suggested ${suggested}/${result?.max ?? 10} pts (mocked).`
                );
              }}
              onSave={(next) => {
                // Mock — in a real build this would PATCH the
                // submission's questionResults entry. Toast confirms.
                showToast(
                  "success",
                  `Saved ${next}/${result?.max ?? 10} pts for this question.`
                );
              }}
            />
          </div>

          {/* Tabs + body */}
          <div className="lg:col-start-1 lg:row-start-2">
            <nav className="mb-3 flex gap-3 border-b border-gray-100 text-xs">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "relative pb-2 font-medium",
                    tab === t.id
                      ? "text-violet-700"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  {t.label}
                  {tab === t.id && (
                    <span className="absolute inset-x-0 -bottom-px h-0.5 bg-violet-600" />
                  )}
                </button>
              ))}
            </nav>

            {tab === "submission" && (
              <SubmissionTab question={question} answer={answer} />
            )}
            {tab === "checking" && (
              <CheckingTab question={question} answer={answer} />
            )}
            {tab === "ai" && <AIAnalysisTab question={question} />}
          </div>
        </div>
      )}
    </article>
  );
}

/* ---------- Submission tab — per-question type body ---------- */

function SubmissionTab({
  question,
  answer,
}: {
  question: Question;
  answer: string;
}) {
  if (isCodeType(question.type)) {
    return (
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <CodeBlock
          label="Candidate's answer"
          code={answer || "// No answer submitted"}
        />
        <CodeBlock
          label="Reference answer"
          code={question.code?.solution ?? "// Reference solution not set."}
        />
      </div>
    );
  }

  if (question.type === "multiple-choice") {
    const picked = answer ? answer.split(",").map((s) => s.trim()) : [];
    return (
      <ul className="space-y-2">
        {(question.multipleChoice?.options ?? []).map((opt, i) => {
          const wasPicked = picked.includes(opt.id);
          const correct = opt.correct;
          const tone = correct
            ? "border-emerald-300 bg-emerald-50/60"
            : wasPicked
              ? "border-red-300 bg-red-50/60"
              : "border-gray-200 bg-white";
          return (
            <li
              key={opt.id}
              className={cn(
                "flex items-start gap-3 rounded-md border px-3 py-2 text-sm",
                tone
              )}
            >
              <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white text-[10px] font-semibold text-gray-600">
                {String.fromCharCode(97 + i)}
              </span>
              <span className="flex-1 text-gray-800">{opt.text}</span>
              {correct && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                  <Check size={12} /> Correct
                </span>
              )}
              {!correct && wasPicked && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-700">
                  <X size={12} /> Picked
                </span>
              )}
              {correct && wasPicked && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                  Picked
                </span>
              )}
            </li>
          );
        })}
        {picked.length === 0 && (
          <p className="text-xs text-gray-500">
            Candidate didn&rsquo;t pick any option.
          </p>
        )}
      </ul>
    );
  }

  // Essay / Testing — show candidate text + sample answer side-by-side.
  const sample =
    question.type === "essay"
      ? question.essay?.sampleAnswer
      : question.testing?.sampleAnswer;
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <TextBlock
        label="Candidate's answer"
        body={answer || "(No answer submitted.)"}
      />
      <TextBlock
        label="Reference / sample answer"
        body={sample ?? "(No sample answer recorded.)"}
        tone="violet"
      />
    </div>
  );
}

/* ---------- Checking-details tab ---------- */

function CheckingTab({
  question,
  answer,
}: {
  question: Question;
  answer: string;
}) {
  // Code questions surface the test cases inline; everything else
  // shows the rubric / ideas list to help the reviewer score
  // consistently.
  if (isCodeType(question.type)) {
    const cases = (question.code?.testCases ?? []).filter(
      (c) => c.visibleInTest
    );
    return (
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          Test cases
        </p>
        {cases.length === 0 ? (
          <p className="rounded-md border border-dashed border-gray-200 bg-gray-50 px-3 py-3 text-xs text-gray-500">
            No visible test cases for this question.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {cases.map((c) => (
              <li
                key={c.id}
                className={cn(
                  "rounded-md border px-3 py-2 text-xs",
                  c.result === "passed"
                    ? "border-emerald-200 bg-emerald-50/60"
                    : c.result === "failed"
                      ? "border-red-200 bg-red-50/60"
                      : "border-gray-200 bg-white"
                )}
              >
                <p className="font-medium text-gray-800">{c.title}</p>
                {c.description && (
                  <p className="mt-0.5 text-[11px] text-gray-500">
                    {c.description}
                  </p>
                )}
                {c.resultMessage && (
                  <p className="mt-1 font-mono text-[11px] text-red-700">
                    {c.resultMessage}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
        {!answer && (
          <p className="text-[11px] text-amber-700">
            Heads up — candidate submitted no code, so test cases ran
            against the starter only.
          </p>
        )}
      </div>
    );
  }

  if (question.type === "multiple-choice") {
    const correctIds = new Set(
      (question.multipleChoice?.options ?? [])
        .filter((o) => o.correct)
        .map((o) => o.id)
    );
    const picked = answer ? new Set(answer.split(",").map((s) => s.trim())) : new Set();
    const allCorrect =
      correctIds.size > 0 &&
      [...correctIds].every((id) => picked.has(id)) &&
      picked.size === correctIds.size;
    return (
      <div
        className={cn(
          "rounded-md border px-3 py-2 text-xs",
          allCorrect
            ? "border-emerald-200 bg-emerald-50/60 text-emerald-700"
            : "border-red-200 bg-red-50/60 text-red-700"
        )}
      >
        {allCorrect
          ? "Candidate selected the correct option(s)."
          : "Candidate selected at least one wrong option."}
      </div>
    );
  }

  // Essay / Testing — surface the rubric or the ideas checklist.
  if (question.type === "essay") {
    return (
      <RubricBlock label="Grading rubric" body={question.essay?.rubric} />
    );
  }
  return (
    <div className="space-y-3">
      <RubricBlock
        label="Grading rubric"
        body={question.testing?.rubric}
      />
      {question.testing?.ideas && question.testing.ideas.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Ideas the answer should cover
          </p>
          <ul className="mt-1 space-y-1 text-xs text-gray-700">
            {question.testing.ideas.map((idea) => (
              <li key={idea.id} className="flex items-start gap-2">
                <Clipboard size={11} className="mt-0.5 text-gray-400" />
                {idea.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ---------- AI analysis tab ---------- */

/** Editable Question Points panel — input + Update button + "AI
 *  Review Score" link. Wireframe `3228:199289` shows "5 / 10 pts"
 *  with a numeric input the reviewer can change to set their own
 *  score for this question. Save is mocked at the consumer level. */
function QuestionPointsPanel({
  maxPoints,
  initialPoints,
  onSave,
  onSuggest,
}: {
  maxPoints: number;
  initialPoints: number;
  onSave: (next: number) => void;
  onSuggest: (suggested: number) => void;
}) {
  const [value, setValue] = useState(String(initialPoints));
  const dirty = String(initialPoints) !== value;

  function clamp(n: number): number {
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.min(maxPoints, Math.round(n * 10) / 10));
  }

  function commit() {
    const n = clamp(Number(value));
    setValue(String(n));
    onSave(n);
  }

  function suggest() {
    // Mock: AI suggests roughly 70% of max as a reasonable midpoint.
    const suggested = Math.round(maxPoints * 0.7);
    setValue(String(suggested));
    onSuggest(suggested);
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <p className="text-[11px] font-medium text-gray-500">Question Points</p>
      <div className="mt-1 flex items-center gap-1.5">
        <input
          type="number"
          min={0}
          max={maxPoints}
          step={0.5}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => {
            // Re-clamp on blur but don't auto-save — Update button
            // remains the explicit commit. This matches the
            // wireframe's "Update Question Points" pattern.
            const n = clamp(Number(value));
            setValue(String(n));
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
          }}
          className="w-16 rounded-md border border-gray-300 bg-white px-2 py-1 text-center text-base font-semibold tabular-nums text-gray-900 focus:border-violet-500 focus:outline-none"
        />
        <span className="text-sm text-gray-500">/ {maxPoints} pts</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={commit}
          disabled={!dirty}
          className="inline-flex items-center gap-1 rounded-md bg-violet-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-300"
        >
          Update
        </button>
        <button
          type="button"
          onClick={suggest}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-violet-600 hover:text-violet-800"
        >
          <Sparkles size={11} /> AI Review Score
        </button>
      </div>
    </div>
  );
}

/** AI Analysis tab — wireframes 3228:199793 (empty) and 3228:200291
 *  (populated). Two-state: shows the "Get AI-Powered Insights" CTA
 *  panel until the reviewer clicks Analyze, then renders Summary +
 *  Areas for Improvements blocks. State is per-card / per-mount. */
function AIAnalysisTab({ question }: { question: Question }) {
  const [analyzed, setAnalyzed] = useState(false);
  const [working, setWorking] = useState(false);

  function analyze() {
    setWorking(true);
    window.setTimeout(() => {
      setAnalyzed(true);
      setWorking(false);
    }, 800);
  }

  if (!analyzed) {
    return (
      <div className="overflow-hidden rounded-lg border border-violet-100 bg-violet-50/30">
        <div className="grid grid-cols-1 items-center gap-4 p-6 sm:grid-cols-[1fr_120px]">
          <div>
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700">
              <Sparkles size={14} /> Get AI-Powered Insights
            </p>
            <p className="mt-1 text-xs text-gray-700">
              Let AI analyze this submission for you — surfaces a quick
              correctness summary and concrete areas for improvement
              against the {question.type} prompt.
            </p>
            <button
              type="button"
              onClick={analyze}
              disabled={working}
              className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-violet-300 bg-white px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-50 disabled:opacity-60"
            >
              <Sparkles size={11} />
              {working ? "Analyzing…" : "AI Analyze"}
            </button>
          </div>
          {/* Decorative panel — keeps the wireframe's friendly look. */}
          <AIAnalyzeIllustration />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-violet-100 bg-violet-50/30 p-4">
      <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700">
        <Sparkles size={13} /> AI analyze
      </p>
      <CollapsibleAIBlock
        title="Summary"
        body={mockSummary(question)}
      />
      <CollapsibleAIBlock
        title="Areas for Improvements"
        count={3}
        body={mockAreas(question)}
      />
      <button
        type="button"
        onClick={() => setAnalyzed(false)}
        className="text-[11px] font-medium text-violet-600 hover:text-violet-800"
      >
        Re-run analysis
      </button>
    </div>
  );
}

function CollapsibleAIBlock({
  title,
  body,
  count,
}: {
  title: string;
  body: string;
  count?: number;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="overflow-hidden rounded-md border border-violet-100 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 border-l-4 border-violet-400 px-3 py-2 text-left"
      >
        <span className="text-xs font-semibold text-gray-800">
          {title}
          {count != null && (
            <span className="ml-1 text-gray-400">({count})</span>
          )}
        </span>
        <span className="ml-auto text-gray-400">
          {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </span>
      </button>
      {open && (
        <div className="border-t border-violet-100 px-3 py-2 text-xs text-gray-700">
          {body}
        </div>
      )}
    </div>
  );
}

function AIAnalyzeIllustration() {
  return (
    <svg
      viewBox="0 0 120 80"
      className="h-20 w-full"
      aria-hidden
    >
      <rect x="20" y="14" width="80" height="50" rx="6" fill="#fde68a" />
      <rect x="26" y="20" width="68" height="38" rx="3" fill="#1f2937" />
      <circle cx="42" cy="38" r="6" fill="#fbcfe8" />
      <circle cx="62" cy="38" r="6" fill="#c4b5fd" />
      <rect x="78" y="32" width="14" height="12" rx="2" fill="#7c3aed" />
      <circle cx="100" cy="22" r="6" fill="#7c3aed" />
      <circle cx="14" cy="62" r="4" fill="#fde68a" />
    </svg>
  );
}

function mockSummary(question: Question): string {
  if (isCodeType(question.type)) {
    return "The candidate's solution handles the happy path but misses edge cases for empty input and deeply nested values. Time complexity is O(n) which is acceptable; clean-code style is consistent.";
  }
  if (question.type === "multiple-choice") {
    return "Candidate selected the correct option(s). No further analysis needed.";
  }
  return "The answer demonstrates a working understanding of the topic but stays at a surface level. Concrete examples and trade-off analysis would lift it from 'pass' to 'strong'.";
}

function mockAreas(question: Question): string {
  if (isCodeType(question.type)) {
    return "1) Add input validation for null / non-object inputs. 2) Cover the empty-object base case explicitly. 3) Consider iterative traversal to avoid potential stack overflow on deeply nested inputs.";
  }
  return "1) Anchor claims with specific examples from past projects. 2) Discuss trade-offs explicitly (latency vs throughput, simplicity vs flexibility). 3) Tie the answer back to the role's day-to-day responsibilities.";
}

/* ---------- Small render helpers ---------- */

function CodeBlock({ label, code }: { label: string; code: string }) {
  return (
    <div className="overflow-hidden rounded-md border border-gray-200">
      <p className="border-b border-gray-100 bg-gray-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <pre className="max-h-72 overflow-auto bg-[#1e1e1e] p-3 font-mono text-[11px] leading-5 text-gray-100">
        {code}
      </pre>
    </div>
  );
}

function TextBlock({
  label,
  body,
  tone = "gray",
}: {
  label: string;
  body: string;
  tone?: "gray" | "violet";
}) {
  return (
    <div
      className={cn(
        "rounded-md border p-3",
        tone === "violet"
          ? "border-violet-200 bg-violet-50/40"
          : "border-gray-200 bg-white"
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-line text-sm text-gray-800">
        {body}
      </p>
    </div>
  );
}

function RubricBlock({
  label,
  body,
}: {
  label: string;
  body: string | undefined;
}) {
  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-line text-xs text-gray-700">
        {body || "No rubric set."}
      </p>
    </div>
  );
}

/** Re-export commonly used types so the page route stays thin. */
export type SubmissionReviewProps = React.ComponentProps<
  typeof SubmissionReviewView
>;
