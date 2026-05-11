"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  CircleDot,
  Code2,
  FileText,
  Pencil,
  Sparkles,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useToast } from "@/shared/ui/toast";
import {
  DIFFICULTIES,
  QUESTION_TYPE_LABEL,
  defaultPayloadFor,
  groupedCategories,
  isCodeType,
  type Difficulty,
  type Question,
  type QuestionCategoryId,
  type QuestionStatus,
  type QuestionType,
} from "@/entities/question";
import { AnswerPanel } from "./AnswerPanels";
import { TestCasesPanel } from "./TestCasesPanel";
import { AIGenerateModal } from "./AIGenerateModal";
import { TagChips } from "./pieces";

const TYPES: QuestionType[] = [
  "essay",
  "multiple-choice",
  "csharp",
  "javascript",
  "testing",
];
const STATUSES: QuestionStatus[] = ["Draft", "Unpublished", "Published"];

type Tab = "general" | "answer" | "testCases";

interface Props {
  /** When provided, loads the existing record for editing. */
  id?: string;
  /** When true, render in read-only "view" mode with an Edit toggle. */
  readOnly?: boolean;
}

export function QuestionEditor({ id, readOnly = false }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [draft, setDraft] = useState<Question | null>(null);
  const [tab, setTab] = useState<Tab>("general");
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [aiOpen, setAIOpen] = useState(false);
  const isCreate = !id;

  useEffect(() => {
    if (!id) {
      const now = new Date().toISOString();
      setDraft({
        id: "draft",
        title: "",
        type: "essay",
        difficulty: "Medium",
        status: "Draft",
        tags: [],
        questionContent: "",
        createdAtISO: now,
        updatedAtISO: now,
        ...defaultPayloadFor("essay"),
      });
      setLoading(false);
      return;
    }
    fetch(`/api/questions/${id}`).then(async (r) => {
      if (!r.ok) {
        showToast("error", "Question not found.");
        router.push("/questions");
        return;
      }
      const d = await r.json();
      setDraft(d.question);
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

  function patch(p: Partial<Question>) {
    setDraft((d) => (d ? { ...d, ...p } : d));
  }

  function changeType(next: QuestionType) {
    if (!draft) return;
    if (next === draft.type) return;
    // Strip stale per-type payload, install defaults for the new type so the
    // Answer & Template tab is never empty.
    const cleaned: Question = {
      ...draft,
      multipleChoice: undefined,
      essay: undefined,
      testing: undefined,
      code: undefined,
    };
    setDraft({ ...cleaned, type: next, ...defaultPayloadFor(next) });
    // The Test Cases tab disappears if we switch off a code type.
    if (!isCodeType(next) && tab === "testCases") setTab("answer");
  }

  function applyAIDraft(generated: Question) {
    if (!draft) return;
    setAIOpen(false);
    setDraft({
      ...draft,
      title: draft.title || generated.title,
      type: generated.type,
      difficulty: generated.difficulty,
      tags: Array.from(new Set([...(draft.tags ?? []), ...(generated.tags ?? [])])),
      questionContent: generated.questionContent,
      multipleChoice: generated.multipleChoice ?? draft.multipleChoice,
      essay: generated.essay ?? draft.essay,
      testing: generated.testing ?? draft.testing,
      code: generated.code ?? draft.code,
    });
    if (!isCodeType(generated.type) && tab === "testCases") setTab("answer");
    showToast(
      "success",
      `AI drafted a ${QUESTION_TYPE_LABEL[generated.type]} question — review and Save when ready.`
    );
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
        const res = await fetch("/api/questions", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(draft),
        });
        if (!res.ok) {
          showToast("error", "Could not create question.");
          return;
        }
        const data = await res.json();
        showToast("success", `Question created.`);
        router.push(`/questions/${data.question.id}`);
      } else {
        const res = await fetch(`/api/questions/${id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(draft),
        });
        if (!res.ok) {
          showToast("error", "Could not save changes.");
          return;
        }
        showToast("success", "Question saved.");
        router.push(`/questions/${id}`);
      }
    } finally {
      setSaving(false);
    }
  }

  const showTestCases = isCodeType(draft.type);
  // If the current tab becomes invalid (e.g. user switched off a code type),
  // snap back to General Information.
  const safeTab: Tab =
    tab === "testCases" && !showTestCases ? "answer" : tab;

  return (
    <div className="px-8 py-6">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <Link
            href="/questions"
            className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800"
          >
            <span className="rounded bg-gray-100 px-1 py-0.5 text-[10px]">
              Questions
            </span>
            /
          </Link>
          <span className="ml-1 text-xs font-medium text-violet-700">
            {isCreate
              ? "Add new Question"
              : draft.title || "What are the best practices for writing clean code?"}
          </span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
            {isCreate ? "Add new Question" : "Questions"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            A centralized hub for educators to create, store, and manage
            various assessment questions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {readOnly ? (
            <Link
              href={`/questions/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
            >
              <Pencil size={14} />
              Edit
            </Link>
          ) : (
            <>
              <button
                onClick={() => setAIOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-violet-300 bg-white px-3 py-2 text-sm font-medium text-violet-700 hover:bg-violet-50"
              >
                <Sparkles size={14} />
                AI Generate
              </button>
              <Link
                href={isCreate ? "/questions" : `/questions/${id}`}
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
            active={safeTab === "general"}
            onClick={() => setTab("general")}
            icon={<FileText size={13} />}
          >
            General Information
          </TabButton>
          <TabButton
            active={safeTab === "answer"}
            onClick={() => setTab("answer")}
            icon={<CircleDot size={13} />}
          >
            Answer &amp;Template
          </TabButton>
          {showTestCases && (
            <TabButton
              active={safeTab === "testCases"}
              onClick={() => setTab("testCases")}
              icon={<Code2 size={13} />}
            >
              Test Cases
            </TabButton>
          )}
        </div>

        <div className="p-5">
          {safeTab === "general" && (
            <GeneralInfoForm
              draft={draft}
              onChange={patch}
              readOnly={readOnly}
              onChangeType={changeType}
            />
          )}
          {safeTab === "answer" && (
            <AnswerPanel
              question={draft}
              onChange={patch}
              readOnly={readOnly}
            />
          )}
          {safeTab === "testCases" && showTestCases && (
            <TestCasesPanel
              question={draft}
              onChange={patch}
              readOnly={readOnly}
            />
          )}
        </div>
      </div>

      {aiOpen && (
        <AIGenerateModal
          defaultType={draft.type}
          defaultDifficulty={draft.difficulty}
          defaultTags={draft.tags}
          onClose={() => setAIOpen(false)}
          onAccept={applyAIDraft}
        />
      )}
    </div>
  );
}

/* ============================================================
 * General information form — Title / Type / Difficulty / Status
 * / Tags / Question content
 * ============================================================ */

function GeneralInfoForm({
  draft,
  onChange,
  onChangeType,
  readOnly,
}: {
  draft: Question;
  onChange: (p: Partial<Question>) => void;
  onChangeType: (t: QuestionType) => void;
  readOnly?: boolean;
}) {
  const [tagInput, setTagInput] = useState("");

  function addTag(t: string) {
    const v = t.trim();
    if (!v) return;
    if (draft.tags.includes(v)) return;
    onChange({ tags: [...draft.tags, v] });
  }

  function removeTag(t: string) {
    onChange({ tags: draft.tags.filter((x) => x !== t) });
  }

  return (
    <div className="space-y-4">
      <Field label="Title" required>
        <input
          value={draft.title}
          disabled={readOnly}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g. What are the best practices for writing clean code?"
          className="input"
        />
      </Field>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Field label="Type" required>
          <SelectBox
            value={draft.type}
            disabled={readOnly}
            onChange={(v) => onChangeType(v as QuestionType)}
            options={TYPES.map((t) => ({
              value: t,
              label: QUESTION_TYPE_LABEL[t],
            }))}
          />
        </Field>
        <Field label="Difficulty" required>
          <SelectBox
            value={draft.difficulty}
            disabled={readOnly}
            onChange={(v) => onChange({ difficulty: v as Difficulty })}
            options={DIFFICULTIES.map((d) => ({ value: d, label: d }))}
          />
        </Field>
        <Field label="Status" required>
          <SelectBox
            value={draft.status}
            disabled={readOnly}
            onChange={(v) => onChange({ status: v as QuestionStatus })}
            options={STATUSES.map((s) => ({ value: s, label: s }))}
          />
        </Field>
      </div>

      {/* Category — picked from a fixed catalog so the dynamic-test
       *  category filter has a stable vocabulary to match against. */}
      <Field label="Category">
        <select
          value={draft.categoryId ?? ""}
          disabled={readOnly}
          onChange={(e) =>
            onChange({
              categoryId: e.target.value
                ? (e.target.value as QuestionCategoryId)
                : undefined,
            })
          }
          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
        >
          <option value="">Uncategorised</option>
          {groupedCategories().map((g) => (
            <optgroup key={g.group} label={g.group}>
              {g.items.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </Field>

      <Field label="Tags" required>
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2 py-1.5">
          <TagChips tags={draft.tags} onRemove={readOnly ? undefined : removeTag} />
          {!readOnly && (
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addTag(tagInput);
                  setTagInput("");
                }
                if (e.key === "Backspace" && !tagInput && draft.tags.length > 0) {
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

      <Field label="Question content" required>
        <textarea
          value={draft.questionContent}
          disabled={readOnly}
          onChange={(e) => onChange({ questionContent: e.target.value })}
          rows={5}
          placeholder="Describe the question — markdown is fine."
          className="input resize-none"
        />
      </Field>

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

