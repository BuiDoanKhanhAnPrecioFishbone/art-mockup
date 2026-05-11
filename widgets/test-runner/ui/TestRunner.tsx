"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Maximize2,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { Test, TestSession } from "@/entities/test";
import type { Question } from "@/entities/question";
import { QuestionListModal } from "./QuestionListModal";
import { TestGuidanceModal } from "./TestGuidanceModal";
import { CodeAnswer } from "./CodeAnswer";
import { MultipleChoiceAnswer } from "./MultipleChoiceAnswer";
import { EssayAnswer } from "./EssayAnswer";
import { TestCasesPanel } from "./TestCasesPanel";

/** Candidate test runner — wireframe nodes 2435:76737 (default coding),
 *  2435:75777 (multi-choice), 2435:75870 (essay), 2435:76482 (test
 *  cases expanded). All variants share the same chrome and 2-col body
 *  shape. */
export function TestRunner({
  sessionId,
  session,
  test,
  questions,
}: {
  sessionId: string;
  session: TestSession;
  test: Test;
  questions: Question[];
}) {
  const router = useRouter();
  /** Index of the currently visible question. */
  const [activeIdx, setActiveIdx] = useState(0);
  /** Per-question answer payloads — discriminated by question type. */
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  /** Per-question flagged state. */
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  /** Modal visibility. */
  const [showList, setShowList] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);
  /** Bottom Test-Cases panel collapsed/expanded for code questions. */
  const [casesExpanded, setCasesExpanded] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(test.durationMinutes * 60);

  /** Hydrate persisted state from localStorage. */
  useEffect(() => {
    try {
      const a = window.localStorage.getItem(`take:${sessionId}:answers`);
      if (a) setAnswers(JSON.parse(a));
      const f = window.localStorage.getItem(`take:${sessionId}:flagged`);
      if (f) setFlagged(JSON.parse(f));
    } catch {}
  }, [sessionId]);
  useEffect(() => {
    try {
      window.localStorage.setItem(
        `take:${sessionId}:answers`,
        JSON.stringify(answers)
      );
    } catch {}
  }, [sessionId, answers]);
  useEffect(() => {
    try {
      window.localStorage.setItem(
        `take:${sessionId}:flagged`,
        JSON.stringify(flagged)
      );
    } catch {}
  }, [sessionId, flagged]);

  /** Demo timer — counts down from durationMinutes. Doesn't actually
   *  enforce a cutoff (the mock can't kick the user out cleanly). */
  useEffect(() => {
    const id = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const current = questions[activeIdx];
  const setAnswer = useCallback(
    (qid: string, value: unknown) => {
      setAnswers((prev) => ({ ...prev, [qid]: value }));
    },
    []
  );

  const isAnswered = useCallback(
    (q: Question): boolean => {
      const v = answers[q.id];
      if (v == null) return false;
      if (typeof v === "string") return v.trim().length > 0;
      if (Array.isArray(v)) return v.length > 0;
      return true;
    },
    [answers]
  );

  function finish() {
    if (
      !window.confirm(
        "Submit your test? You can only submit once."
      )
    )
      return;
    try {
      window.localStorage.setItem(`take:${sessionId}:submitted`, "true");
    } catch {}
    router.push(`/take/${sessionId}/done`);
  }

  if (!current) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">
        This test has no questions.
      </div>
    );
  }

  const isCode = current.type === "csharp" || current.type === "javascript";

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      {/* Top toolbar — sticky */}
      <Toolbar
        questions={questions}
        activeIdx={activeIdx}
        onJump={setActiveIdx}
        isAnswered={isAnswered}
        flagged={flagged}
        secondsLeft={secondsLeft}
        flaggedCount={Object.values(flagged).filter(Boolean).length}
        onShowList={() => setShowList(true)}
        onShowGuidance={() => setShowGuidance(true)}
        onFinish={finish}
      />

      {/* 2-col body */}
      <div className="grid flex-1 grid-cols-1 gap-4 px-6 py-4 lg:grid-cols-[1fr_1.5fr]">
        {/* Left: question */}
        <QuestionPanel
          index={activeIdx + 1}
          question={current}
          flagged={!!flagged[current.id]}
          onToggleFlag={() =>
            setFlagged((prev) => ({
              ...prev,
              [current.id]: !prev[current.id],
            }))
          }
        />

        {/* Right: answer + (for code questions) test-cases panel */}
        <div className="flex flex-col gap-4">
          <AnswerPanel
            question={current}
            value={answers[current.id]}
            onChange={(v) => setAnswer(current.id, v)}
            casesExpanded={casesExpanded}
          />
          {isCode && (
            <TestCasesPanel
              question={current}
              expanded={casesExpanded}
              onToggle={() => setCasesExpanded((v) => !v)}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {showList && (
        <QuestionListModal
          questions={questions}
          activeIdx={activeIdx}
          isAnswered={isAnswered}
          flagged={flagged}
          onJump={(i) => {
            setActiveIdx(i);
            setShowList(false);
          }}
          onClose={() => setShowList(false)}
        />
      )}
      {showGuidance && (
        <TestGuidanceModal onClose={() => setShowGuidance(false)} />
      )}
    </div>
  );
}

/* ---------- Top toolbar ---------- */

function Toolbar({
  questions,
  activeIdx,
  onJump,
  isAnswered,
  flagged,
  secondsLeft,
  flaggedCount,
  onShowList,
  onShowGuidance,
  onFinish,
}: {
  questions: Question[];
  activeIdx: number;
  onJump: (i: number) => void;
  isAnswered: (q: Question) => boolean;
  flagged: Record<string, boolean>;
  secondsLeft: number;
  flaggedCount: number;
  onShowList: () => void;
  onShowGuidance: () => void;
  onFinish: () => void;
}) {
  // The wireframe pins the toolbar to the top with a thin row of
  // numbered pills. Only ~10 fit at typical desktop widths; the
  // arrows page through groups beyond that.
  const PAGE_SIZE = 10;
  const pages = Math.max(1, Math.ceil(questions.length / PAGE_SIZE));
  const initialPage = Math.floor(activeIdx / PAGE_SIZE);
  const [page, setPage] = useState(initialPage);
  useEffect(() => setPage(Math.floor(activeIdx / PAGE_SIZE)), [activeIdx]);
  const pageStart = page * PAGE_SIZE;
  const slice = questions.slice(pageStart, pageStart + PAGE_SIZE);

  return (
    <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-gray-200 bg-white px-6 py-2.5">
      <Timer secondsLeft={secondsLeft} />

      <button
        type="button"
        onClick={() => setPage((p) => Math.max(0, p - 1))}
        disabled={page === 0}
        className="rounded border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
      >
        <ChevronLeft size={14} />
      </button>

      <div className="flex items-center gap-1.5">
        {slice.map((q, i) => {
          const idx = pageStart + i;
          const active = idx === activeIdx;
          const answered = isAnswered(q);
          const flag = !!flagged[q.id];
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onJump(idx)}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded text-[11px] font-semibold transition-colors",
                active
                  ? flag
                    ? "bg-amber-400 text-white"
                    : "bg-violet-600 text-white ring-2 ring-violet-200"
                  : answered
                    ? "bg-green-500 text-white"
                    : flag
                      ? "bg-amber-400 text-white"
                      : "border border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
              )}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
        disabled={page >= pages - 1}
        className="rounded border border-violet-200 p-1.5 text-violet-500 hover:bg-violet-50 disabled:opacity-40"
      >
        <ChevronRight size={14} />
      </button>

      <button
        type="button"
        onClick={onShowList}
        className="ml-2 inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
      >
        Question List
        <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">
          <Flag size={10} /> {flaggedCount}
        </span>
      </button>

      <button
        type="button"
        onClick={onShowGuidance}
        className="inline-flex items-center gap-2 rounded-md border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
      >
        Test Guidance
      </button>

      <div className="ml-auto" />

      <button
        type="button"
        onClick={onFinish}
        className="rounded-md bg-red-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
      >
        Finish Test
      </button>
    </div>
  );
}

function Timer({ secondsLeft }: { secondsLeft: number }) {
  const hh = String(Math.floor(secondsLeft / 3600)).padStart(2, "0");
  const mm = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  return (
    <div className="inline-flex items-center gap-1.5 rounded-md border border-violet-200 px-2.5 py-1 text-xs font-semibold tabular-nums text-violet-700">
      <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
      {hh}:{mm}:{ss}
    </div>
  );
}

/* ---------- Question panel (left) ---------- */

function QuestionPanel({
  index,
  question,
  flagged,
  onToggleFlag,
}: {
  index: number;
  question: Question;
  flagged: boolean;
  onToggleFlag: () => void;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-sm font-semibold text-gray-900">
          {index}. {question.title}
        </h2>
        <button
          type="button"
          onClick={onToggleFlag}
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded px-2 py-1 text-[11px] font-medium",
            flagged
              ? "bg-amber-400 text-white"
              : "border border-gray-300 bg-white text-gray-600 hover:bg-amber-50"
          )}
          title={flagged ? "Unflag question" : "Flag for review later"}
        >
          <Flag size={11} />
          {flagged ? "Flagged" : "Flag"}
        </button>
      </div>

      <h3 className="mt-4 text-[11px] font-medium uppercase tracking-wide text-gray-400">
        Description
      </h3>
      <div className="mt-1 whitespace-pre-line text-sm leading-relaxed text-gray-700">
        {question.questionContent}
      </div>
    </div>
  );
}

/* ---------- Answer panel (right) ---------- */

function AnswerPanel({
  question,
  value,
  onChange,
  casesExpanded,
}: {
  question: Question;
  value: unknown;
  onChange: (v: unknown) => void;
  casesExpanded: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function reset() {
    if (window.confirm("Discard your answer for this question?")) {
      onChange(undefined);
    }
  }
  function expand() {
    if (!ref.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      ref.current.requestFullscreen().catch(() => {});
    }
  }

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-gray-200 bg-white shadow-sm",
        casesExpanded ? "min-h-[260px]" : "flex-1"
      )}
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
        <h3 className="text-sm font-semibold text-gray-900">Your answer</h3>
        <div className="flex items-center gap-2 text-gray-400">
          <button
            type="button"
            onClick={reset}
            title="Reset answer"
            className="hover:text-gray-700"
          >
            <RotateCcw size={14} />
          </button>
          <button
            type="button"
            onClick={expand}
            title="Toggle fullscreen"
            className="hover:text-gray-700"
          >
            <Maximize2 size={14} />
          </button>
          <button
            type="button"
            onClick={() => {
              window.alert("Answer saved (demo).");
            }}
            className="rounded bg-emerald-500 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-emerald-600"
          >
            Submit
          </button>
        </div>
      </div>

      <div className="p-4">
        <AnswerBody
          question={question}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

function AnswerBody({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  switch (question.type) {
    case "csharp":
    case "javascript":
      return (
        <CodeAnswer
          question={question}
          value={(value as string | undefined) ?? question.code?.starter ?? ""}
          onChange={onChange}
        />
      );
    case "multiple-choice":
      return (
        <MultipleChoiceAnswer
          question={question}
          value={(value as string[] | undefined) ?? []}
          onChange={onChange}
        />
      );
    case "essay":
    case "testing":
      return (
        <EssayAnswer
          value={(value as string | undefined) ?? ""}
          onChange={onChange}
        />
      );
    default:
      return null;
  }
}

/* Re-export local primitives needed by sibling files. */
export { Toolbar as TestRunnerToolbar };
