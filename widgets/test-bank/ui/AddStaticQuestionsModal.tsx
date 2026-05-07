"use client";

import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, Search } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import {
  AppliedFilterChips,
  FilterButton,
  FilterModal,
  countActiveFilters,
  isFieldActive,
  type FilterField,
  type FilterValues,
} from "@/shared/ui/filter";
import {
  DIFFICULTIES,
  QUESTION_TYPE_LABEL,
  type Question,
  type QuestionType,
} from "@/entities/question";
import { ModalShell } from "./pieces";

const TYPES: QuestionType[] = [
  "essay",
  "multiple-choice",
  "csharp",
  "javascript",
  "testing",
];

/**
 * "Add questions" pick-from-bank modal — dual-tab (Question Bank /
 * Selected Questions), search + filter, paginated table on the left,
 * preview pane on the right when a row is highlighted.
 */
export function AddStaticQuestionsModal({
  alreadySelectedIds,
  onClose,
  onConfirm,
}: {
  alreadySelectedIds: string[];
  onClose: () => void;
  onConfirm: (ids: string[]) => void;
}) {
  const [tab, setTab] = useState<"bank" | "selected">("bank");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [picked, setPicked] = useState<Set<string>>(
    () => new Set(alreadySelectedIds)
  );

  useEffect(() => {
    fetch("/api/questions")
      .then((r) => r.json())
      .then((d) => {
        setQuestions(d.questions ?? []);
        if ((d.questions ?? []).length > 0) {
          setPreviewId(d.questions[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const q of questions) for (const t of q.tags) set.add(t);
    return Array.from(set).sort();
  }, [questions]);

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        id: "type",
        label: "Type",
        kind: "multi-select",
        options: TYPES.map((t) => ({
          value: t,
          label: QUESTION_TYPE_LABEL[t],
        })),
      },
      {
        id: "difficulty",
        label: "Difficulty",
        kind: "multi-select",
        options: DIFFICULTIES.map((d) => ({ value: d, label: d })),
      },
      {
        id: "tags",
        label: "Tags",
        kind: "multi-select",
        options: allTags.map((t) => ({ value: t, label: t })),
      },
    ],
    [allTags]
  );

  function passesFilters(q: Question): boolean {
    for (const f of filterFields) {
      const v = filterValues[f.id];
      if (!isFieldActive(v)) continue;
      if (v?.kind === "multi-select") {
        if (f.id === "type" && !v.values.includes(q.type)) return false;
        if (f.id === "difficulty" && !v.values.includes(q.difficulty))
          return false;
        if (f.id === "tags" && !q.tags.some((t) => v.values.includes(t)))
          return false;
      }
    }
    return true;
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const base =
      tab === "bank" ? questions : questions.filter((q) => picked.has(q.id));
    return base.filter((q) => {
      if (term && !q.title.toLowerCase().includes(term)) return false;
      return passesFilters(q);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, picked, tab, search, filterValues]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (safePage - 1) * perPage,
    safePage * perPage
  );

  const previewQ = previewId
    ? questions.find((q) => q.id === previewId)
    : null;

  function toggle(id: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <ModalShell
      title="Add questions"
      onClose={onClose}
      headerTone="violet"
      width="max-w-6xl"
      footer={
        <>
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(Array.from(picked))}
            className="rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
          >
            Confirm
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-0 md:grid-cols-[2fr_1fr]">
        {/* LEFT — picker */}
        <div className="space-y-3 border-r border-gray-100 p-5">
          <div className="flex items-center gap-1 border-b border-gray-200">
            <TabBtn active={tab === "bank"} onClick={() => setTab("bank")}>
              Questions Bank
            </TabBtn>
            <TabBtn
              active={tab === "selected"}
              onClick={() => setTab("selected")}
            >
              Selected Questions ({picked.size})
            </TabBtn>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative max-w-md flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by Title"
                className="h-9 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm focus:border-violet-500 focus:outline-none"
              />
            </div>
            <FilterButton
              activeCount={countActiveFilters(filterValues)}
              onClick={() => setFilterOpen(true)}
            />
            {countActiveFilters(filterValues) > 0 && (
              <button
                onClick={() => setFilterValues({})}
                className="text-xs font-medium text-gray-600 hover:text-gray-900"
              >
                Reset
              </button>
            )}
          </div>

          {countActiveFilters(filterValues) > 0 && (
            <AppliedFilterChips
              fields={filterFields}
              values={filterValues}
              onRemove={(id) =>
                setFilterValues((p) => {
                  const n = { ...p };
                  delete n[id];
                  return n;
                })
              }
              onClearAll={() => setFilterValues({})}
            />
          )}

          {loading ? (
            <p className="py-12 text-center text-sm text-gray-400">
              Loading questions…
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="p-2">Title</th>
                    <th className="w-24 p-2">Difficulty</th>
                    <th className="w-32 p-2">Type</th>
                    <th className="p-2">Tags</th>
                    <th className="w-16 p-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((q) => {
                    const isPicked = picked.has(q.id);
                    return (
                      <tr
                        key={q.id}
                        onClick={() => setPreviewId(q.id)}
                        className={cn(
                          "cursor-pointer border-t border-gray-100 hover:bg-violet-50/40",
                          previewId === q.id && "bg-violet-50",
                          isPicked && "bg-violet-50/40"
                        )}
                      >
                        <td className="p-2 text-xs">
                          <p className="line-clamp-2 font-medium text-gray-900">
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
                        <td
                          className="p-2 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => toggle(q.id)}
                            className={cn(
                              "inline-flex h-6 w-6 items-center justify-center rounded transition-colors",
                              isPicked
                                ? "bg-red-500 text-white hover:bg-red-600"
                                : "bg-violet-600 text-white hover:bg-violet-700"
                            )}
                            aria-label={isPicked ? "Remove" : "Add"}
                            title={isPicked ? "Remove" : "Add"}
                          >
                            {isPicked ? <Minus size={12} /> : <Plus size={12} />}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {visible.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-8 text-center text-xs text-gray-400"
                      >
                        {tab === "selected"
                          ? "No questions selected yet."
                          : "No questions match this search."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="flex items-center justify-between gap-2 border-t border-gray-100 bg-gray-50 px-2 py-1.5 text-[11px]">
                <span className="text-gray-500">
                  {filtered.length} total
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className="rounded border border-gray-300 bg-white px-1.5 py-0.5 hover:bg-gray-50 disabled:opacity-40"
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={cn(
                          "min-w-[24px] rounded border px-1.5 py-0.5",
                          p === safePage
                            ? "border-violet-600 bg-violet-600 text-white"
                            : "border-gray-300 bg-white text-gray-700"
                        )}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    className="rounded border border-gray-300 bg-white px-1.5 py-0.5 hover:bg-gray-50 disabled:opacity-40"
                  >
                    ›
                  </button>
                </div>
                <span className="text-gray-500">10 / page</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — preview pane */}
        <div className="bg-gray-50 p-5">
          {previewQ ? (
            <div className="space-y-3">
              <h4 className="text-base font-semibold text-gray-900">
                {previewQ.title}
              </h4>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Description
                </p>
                <p className="mt-1 whitespace-pre-wrap text-xs text-gray-700">
                  {previewQ.questionContent}
                </p>
              </div>
              {previewQ.code && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Answers
                  </p>
                  <pre className="mt-1 max-h-48 overflow-auto rounded-lg border border-gray-700 bg-[#1e1e2e] p-2 font-mono text-[11px] text-gray-100">
                    {previewQ.code.solution}
                  </pre>
                </div>
              )}
              {previewQ.multipleChoice && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Choices
                  </p>
                  <ul className="mt-1 space-y-1">
                    {previewQ.multipleChoice.options.map((opt, i) => (
                      <li
                        key={opt.id}
                        className={cn(
                          "rounded border px-2 py-1 text-xs",
                          opt.correct
                            ? "border-green-300 bg-green-50 text-green-800"
                            : "border-gray-200 bg-white text-gray-700"
                        )}
                      >
                        {String.fromCharCode(97 + i)}. {opt.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {previewQ.testing && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Key Ideas
                  </p>
                  <ul className="mt-1 list-decimal space-y-0.5 pl-5 text-xs text-gray-700">
                    {previewQ.testing.ideas.map((i) => (
                      <li key={i.id}>{i.text}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="py-12 text-center text-xs text-gray-400">
              Click a row to preview the question here.
            </p>
          )}
        </div>
      </div>

      <FilterModal
        open={filterOpen}
        fields={filterFields}
        initialValues={filterValues}
        onApply={(v) => {
          setFilterValues(v);
          setFilterOpen(false);
          setPage(1);
        }}
        onCancel={() => setFilterOpen(false)}
      />
    </ModalShell>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "border-b-2 px-3 py-2 text-xs font-medium transition-colors",
        active
          ? "border-violet-600 text-violet-700"
          : "border-transparent text-gray-500 hover:text-gray-700"
      )}
    >
      {children}
    </button>
  );
}

