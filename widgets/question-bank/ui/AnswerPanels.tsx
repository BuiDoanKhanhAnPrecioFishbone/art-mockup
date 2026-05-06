"use client";

import { useState } from "react";
import { CheckCircle2, HelpCircle, Plus, X } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import {
  ideaId,
  isCodeType,
  opId,
  type Question,
} from "@/entities/question";
import { CodeBox } from "./pieces";

/**
 * Per-type "Answer & Template" panels. The shape varies wildly by question
 * type — a multiple-choice question has a list of options, an essay has a
 * sample answer + rubric, code questions have side-by-side starter and
 * solution editors, and testing questions have an ideas checklist on top
 * of the essay shape.
 */
export function AnswerPanel({
  question,
  onChange,
  readOnly,
}: {
  question: Question;
  onChange: (patch: Partial<Question>) => void;
  readOnly?: boolean;
}) {
  if (question.type === "multiple-choice") {
    return (
      <MultipleChoicePanel
        question={question}
        onChange={onChange}
        readOnly={readOnly}
      />
    );
  }
  if (question.type === "essay") {
    return (
      <EssayPanel question={question} onChange={onChange} readOnly={readOnly} />
    );
  }
  if (question.type === "testing") {
    return (
      <TestingPanel
        question={question}
        onChange={onChange}
        readOnly={readOnly}
      />
    );
  }
  if (isCodeType(question.type)) {
    return (
      <CodePanel question={question} onChange={onChange} readOnly={readOnly} />
    );
  }
  return null;
}

/* ============================================================
 * Multiple Choice — list-of-options table with correct + remove
 * ============================================================ */

function MultipleChoicePanel({
  question,
  onChange,
  readOnly,
}: {
  question: Question;
  onChange: (patch: Partial<Question>) => void;
  readOnly?: boolean;
}) {
  if (!question.multipleChoice) return null;
  const mc = question.multipleChoice;

  const setOptions = (next: typeof mc.options) =>
    onChange({ multipleChoice: { ...mc, options: next } });

  const addOption = () =>
    setOptions([...mc.options, { id: opId(), text: "", correct: false }]);

  const removeOption = (id: string) =>
    setOptions(mc.options.filter((o) => o.id !== id));

  const setCorrect = (id: string, correct: boolean) => {
    if (mc.multiSelect) {
      setOptions(mc.options.map((o) => (o.id === id ? { ...o, correct } : o)));
    } else {
      // Radio behaviour — clear other correct flags.
      setOptions(
        mc.options.map((o) => ({ ...o, correct: o.id === id ? correct : false }))
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">List of Choices</p>
          <p className="mt-0.5 text-[11px] text-gray-500">
            Tick the row that contains the correct answer
            {mc.multiSelect ? "s" : ""}.
          </p>
        </div>
        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
          <input
            type="checkbox"
            checked={mc.multiSelect}
            disabled={readOnly}
            onChange={(e) =>
              onChange({
                multipleChoice: { ...mc, multiSelect: e.target.checked },
              })
            }
            className="accent-violet-600"
          />
          Allow multiple correct
        </label>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        <div className="grid grid-cols-[1fr_120px_60px] border-b border-gray-100 bg-gray-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
          <span>List of Choices</span>
          <span className="text-center">Correct Answer</span>
          <span className="text-center">Remove</span>
        </div>
        <ul>
          {mc.options.map((opt, i) => (
            <li
              key={opt.id}
              className={cn(
                "grid grid-cols-[1fr_120px_60px] items-center gap-2 border-t border-gray-100 px-3 py-2 transition-colors",
                opt.correct && "bg-green-50/60"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="w-4 shrink-0 text-xs font-semibold text-gray-500">
                  {String.fromCharCode(97 + i)}.
                </span>
                <input
                  value={opt.text}
                  disabled={readOnly}
                  onChange={(e) => {
                    const v = e.target.value;
                    setOptions(
                      mc.options.map((o) =>
                        o.id === opt.id ? { ...o, text: v } : o
                      )
                    );
                  }}
                  placeholder={`Option ${String.fromCharCode(97 + i)}`}
                  className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-violet-500 focus:outline-none disabled:bg-gray-50"
                />
              </div>
              <div className="flex justify-center">
                <input
                  type="checkbox"
                  checked={opt.correct}
                  disabled={readOnly}
                  onChange={(e) => setCorrect(opt.id, e.target.checked)}
                  className="h-4 w-4 accent-violet-600"
                />
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => removeOption(opt.id)}
                  disabled={readOnly || mc.options.length <= 2}
                  className="rounded p-1 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label={`Remove option ${String.fromCharCode(97 + i)}`}
                  title={
                    mc.options.length <= 2
                      ? "At least 2 choices are required."
                      : "Remove"
                  }
                >
                  <X size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={addOption}
        disabled={readOnly}
        className="inline-flex items-center gap-1.5 rounded-lg border border-violet-300 bg-white px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-50 disabled:opacity-50"
      >
        <Plus size={13} />
        More Answer
      </button>

      {mc.options.every((o) => !o.correct) && (
        <p className="text-[11px] font-medium text-amber-700">
          ⚠︎ No option is marked correct yet — graders won't be able to score
          this question.
        </p>
      )}
    </div>
  );
}

/* ============================================================
 * Essay — sample answer + rubric
 * ============================================================ */

function EssayPanel({
  question,
  onChange,
  readOnly,
}: {
  question: Question;
  onChange: (patch: Partial<Question>) => void;
  readOnly?: boolean;
}) {
  const essay = question.essay ?? { sampleAnswer: "", rubric: "" };
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card title="Sample Answer" hint="Used by graders as a model answer.">
        <textarea
          value={essay.sampleAnswer ?? ""}
          disabled={readOnly}
          onChange={(e) =>
            onChange({ essay: { ...essay, sampleAnswer: e.target.value } })
          }
          rows={12}
          placeholder="Write a complete model answer the candidate could give…"
          className="block w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none disabled:bg-gray-50"
        />
      </Card>
      <Card
        title="Grading Rubric"
        hint="Free-form notes for the grader — what to look for, point allocation."
      >
        <textarea
          value={essay.rubric ?? ""}
          disabled={readOnly}
          onChange={(e) =>
            onChange({ essay: { ...essay, rubric: e.target.value } })
          }
          rows={12}
          placeholder="e.g. 4 points — 1 for naming, 1 for structure, 1 for examples, 1 for trade-offs."
          className="block w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none disabled:bg-gray-50"
        />
      </Card>
    </div>
  );
}

/* ============================================================
 * Testing — essay + ideas checklist
 * ============================================================ */

function TestingPanel({
  question,
  onChange,
  readOnly,
}: {
  question: Question;
  onChange: (patch: Partial<Question>) => void;
  readOnly?: boolean;
}) {
  const t = question.testing ?? {
    sampleAnswer: "",
    rubric: "",
    ideas: [],
  };

  const addIdea = () =>
    onChange({
      testing: { ...t, ideas: [...t.ideas, { id: ideaId(), text: "" }] },
    });
  const removeIdea = (id: string) =>
    onChange({ testing: { ...t, ideas: t.ideas.filter((i) => i.id !== id) } });
  const patchIdea = (id: string, text: string) =>
    onChange({
      testing: {
        ...t,
        ideas: t.ideas.map((i) => (i.id === id ? { ...i, text } : i)),
      },
    });

  return (
    <div className="space-y-4">
      <Card
        title="Key Ideas the Answer Must Cover"
        hint="Each idea becomes a checklist item the grader ticks off."
      >
        {t.ideas.length === 0 ? (
          <p className="rounded-md border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-xs text-gray-500">
            No ideas yet — add at least one so graders have something to check
            against.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {t.ideas.map((idea, i) => (
              <li key={idea.id} className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[11px] font-semibold text-violet-700">
                  {i + 1}
                </span>
                <input
                  value={idea.text}
                  disabled={readOnly}
                  onChange={(e) => patchIdea(idea.id, e.target.value)}
                  placeholder={`Key idea #${i + 1}`}
                  className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-violet-500 focus:outline-none disabled:bg-gray-50"
                />
                <CheckCircle2
                  size={14}
                  className="text-gray-300"
                  aria-hidden
                />
                <button
                  onClick={() => removeIdea(idea.id)}
                  disabled={readOnly}
                  className="rounded p-1 text-red-500 hover:bg-red-50 disabled:opacity-40"
                  aria-label={`Remove idea ${i + 1}`}
                >
                  <X size={13} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={addIdea}
          disabled={readOnly}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-violet-300 bg-white px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-50 disabled:opacity-50"
        >
          <Plus size={13} />
          Add Idea
        </button>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Sample Answer" hint="Optional — model the ideas in prose.">
          <textarea
            value={t.sampleAnswer ?? ""}
            disabled={readOnly}
            onChange={(e) =>
              onChange({ testing: { ...t, sampleAnswer: e.target.value } })
            }
            rows={9}
            placeholder="Write a complete answer that touches all the ideas above…"
            className="block w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none disabled:bg-gray-50"
          />
        </Card>
        <Card title="Grading Rubric" hint="Optional point allocation per idea.">
          <textarea
            value={t.rubric ?? ""}
            disabled={readOnly}
            onChange={(e) =>
              onChange({ testing: { ...t, rubric: e.target.value } })
            }
            rows={9}
            placeholder="e.g. 1 point per idea, half-credit for partial coverage."
            className="block w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none disabled:bg-gray-50"
          />
        </Card>
      </div>
    </div>
  );
}

/* ============================================================
 * Code (C# / JS) — Answer (solution) + Template (starter) editors
 * ============================================================ */

function CodePanel({
  question,
  onChange,
  readOnly,
}: {
  question: Question;
  onChange: (patch: Partial<Question>) => void;
  readOnly?: boolean;
}) {
  const code = question.code;
  if (!code) return null;
  const language =
    question.type === "csharp" ? "C#" : "JavaScript";

  const [tab, setTab] = useState<"split" | "answer" | "template">("split");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-500">
          Language: <span className="text-gray-800">{language}</span>
        </p>
        <div className="inline-flex rounded-md border border-gray-200 bg-white p-0.5 text-xs font-medium">
          {(["split", "answer", "template"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setTab(v)}
              className={cn(
                "rounded px-2.5 py-0.5 transition-colors",
                tab === v
                  ? "bg-violet-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              {v === "split" ? "Split" : v[0].toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div
        className={cn(
          "grid gap-3",
          tab === "split" && "lg:grid-cols-2",
          tab !== "split" && "grid-cols-1"
        )}
      >
        {(tab === "split" || tab === "answer") && (
          <Card
            title="Answer"
            hint="The author's reference solution — never shown to the candidate."
          >
            <CodeBox
              value={code.solution}
              language={language}
              readOnly={readOnly}
              onChange={(v) =>
                onChange({ code: { ...code, solution: v } })
              }
            />
          </Card>
        )}
        {(tab === "split" || tab === "template") && (
          <Card
            title="Template"
            hint="The starter code shown to the candidate."
          >
            <CodeBox
              value={code.starter}
              language={language}
              readOnly={readOnly}
              onChange={(v) => onChange({ code: { ...code, starter: v } })}
            />
          </Card>
        )}
      </div>
    </div>
  );
}

/* ============================================================
 * Card helper
 * ============================================================ */

function Card({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2 rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-1.5">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {hint && (
          <span title={hint} className="cursor-help text-gray-400">
            <HelpCircle size={11} />
          </span>
        )}
      </div>
      {children}
    </section>
  );
}
