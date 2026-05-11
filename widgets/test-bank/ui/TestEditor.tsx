"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Eye,
  FileText,
  GripVertical,
  Layers,
  Minus,
  Pencil,
  Plus,
  X,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useToast } from "@/shared/ui/toast";
import {
  DIFFICULTIES,
  QUESTION_CATEGORIES,
  QUESTION_TYPE_LABEL,
  categoryLabel,
  type Difficulty,
  type Question,
  type QuestionType,
} from "@/entities/question";
import {
  TEST_STATUSES,
  TEST_TYPES,
  newCondition,
  type CompositionMode,
  type DynamicCondition,
  type Test,
  type TestStatus,
  type TestType,
} from "@/entities/test";
import { AddStaticQuestionsModal } from "./AddStaticQuestionsModal";
import { PreviewTab } from "./PreviewTab";
import { SessionsTab } from "./SessionsTab";

type Tab = "general" | "sessions" | "preview";

const QUESTION_TYPES: QuestionType[] = [
  "essay",
  "multiple-choice",
  "csharp",
  "javascript",
  "testing",
];

interface Props {
  /** When provided loads that test for view/edit. Otherwise create mode. */
  id?: string;
  /** True = read-only "view" mode with an Edit button. */
  readOnly?: boolean;
}

export function TestEditor({ id, readOnly = false }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [draft, setDraft] = useState<Test | null>(null);
  const [tab, setTab] = useState<Tab>("general");
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  // Question library — needed to render names in the static questions table.
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const isCreate = !id;

  useEffect(() => {
    fetch("/api/questions")
      .then((r) => r.json())
      .then((d) => setQuestions(d.questions ?? []));
  }, []);

  useEffect(() => {
    if (!id) {
      const now = new Date().toISOString();
      setDraft({
        id: "draft",
        title: "",
        type: "Assesment",
        status: "Draft",
        durationMinutes: 60,
        tags: [],
        description: "",
        passRatioPercent: 70,
        canSkipQuestion: true,
        compositionMode: "static",
        staticQuestions: [],
        dynamicConditions: [],
        shuffleQuestions: false,
        createdAtISO: now,
        updatedAtISO: now,
      });
      setLoading(false);
      return;
    }
    fetch(`/api/tests/${id}`).then(async (r) => {
      if (!r.ok) {
        showToast("error", "Test not found.");
        router.push("/tests");
        return;
      }
      const d = await r.json();
      setDraft(d.test);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading || !draft) {
    return (
      <div className="px-8 py-12 text-center text-sm text-gray-400">
        Loading…
      </div>
    );
  }

  function patch(p: Partial<Test>) {
    setDraft((d) => (d ? { ...d, ...p } : d));
  }

  async function save() {
    if (!draft) return;
    if (!draft.title.trim()) {
      showToast("error", "Title is required.");
      setTab("general");
      return;
    }
    setSaving(true);
    try {
      if (isCreate) {
        const res = await fetch("/api/tests", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(draft),
        });
        if (!res.ok) {
          showToast("error", "Could not create test.");
          return;
        }
        const data = await res.json();
        showToast("success", "Test created.");
        router.push(`/tests/${data.test.id}`);
      } else {
        const res = await fetch(`/api/tests/${id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(draft),
        });
        if (!res.ok) {
          showToast("error", "Could not save changes.");
          return;
        }
        showToast("success", "Test saved.");
        router.push(`/tests/${id}`);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-8 py-6">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <Link
            href="/tests"
            className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800"
          >
            <span className="rounded bg-gray-100 px-1 py-0.5 text-[10px]">
              Test
            </span>
            /
            <span className="ml-1 text-violet-700">
              {draft.title || (isCreate ? "New Test" : "Untitled")}
            </span>
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
            {draft.title || (isCreate ? "Create New Test" : "Test")}
          </h1>
          {draft.description && readOnly && (
            <p className="mt-1 max-w-3xl text-sm text-gray-500">
              {draft.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {readOnly ? (
            <Link
              href={`/tests/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
            >
              <Pencil size={14} />
              Edit
            </Link>
          ) : (
            <>
              <Link
                href={isCreate ? "/tests" : `/tests/${id}`}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                onClick={save}
                disabled={saving || !draft.title.trim()}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tab strip */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center gap-1 border-b border-gray-200 px-2 pt-2">
          <TabButton
            active={tab === "general"}
            onClick={() => setTab("general")}
            icon={<FileText size={13} />}
          >
            General Information
          </TabButton>
          {/* Sessions only make sense once the test has an id. */}
          {!isCreate && (
            <TabButton
              active={tab === "sessions"}
              onClick={() => setTab("sessions")}
              icon={<Layers size={13} />}
            >
              Test Session
            </TabButton>
          )}
          <TabButton
            active={tab === "preview"}
            onClick={() => setTab("preview")}
            icon={<Eye size={13} />}
          >
            Preview
          </TabButton>
        </div>

        <div className="p-5">
          {tab === "general" && (
            <GeneralInfoPanel
              draft={draft}
              onChange={patch}
              questions={questions}
              readOnly={readOnly}
              onOpenPicker={() => setPickerOpen(true)}
            />
          )}
          {tab === "sessions" && !isCreate && id && (
            <SessionsTab testId={id} testTitle={draft.title} />
          )}
          {tab === "preview" && <PreviewTab test={draft} />}
        </div>
      </div>

      {pickerOpen && (
        <AddStaticQuestionsModal
          alreadySelectedIds={draft.staticQuestions.map((s) => s.questionId)}
          onClose={() => setPickerOpen(false)}
          onConfirm={(ids) => {
            patch({
              staticQuestions: ids.map((qid, order) => ({
                questionId: qid,
                order,
              })),
            });
            setPickerOpen(false);
          }}
        />
      )}
    </div>
  );
}

/* ============================================================
 * General Information panel
 * ============================================================ */

function GeneralInfoPanel({
  draft,
  onChange,
  questions,
  readOnly,
  onOpenPicker,
}: {
  draft: Test;
  onChange: (p: Partial<Test>) => void;
  questions: Question[];
  readOnly?: boolean;
  onOpenPicker: () => void;
}) {
  const [tagInput, setTagInput] = useState("");
  const fieldDisabled = Boolean(readOnly);
  const questionById = useMemo(
    () => new Map(questions.map((q) => [q.id, q])),
    [questions]
  );

  function addTag(t: string) {
    const v = t.trim();
    if (!v || draft.tags.includes(v)) return;
    onChange({ tags: [...draft.tags, v] });
  }
  function removeTag(t: string) {
    onChange({ tags: draft.tags.filter((x) => x !== t) });
  }

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-violet-700">
        General Information
      </h2>

      <Field label="Title" required>
        <input
          value={draft.title}
          disabled={fieldDisabled}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g. Data Scientist Intern Test"
          className="input"
        />
      </Field>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Field label="Type" required>
          <SelectBox
            value={draft.type}
            disabled={fieldDisabled}
            options={TEST_TYPES.map((t) => ({ value: t, label: t }))}
            onChange={(v) => onChange({ type: v as TestType })}
          />
        </Field>
        <Field label="Status" required>
          <SelectBox
            value={draft.status}
            disabled={fieldDisabled}
            options={TEST_STATUSES.map((s) => ({ value: s, label: s }))}
            onChange={(v) => onChange({ status: v as TestStatus })}
          />
        </Field>
        <Field label="Duration (m)" required>
          <input
            type="number"
            min={1}
            value={draft.durationMinutes}
            disabled={fieldDisabled}
            onChange={(e) =>
              onChange({
                durationMinutes: Math.max(
                  1,
                  Number(e.target.value) || 1
                ),
              })
            }
            className="input"
          />
        </Field>
      </div>

      <Field label="Tags" required>
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2 py-1.5">
          {draft.tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[11px] text-gray-700"
            >
              {t}
              {!fieldDisabled && (
                <button
                  onClick={() => removeTag(t)}
                  className="text-gray-400 hover:text-red-600"
                  aria-label={`Remove ${t}`}
                >
                  <X size={10} />
                </button>
              )}
            </span>
          ))}
          {!fieldDisabled && (
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addTag(tagInput);
                  setTagInput("");
                }
                if (
                  e.key === "Backspace" &&
                  !tagInput &&
                  draft.tags.length > 0
                ) {
                  removeTag(draft.tags[draft.tags.length - 1]);
                }
              }}
              placeholder={
                draft.tags.length === 0 ? "Type a tag and press Enter…" : ""
              }
              className="min-w-[120px] flex-1 border-0 bg-transparent px-1 py-0.5 text-sm focus:outline-none"
            />
          )}
        </div>
      </Field>

      <Field label="Description">
        <textarea
          value={draft.description}
          disabled={fieldDisabled}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={3}
          placeholder="What is this test for?"
          className="input resize-none"
        />
      </Field>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[200px_1fr]">
        <Field label="Pass Ratio (%)" required>
          <input
            type="number"
            min={0}
            max={100}
            value={draft.passRatioPercent}
            disabled={fieldDisabled}
            onChange={(e) =>
              onChange({
                passRatioPercent: Math.max(
                  0,
                  Math.min(100, Number(e.target.value) || 0)
                ),
              })
            }
            className="input"
          />
        </Field>
        <label className="flex items-end gap-2 pb-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={draft.canSkipQuestion}
            disabled={fieldDisabled}
            onChange={(e) => onChange({ canSkipQuestion: e.target.checked })}
            className="accent-violet-600"
          />
          Can skip question
        </label>
      </div>

      {/* Question Composition */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-violet-700">
            Question Composition
          </h3>
          {draft.compositionMode === "dynamic" ? (
            <button
              disabled={fieldDisabled}
              className="rounded-lg border border-violet-300 bg-white px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-50 disabled:opacity-50"
              title="Generates a sample test from the configured pool — mocked."
            >
              Generate Example
            </button>
          ) : (
            <button
              onClick={onOpenPicker}
              disabled={fieldDisabled}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium",
                fieldDisabled
                  ? "border-gray-200 text-gray-400"
                  : "border-violet-300 bg-white text-violet-700 hover:bg-violet-50"
              )}
            >
              Add Question
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-[260px_1fr]">
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700">Mode *</p>
            <div className="inline-flex rounded-md border border-gray-300 bg-white p-0.5">
              {(["static", "dynamic"] as CompositionMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  disabled={fieldDisabled}
                  onClick={() => onChange({ compositionMode: m })}
                  className={cn(
                    "rounded px-3 py-1 text-xs font-medium transition-colors",
                    draft.compositionMode === m
                      ? "bg-violet-600 text-white"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  {m === "static" ? "Static" : "Dynamic"}
                </button>
              ))}
            </div>
            {!readOnly && (
              <label className="mt-2 flex items-center gap-2 text-xs text-gray-700">
                <ToggleSwitch
                  on={draft.shuffleQuestions}
                  onChange={(v) => onChange({ shuffleQuestions: v })}
                />
                Shuffle the order of question composition
              </label>
            )}
          </div>

          <div className="space-y-4">
            {/* Pool picker — shown in BOTH modes. In static mode it
             *  IS the test composition; in dynamic mode it's the pool
             *  the conditions filter against. Same StaticQuestionsTable
             *  widget either way to keep the picker UX consistent. */}
            <div>
              {draft.compositionMode === "dynamic" && (
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-violet-700">
                  Question pool · {draft.staticQuestions.length} added
                </p>
              )}
              <StaticQuestionsTable
                draft={draft}
                onChange={onChange}
                questionById={questionById}
                readOnly={fieldDisabled}
              />
              {draft.compositionMode === "dynamic" &&
                draft.staticQuestions.length === 0 && (
                  <p className="mt-1 text-[11px] text-amber-700">
                    Add at least one question to the pool — conditions
                    only filter questions that exist here.
                  </p>
                )}
            </div>

            {draft.compositionMode === "dynamic" && (
              <DynamicConditionsEditor
                draft={draft}
                onChange={onChange}
                readOnly={fieldDisabled}
                poolQuestions={draft.staticQuestions
                  .map((s) => questionById.get(s.questionId))
                  .filter((q): q is Question => Boolean(q))}
              />
            )}
          </div>
        </div>
      </section>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgb(209 213 219);
          background: white;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: rgb(17 24 39);
        }
        :global(.input:focus) {
          border-color: rgb(139 92 246);
          outline: none;
        }
        :global(.input:disabled) {
          background: rgb(249 250 251);
          color: rgb(75 85 99);
        }
      `}</style>
    </div>
  );
}

/* ============================================================
 * Static questions table
 * ============================================================ */

function StaticQuestionsTable({
  draft,
  onChange,
  questionById,
  readOnly,
}: {
  draft: Test;
  onChange: (p: Partial<Test>) => void;
  questionById: Map<string, Question>;
  readOnly: boolean;
}) {
  const rows = draft.staticQuestions
    .slice()
    .sort((a, b) => a.order - b.order);

  function remove(qid: string) {
    onChange({
      staticQuestions: draft.staticQuestions
        .filter((s) => s.questionId !== qid)
        .map((s, i) => ({ ...s, order: i })),
    });
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center text-xs text-gray-500">
        No questions added yet — click <strong>Add Question</strong> to pick
        from the question bank.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          <tr>
            <th className="w-8 p-2"></th>
            <th className="p-2">Question Title</th>
            <th className="w-24 p-2">Difficulty</th>
            <th className="w-32 p-2">Type</th>
            <th className="p-2">Tags</th>
            <th className="w-16 p-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const q = questionById.get(row.questionId);
            if (!q) {
              return (
                <tr key={row.questionId} className="border-t border-gray-100">
                  <td colSpan={6} className="p-2 text-xs italic text-gray-400">
                    (question not found — may have been deleted)
                  </td>
                </tr>
              );
            }
            return (
              <tr key={q.id} className="border-t border-gray-100">
                <td className="p-2 text-gray-400">
                  <GripVertical size={12} />
                </td>
                <td className="p-2 text-xs">
                  <p className="line-clamp-2 font-medium text-gray-800">
                    {q.title}
                  </p>
                </td>
                <td className="p-2 text-[11px]">{q.difficulty}</td>
                <td className="p-2 text-[11px]">
                  {QUESTION_TYPE_LABEL[q.type]}
                </td>
                <td className="p-2">
                  <div className="flex flex-wrap gap-0.5">
                    {q.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center rounded border border-gray-200 bg-white px-1 py-0.5 text-[10px] text-gray-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-2 text-right">
                  <button
                    onClick={() => remove(q.id)}
                    disabled={readOnly}
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded transition-colors",
                      readOnly
                        ? "bg-gray-100 text-gray-400"
                        : "bg-red-500 text-white hover:bg-red-600"
                    )}
                    aria-label="Remove question"
                    title="Remove"
                  >
                    <Minus size={12} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ============================================================
 * Dynamic conditions editor
 * ============================================================ */

function DynamicConditionsEditor({
  draft,
  onChange,
  readOnly,
  poolQuestions,
}: {
  draft: Test;
  onChange: (p: Partial<Test>) => void;
  readOnly: boolean;
  /** Questions currently in the test's pool (`draft.staticQuestions`).
   *  Each condition's match count is derived from how many of these
   *  satisfy its filters. */
  poolQuestions: Question[];
}) {
  const [type, setType] = useState<QuestionType | "">("");
  const [difficulty, setDifficulty] = useState<Difficulty | "">("");
  const [tagsInput, setTagsInput] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);

  function add() {
    const tags = tagsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!type && !difficulty && tags.length === 0 && categoryIds.length === 0)
      return;
    const c = newCondition();
    c.type = (type || undefined) as QuestionType | undefined;
    c.difficulty = (difficulty || undefined) as Difficulty | undefined;
    c.tags = tags;
    c.categoryIds = categoryIds.length > 0 ? [...categoryIds] : undefined;
    c.quantity = 1;
    c.order = draft.dynamicConditions.length;
    onChange({ dynamicConditions: [...draft.dynamicConditions, c] });
    setType("");
    setDifficulty("");
    setTagsInput("");
    setCategoryIds([]);
  }

  function remove(id: string) {
    onChange({
      dynamicConditions: draft.dynamicConditions
        .filter((c) => c.id !== id)
        .map((c, i) => ({ ...c, order: i })),
    });
  }

  function patchCondition(id: string, p: Partial<DynamicCondition>) {
    onChange({
      dynamicConditions: draft.dynamicConditions.map((c) =>
        c.id === id ? { ...c, ...p } : c
      ),
    });
  }

  /** Count how many questions in the pool match a condition's filters.
   *  All filters AND together; tags + categories use OR within a list. */
  function poolMatchCount(c: DynamicCondition): number {
    return poolQuestions.filter((q) => {
      if (c.type && q.type !== c.type) return false;
      if (c.difficulty && q.difficulty !== c.difficulty) return false;
      if (c.tags.length > 0 && !c.tags.some((t) => q.tags.includes(t)))
        return false;
      if (
        c.categoryIds &&
        c.categoryIds.length > 0 &&
        (!q.categoryId || !c.categoryIds.includes(q.categoryId))
      )
        return false;
      return true;
    }).length;
  }

  /** Total questions a generated session will contain — the sum of
   *  every condition's `quantity`. Surfaced at the bottom of the
   *  table so the HR can sanity-check before saving. */
  const totalQuantity = draft.dynamicConditions.reduce(
    (sum, c) => sum + (c.quantity || 0),
    0
  );
  const poolSize = poolQuestions.length;

  return (
    <div className="space-y-3">
      {/* Builder row */}
      {!readOnly && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p className="mb-2 text-xs font-medium text-gray-700">
            Build a new condition
          </p>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                Type
              </label>
              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value as QuestionType | "")
                }
                className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs focus:border-violet-500 focus:outline-none"
              >
                <option value="">Please select</option>
                {QUESTION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {QUESTION_TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(e.target.value as Difficulty | "")
                }
                className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs focus:border-violet-500 focus:outline-none"
              >
                <option value="">Please select</option>
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                Tags
              </label>
              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="comma-separated"
                className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Category multi-select — drives an OR filter against
           *  Question.categoryId. Empty = no category constraint. */}
          <div className="mt-2">
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">
              Category
            </label>
            <select
              multiple
              value={categoryIds}
              onChange={(e) =>
                setCategoryIds(
                  Array.from(e.target.selectedOptions, (o) => o.value)
                )
              }
              className="block h-28 w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-xs focus:border-violet-500 focus:outline-none"
            >
              {QUESTION_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label} · {c.group}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[10px] text-gray-500">
              Hold ⌘/Ctrl to pick multiple. Empty = any category.
            </p>
          </div>

          <button
            onClick={add}
            className="mt-2 inline-flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700"
          >
            <Plus size={12} />
            Add conditions
          </button>
        </div>
      )}

      {draft.dynamicConditions.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center text-xs text-gray-500">
          No conditions yet. Build one above to draw questions from the bank
          dynamically.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="w-8 p-2"></th>
                <th className="w-24 p-2">Difficulty</th>
                <th className="w-32 p-2">Type</th>
                <th className="p-2">Categories</th>
                <th className="p-2">Tags</th>
                <th className="w-24 p-2">Quantity</th>
                <th className="w-16 p-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {draft.dynamicConditions
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((c) => {
                  const matchCount = poolMatchCount(c);
                  const overflowing = c.quantity > matchCount;
                  return (
                    <tr
                      key={c.id}
                      className={cn(
                        "border-t border-gray-100",
                        overflowing && "bg-red-50/40"
                      )}
                    >
                      <td className="p-2 text-gray-400">
                        <GripVertical size={12} />
                      </td>
                      <td className="p-2 text-[11px]">
                        {c.difficulty ?? (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="p-2 text-[11px]">
                        {c.type ? QUESTION_TYPE_LABEL[c.type] : "—"}
                      </td>
                      <td className="p-2">
                        <div className="flex flex-wrap gap-0.5">
                          {!c.categoryIds || c.categoryIds.length === 0 ? (
                            <span className="text-[10px] text-gray-300">
                              Any
                            </span>
                          ) : (
                            c.categoryIds.map((cid) => (
                              <span
                                key={cid}
                                className="inline-flex items-center rounded bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-700"
                              >
                                {categoryLabel(cid)}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex flex-wrap gap-0.5">
                          {c.tags.length === 0 ? (
                            <span className="text-[10px] text-gray-300">
                              Any
                            </span>
                          ) : (
                            c.tags.map((t) => (
                              <span
                                key={t}
                                className="inline-flex items-center rounded border border-gray-200 bg-white px-1 py-0.5 text-[10px] text-gray-700"
                              >
                                {t}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1 text-[11px]">
                          <input
                            type="number"
                            min={1}
                            value={c.quantity}
                            disabled={readOnly}
                            onChange={(e) =>
                              patchCondition(c.id, {
                                quantity: Math.max(
                                  1,
                                  Number(e.target.value) || 1
                                ),
                              })
                            }
                            className={cn(
                              "w-12 rounded-md border bg-white px-1 py-0.5 text-center text-[11px]",
                              overflowing
                                ? "border-red-300"
                                : "border-gray-300"
                            )}
                          />
                          <span
                            className={cn(
                              overflowing
                                ? "font-semibold text-red-700"
                                : "text-gray-500"
                            )}
                            title="Questions in the pool that match these filters right now"
                          >
                            / {matchCount}
                          </span>
                        </div>
                        {overflowing && (
                          <p className="mt-0.5 text-[10px] text-red-700">
                            Exceeds pool matches — only {matchCount} draw
                            available.
                          </p>
                        )}
                      </td>
                      <td className="p-2 text-right">
                        <button
                          onClick={() => remove(c.id)}
                          disabled={readOnly}
                          className={cn(
                            "inline-flex h-6 w-6 items-center justify-center rounded transition-colors",
                            readOnly
                              ? "bg-gray-100 text-gray-400"
                              : "bg-red-500 text-white hover:bg-red-600"
                          )}
                          aria-label="Remove condition"
                          title="Remove"
                        >
                          <Minus size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
            {/* Totals row — sum of every condition's quantity. Tinted
             *  amber when total > pool size to flag impossible draws. */}
            <tfoot className="border-t-2 border-gray-200 bg-violet-50/50 text-[11px]">
              <tr>
                <td className="p-2" colSpan={5}>
                  <span className="font-semibold text-violet-700">
                    Total questions per session
                  </span>
                  <span className="ml-2 text-gray-500">
                    sum of every condition&rsquo;s quantity
                  </span>
                </td>
                <td className="p-2">
                  <span
                    className={cn(
                      "font-semibold tabular-nums",
                      totalQuantity > poolSize
                        ? "text-amber-700"
                        : "text-violet-700"
                    )}
                    title={
                      totalQuantity > poolSize
                        ? `Total ${totalQuantity} exceeds pool size ${poolSize}`
                        : ""
                    }
                  >
                    {totalQuantity} / {poolSize}
                  </span>
                </td>
                <td />
              </tr>
              {totalQuantity > poolSize && (
                <tr>
                  <td colSpan={7} className="px-2 pb-2 text-[10px] text-amber-700">
                    Heads up — your conditions try to draw{" "}
                    {totalQuantity} questions but the pool only holds{" "}
                    {poolSize}. Add more questions to the pool or lower
                    the per-condition quantity.
                  </td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

/* ============================================================
 * Bits
 * ============================================================ */

function TabButton({
  active,
  icon,
  onClick,
  children,
}: {
  active: boolean;
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center gap-1.5 rounded-t-md border-b-2 px-3 py-2 text-xs font-medium transition-colors",
        active
          ? "border-violet-600 text-violet-700"
          : "border-transparent text-gray-500 hover:text-gray-800"
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function SelectBox({
  value,
  options,
  onChange,
  disabled,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-sm focus:border-violet-500 focus:outline-none disabled:bg-gray-50"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
      />
    </div>
  );
}

function ToggleSwitch({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={cn(
        "relative inline-flex h-4 w-7 items-center rounded-full transition-colors",
        on ? "bg-violet-600" : "bg-gray-300"
      )}
    >
      <span
        className={cn(
          "inline-block h-3 w-3 transform rounded-full bg-white shadow transition",
          on ? "translate-x-3.5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

