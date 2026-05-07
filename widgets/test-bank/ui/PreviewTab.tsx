"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, Eye, FileText } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import {
  QUESTION_TYPE_LABEL,
  type Question,
} from "@/entities/question";
import type { Test } from "@/entities/test";

/**
 * Read-only preview of the test as the candidate would see it. Renders
 * the question composition top-to-bottom; for static tests, exact
 * questions; for dynamic tests, a sample resolved by drawing one
 * question per condition.
 */
export function PreviewTab({ test }: { test: Test }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/questions")
      .then((r) => r.json())
      .then((d) => setQuestions(d.questions ?? []))
      .finally(() => setLoading(false));
  }, []);

  const renderedQuestions = useMemo<Question[]>(() => {
    if (test.compositionMode === "static") {
      const byId = new Map(questions.map((q) => [q.id, q]));
      return test.staticQuestions
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((r) => byId.get(r.questionId))
        .filter((q): q is Question => Boolean(q));
    }
    // Dynamic — pick the first matching question per condition (mock).
    const out: Question[] = [];
    for (const cond of test.dynamicConditions) {
      const pool = questions.filter((q) => {
        if (cond.type && q.type !== cond.type) return false;
        if (cond.difficulty && q.difficulty !== cond.difficulty) return false;
        if (cond.tags.length > 0 && !q.tags.some((t) => cond.tags.includes(t)))
          return false;
        return true;
      });
      for (let i = 0; i < cond.quantity && i < pool.length; i++) {
        out.push(pool[i]);
      }
    }
    return out;
  }, [questions, test]);

  if (loading) {
    return (
      <p className="py-12 text-center text-sm text-gray-400">
        Loading questions…
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center gap-2 text-violet-700">
          <Eye size={14} />
          <span className="text-[11px] font-semibold uppercase tracking-wide">
            Candidate preview
          </span>
        </div>
        <h2 className="mt-1 text-lg font-bold text-gray-900">{test.title}</h2>
        <p className="mt-1 text-sm text-gray-600">{test.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <Clock size={12} />
            {test.durationMinutes} min
          </span>
          <span>·</span>
          <span>Pass at {test.passRatioPercent}%</span>
          <span>·</span>
          <span>{renderedQuestions.length} questions</span>
          {test.shuffleQuestions && (
            <>
              <span>·</span>
              <span className="rounded bg-violet-50 px-1.5 py-0.5 font-medium text-violet-700">
                Shuffled
              </span>
            </>
          )}
        </div>
      </div>

      {renderedQuestions.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
          No questions configured yet — add some on the General Information
          tab.
        </div>
      ) : (
        <ol className="space-y-3">
          {renderedQuestions.map((q, i) => (
            <li
              key={q.id}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-violet-700">
                  Question {i + 1} / {renderedQuestions.length}
                </p>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
                  {QUESTION_TYPE_LABEL[q.type]}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">{q.title}</h3>
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                {q.questionContent}
              </p>
              {q.multipleChoice && (
                <ul className="mt-2 space-y-1">
                  {q.multipleChoice.options.map((opt, oi) => (
                    <li
                      key={opt.id}
                      className="flex items-center gap-2 rounded border border-gray-200 px-2 py-1.5 text-sm text-gray-700"
                    >
                      <input type="radio" disabled className="accent-violet-600" />
                      <span>
                        {String.fromCharCode(97 + oi)}. {opt.text}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {q.code && (
                <div className="mt-2">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Starter code
                  </p>
                  <pre className="max-h-56 overflow-auto rounded-lg border border-gray-700 bg-[#1e1e2e] p-3 font-mono text-[11px] text-gray-100">
                    {q.code.starter}
                  </pre>
                </div>
              )}
              {q.testing && (
                <div
                  className={cn(
                    "mt-2 rounded-md bg-violet-50 px-3 py-2 text-xs text-violet-800"
                  )}
                >
                  <FileText size={11} className="mr-1 inline align-text-bottom" />
                  Open-ended response — graders check {q.testing.ideas.length}{" "}
                  key idea{q.testing.ideas.length === 1 ? "" : "s"}.
                </div>
              )}
              {q.type === "essay" && !q.testing && (
                <textarea
                  rows={3}
                  disabled
                  placeholder="Type your answer…"
                  className="mt-2 w-full resize-none rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm"
                />
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
