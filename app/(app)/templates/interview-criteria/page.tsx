"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bold,
  ChevronRight,
  Edit3,
  HelpCircle,
  Italic,
  Paperclip,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useToast } from "@/shared/ui/toast";
import {
  FilterButton,
  FilterModal,
  countActiveFilters,
  isFieldActive,
  type FilterField,
  type FilterValues,
} from "@/shared/ui/filter";
import type {
  CriterionTemplate,
  BehavioralGuideline,
} from "@/entities/criterion-template";
import type {
  ScorecardTemplate,
  ScorecardCriterionTemplate,
} from "@/entities/scorecard-template";

type Tab = "scorecard" | "criteria";
type Modal =
  | { kind: "criterion-new" }
  | { kind: "criterion-view"; id: string }
  | { kind: "criterion-edit"; id: string }
  | { kind: "scorecard-new" }
  | { kind: "scorecard-view"; id: string }
  | { kind: "scorecard-edit"; id: string }
  | null;

const EMPTY_GUIDELINE: BehavioralGuideline = {
  poor: "",
  novice: "",
  intermediate: "",
  good: "",
  expert: "",
};

export default function InterviewCriteriaTemplatePage() {
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>("scorecard");
  const [criteria, setCriteria] = useState<CriterionTemplate[]>([]);
  const [scorecards, setScorecards] = useState<ScorecardTemplate[]>([]);
  const [modal, setModal] = useState<Modal>(null);

  async function refreshCriteria() {
    const res = await fetch("/api/criterion-templates");
    const data = await res.json();
    setCriteria(data.items ?? []);
  }
  async function refreshScorecards() {
    const res = await fetch("/api/scorecard-templates");
    const data = await res.json();
    setScorecards(data.templates ?? []);
  }
  useEffect(() => {
    void refreshCriteria();
    void refreshScorecards();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-8 py-5">
        <div className="flex items-center gap-1.5">
          <h1 className="text-xl font-bold text-gray-900">
            Interview Criteria Template
          </h1>
          <button
            className="text-gray-400 hover:text-gray-600"
            title="Manage scorecards and criteria used by interview steps."
          >
            <HelpCircle size={14} />
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Manage the scorecards and reusable criteria your interviewers see
          when scoring candidates.
        </p>
      </header>

      <div className="px-8 py-6">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {/* Sub-tabs */}
          <nav className="flex gap-2 border-b border-gray-200 px-4">
            {(
              [
                { id: "scorecard", label: "Scorecard" },
                { id: "criteria", label: "Criteria" },
              ] as { id: Tab; label: string }[]
            ).map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "relative px-4 py-3 text-sm font-medium transition-colors",
                    active
                      ? "text-violet-700"
                      : "text-gray-500 hover:text-gray-800"
                  )}
                >
                  {t.label}
                  {active && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-violet-600" />
                  )}
                </button>
              );
            })}
          </nav>

          {tab === "scorecard" ? (
            <ScorecardTab
              scorecards={scorecards}
              onAdd={() => setModal({ kind: "scorecard-new" })}
              onView={(id) => setModal({ kind: "scorecard-view", id })}
              onEdit={(id) => setModal({ kind: "scorecard-edit", id })}
            />
          ) : (
            <CriteriaTab
              criteria={criteria}
              onAdd={() => setModal({ kind: "criterion-new" })}
              onView={(id) => setModal({ kind: "criterion-view", id })}
              onEdit={(id) => setModal({ kind: "criterion-edit", id })}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {modal?.kind === "criterion-new" && (
        <CriterionEditorModal
          mode="new"
          onClose={() => setModal(null)}
          onSave={async (input) => {
            const res = await fetch("/api/criterion-templates", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(input),
            });
            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              showToast("error", err.error ?? "Could not save criterion.");
              return;
            }
            showToast("success", `Criterion "${input.name}" added.`);
            await refreshCriteria();
            setModal(null);
          }}
        />
      )}
      {modal?.kind === "criterion-edit" &&
        (() => {
          const c = criteria.find((x) => x.id === modal.id);
          if (!c) return null;
          return (
            <CriterionEditorModal
              mode="edit"
              initial={c}
              onClose={() => setModal(null)}
              onSave={async (input) => {
                const res = await fetch(`/api/criterion-templates/${c.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(input),
                });
                if (!res.ok) {
                  showToast("error", "Could not save criterion.");
                  return;
                }
                showToast("success", `Criterion "${input.name}" updated.`);
                await refreshCriteria();
                setModal(null);
              }}
            />
          );
        })()}
      {modal?.kind === "criterion-view" &&
        (() => {
          const c = criteria.find((x) => x.id === modal.id);
          if (!c) return null;
          return (
            <CriterionEditorModal
              mode="view"
              initial={c}
              onClose={() => setModal(null)}
              onEditClick={() => setModal({ kind: "criterion-edit", id: c.id })}
            />
          );
        })()}

      {modal?.kind === "scorecard-new" && (
        <ScorecardEditorModal
          mode="new"
          allCriteria={criteria}
          onClose={() => setModal(null)}
          onSave={async (input) => {
            const res = await fetch("/api/scorecard-templates", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(input),
            });
            if (!res.ok) {
              showToast("error", "Could not save scorecard.");
              return;
            }
            showToast("success", `Scorecard "${input.name}" added.`);
            await refreshScorecards();
            setModal(null);
          }}
        />
      )}
      {modal?.kind === "scorecard-edit" &&
        (() => {
          const s = scorecards.find((x) => x.id === modal.id);
          if (!s) return null;
          return (
            <ScorecardEditorModal
              mode="edit"
              initial={s}
              allCriteria={criteria}
              onClose={() => setModal(null)}
              onSave={async (input) => {
                const res = await fetch(`/api/scorecard-templates/${s.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(input),
                });
                if (!res.ok) {
                  showToast("error", "Could not save scorecard.");
                  return;
                }
                showToast("success", `Scorecard "${input.name}" updated.`);
                await refreshScorecards();
                setModal(null);
              }}
            />
          );
        })()}
      {modal?.kind === "scorecard-view" &&
        (() => {
          const s = scorecards.find((x) => x.id === modal.id);
          if (!s) return null;
          return (
            <ScorecardEditorModal
              mode="view"
              initial={s}
              allCriteria={criteria}
              onClose={() => setModal(null)}
              onEditClick={() => setModal({ kind: "scorecard-edit", id: s.id })}
            />
          );
        })()}
    </div>
  );
}

/* ============================================================
 * Scorecard tab
 * ============================================================ */

function ScorecardTab({
  scorecards,
  onAdd,
  onView,
  onEdit,
}: {
  scorecards: ScorecardTemplate[];
  onAdd: () => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const fields: FilterField[] = useMemo(
    () => [
      {
        id: "criteriaCount",
        label: "Criteria Count",
        kind: "range",
        min: 0,
        max: 20,
      },
    ],
    []
  );
  const filtered = scorecards.filter((s) => {
    if (
      search &&
      !s.name.toLowerCase().includes(search.toLowerCase()) &&
      !s.description.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    const v = filterValues.criteriaCount;
    if (isFieldActive(v) && v?.kind === "range") {
      const n = s.criteria.length;
      if (v.operator === "between") {
        if (v.min !== undefined && n < v.min) return false;
        if (v.max !== undefined && n > v.max) return false;
      } else if (
        v.operator === "gt" &&
        v.min !== undefined &&
        n <= v.min
      ) {
        return false;
      } else if (
        v.operator === "lt" &&
        v.max !== undefined &&
        n >= v.max
      ) {
        return false;
      }
    }
    return true;
  });

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <div className="relative max-w-md flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="h-9 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm focus:border-violet-500 focus:outline-none"
          />
        </div>
        <FilterButton
          activeCount={countActiveFilters(filterValues)}
          onClick={() => setFilterOpen(true)}
        />
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          <Plus size={14} />
          Add New Scorecard
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="w-10 p-3">
                <input
                  type="checkbox"
                  className="accent-violet-600"
                  disabled
                />
              </th>
              <th className="p-3">Scorecard Name</th>
              <th className="p-3">Contains</th>
              <th className="p-3">Date Modified</th>
              <th className="w-32 p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-t border-gray-100">
                <td className="p-3">
                  <input type="checkbox" className="accent-violet-600" />
                </td>
                <td className="p-3 font-medium text-gray-900">{s.name}</td>
                <td className="p-3 text-xs text-gray-600">
                  <ContainsCell criteria={s.criteria} />
                </td>
                <td className="p-3 text-xs text-gray-500">
                  {formatDate(s.updatedAtISO)}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-3 text-xs font-medium">
                    <button
                      onClick={() => onView(s.id)}
                      className="text-violet-600 hover:text-violet-800"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onEdit(s.id)}
                      className="text-violet-600 hover:text-violet-800"
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-12 text-center text-sm text-gray-400">
                  No scorecards match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
    </>
  );
}

function ContainsCell({ criteria }: { criteria: ScorecardCriterionTemplate[] }) {
  if (criteria.length === 0)
    return <span className="text-gray-300">—</span>;
  const visible = criteria.slice(0, 3).map((c) => c.name);
  const more = criteria.length - visible.length;
  return (
    <span>
      {visible.join(", ")}
      {more > 0 && (
        <span className="text-violet-600">{`, +${more} more...`}</span>
      )}
    </span>
  );
}

/* ============================================================
 * Criteria tab
 * ============================================================ */

function CriteriaTab({
  criteria,
  onAdd,
  onView,
  onEdit,
}: {
  criteria: CriterionTemplate[];
  onAdd: () => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValues>({});

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const c of criteria) for (const t of c.categories) set.add(t);
    return [...set].sort();
  }, [criteria]);

  const fields: FilterField[] = useMemo(
    () => [
      {
        id: "tags",
        label: "Tags",
        kind: "multi-select",
        options: allTags.map((t) => ({ value: t, label: t })),
      },
    ],
    [allTags]
  );

  const filtered = criteria.filter((c) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !c.name.toLowerCase().includes(q) &&
        !c.categories.some((t) => t.toLowerCase().includes(q)) &&
        !(c.description ?? "").toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    const v = filterValues.tags;
    if (isFieldActive(v) && v?.kind === "multi-select") {
      if (!v.values.some((tag) => c.categories.includes(tag))) return false;
    }
    return true;
  });

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <div className="relative max-w-md flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, tag…"
            className="h-9 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm focus:border-violet-500 focus:outline-none"
          />
        </div>
        <FilterButton
          activeCount={countActiveFilters(filterValues)}
          onClick={() => setFilterOpen(true)}
        />
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          <Plus size={14} />
          Add New Criterion
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="w-10 p-3">
                <input type="checkbox" className="accent-violet-600" disabled />
              </th>
              <th className="p-3">Criteria Name</th>
              <th className="p-3">Tags</th>
              <th className="p-3">Description</th>
              <th className="p-3">Date Modified</th>
              <th className="w-32 p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-t border-gray-100 align-top">
                <td className="p-3">
                  <input type="checkbox" className="accent-violet-600" />
                </td>
                <td className="p-3 font-medium text-gray-900">{c.name}</td>
                <td className="p-3">
                  <div className="flex flex-wrap items-center gap-1">
                    {c.categories.map((cat) => (
                      <span
                        key={cat}
                        className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-3 text-xs text-gray-600">
                  <span className="line-clamp-2 max-w-md">
                    {c.description || (
                      <span className="text-gray-300">—</span>
                    )}
                  </span>
                </td>
                <td className="p-3 text-xs text-gray-500">
                  {formatDate(c.updatedAtISO)}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-3 text-xs font-medium">
                    <button
                      onClick={() => onView(c.id)}
                      className="text-violet-600 hover:text-violet-800"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onEdit(c.id)}
                      className="text-violet-600 hover:text-violet-800"
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-12 text-center text-sm text-gray-400">
                  No criteria match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
    </>
  );
}

/* ============================================================
 * Criterion editor modal — view / new / edit
 * ============================================================ */

interface CriterionInput {
  name: string;
  categories: string[];
  description: string;
  guideline: BehavioralGuideline;
  weight: number;
}

function CriterionEditorModal({
  mode,
  initial,
  onClose,
  onSave,
  onEditClick,
}: {
  mode: "new" | "edit" | "view";
  initial?: CriterionTemplate;
  onClose: () => void;
  onSave?: (input: CriterionInput) => void;
  onEditClick?: () => void;
}) {
  const isView = mode === "view";
  const [name, setName] = useState(initial?.name ?? "");
  const [tags, setTags] = useState<string[]>(initial?.categories ?? []);
  const [tagDraft, setTagDraft] = useState("");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [guideline, setGuideline] = useState<BehavioralGuideline>(
    initial?.guideline ?? { ...EMPTY_GUIDELINE }
  );

  const title =
    mode === "new"
      ? "New Criterion"
      : mode === "edit"
        ? "Edit Criterion"
        : initial?.name ?? "View Criterion";

  function addTag() {
    const t = tagDraft.trim();
    if (!t || tags.includes(t)) {
      setTagDraft("");
      return;
    }
    setTags((prev) => [...prev, t]);
    setTagDraft("");
  }

  function setBand(key: keyof BehavioralGuideline, val: string) {
    setGuideline((prev: BehavioralGuideline) => ({ ...prev, [key]: val }));
  }

  function handleSave() {
    if (!onSave) return;
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      categories: tags,
      description,
      guideline,
      weight: initial?.weight ?? 3,
    });
  }

  // If guideline is mostly empty in edit mode, surface the AI auto-fill hint.
  const guidelineEmpty =
    !guideline.poor &&
    !guideline.novice &&
    !guideline.intermediate &&
    !guideline.good &&
    !guideline.expert;

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/40 p-6 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-5 py-4">
          {/* Criteria name */}
          <Field label="Criteria Name" required>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isView}
              placeholder="Please Enter"
              className="input"
            />
          </Field>

          {/* Tags */}
          <Field label="Tags">
            {isView ? (
              <div className="flex flex-wrap items-center gap-1">
                {tags.length === 0 && (
                  <span className="text-xs text-gray-400">—</span>
                )}
                {tags.map((t) => (
                  <span
                    key={t}
                    className="rounded bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2 py-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((x) => x !== t))}
                      className="opacity-60 hover:opacity-100"
                      aria-label={`Remove ${t}`}
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
                <input
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  onBlur={addTag}
                  placeholder={tags.length === 0 ? "Add tag…" : ""}
                  className="flex-1 min-w-[80px] border-0 bg-transparent text-xs focus:outline-none"
                />
              </div>
            )}
          </Field>

          {/* Description */}
          <Field label="Description">
            <div className="overflow-hidden rounded-lg border border-gray-300 bg-white">
              <div className="flex items-center gap-1 border-b border-gray-200 bg-gray-50 px-2 py-1 text-[11px] text-gray-500">
                <ToolbarBtn>
                  <Bold size={11} />
                </ToolbarBtn>
                <ToolbarBtn>
                  <Italic size={11} />
                </ToolbarBtn>
                <span className="mx-1 h-3 w-px bg-gray-300" />
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-gray-100"
                >
                  <Paperclip size={11} />
                  Attach Files
                </button>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isView}
                rows={3}
                placeholder="What does this criterion measure?"
                className="block w-full resize-none border-0 px-3 py-2 text-sm focus:outline-none focus:ring-0 disabled:bg-gray-50 disabled:text-gray-700"
              />
            </div>
          </Field>

          {/* Behavioral guideline */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-xs font-medium text-gray-700">
                Behavioral Guideline
              </label>
              {!isView && guidelineEmpty && (
                <button
                  type="button"
                  onClick={() => setGuideline({ ...PLACEHOLDER_GUIDELINE })}
                  className="inline-flex items-center gap-1 rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-[10px] font-semibold text-violet-700 hover:bg-violet-100"
                  title="Fill the five bands with a generic AI-drafted starting point."
                >
                  <Sparkles size={11} />
                  AI Auto-fill
                </button>
              )}
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              {(
                [
                  { key: "poor", range: "1-2", label: "Poor" },
                  { key: "novice", range: "3-4", label: "Novice" },
                  { key: "intermediate", range: "5-6", label: "Intermediate" },
                  { key: "good", range: "7-8", label: "Good" },
                  { key: "expert", range: "9-10", label: "Expert" },
                ] as { key: keyof BehavioralGuideline; range: string; label: string }[]
              ).map((band, i) => (
                <div
                  key={String(band.key)}
                  className={cn(
                    "flex gap-3 px-3 py-2",
                    i > 0 && "border-t border-gray-100"
                  )}
                >
                  <div className="w-20 shrink-0 text-center text-[11px] font-semibold text-gray-700">
                    <p>{band.range}</p>
                    <p className="text-[10px] font-medium text-gray-500">
                      {band.label}
                    </p>
                  </div>
                  <textarea
                    value={guideline[band.key]}
                    onChange={(e) => setBand(band.key, e.target.value)}
                    disabled={isView}
                    rows={2}
                    placeholder={`Behaviour observed at ${band.label.toLowerCase()} level…`}
                    className="block w-full resize-none rounded border-0 bg-transparent px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-0 disabled:text-gray-700"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          {isView ? (
            <button
              onClick={onEditClick}
              className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
            >
              <Edit3 size={13} />
              Edit
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const PLACEHOLDER_GUIDELINE: BehavioralGuideline = {
  poor: "Lacks basic skills or knowledge. Cannot perform tasks. Requires complete retraining.",
  novice:
    "Has basic understanding but lacks practical application. Requires constant supervision and guidance.",
  intermediate:
    "Meets baseline requirements. Handles routine tasks independently but needs help with complex issues.",
  good: "Proficient and proactive. Independently solves complex problems and delivers effective solutions.",
  expert:
    "Exceptional mastery. Optimizes systems, drives strategy, and actively mentors others.",
};

/* ============================================================
 * Scorecard editor modal — view / new / edit
 * ============================================================ */

interface ScorecardInput {
  name: string;
  description: string;
  criteria: ScorecardCriterionTemplate[];
}

function ScorecardEditorModal({
  mode,
  initial,
  allCriteria,
  onClose,
  onSave,
  onEditClick,
}: {
  mode: "new" | "edit" | "view";
  initial?: ScorecardTemplate;
  allCriteria: CriterionTemplate[];
  onClose: () => void;
  onSave?: (input: ScorecardInput) => void;
  onEditClick?: () => void;
}) {
  const isView = mode === "view";
  const [name, setName] = useState(initial?.name ?? "");
  const [picked, setPicked] = useState<ScorecardCriterionTemplate[]>(
    initial?.criteria ?? []
  );

  const title =
    mode === "new"
      ? "New Scorecard"
      : mode === "edit"
        ? "Edit Scorecard"
        : initial?.name ?? "View Scorecard";

  function addCriterion(c: CriterionTemplate) {
    if (picked.some((p) => p.id === c.id)) return;
    setPicked((prev) => [
      ...prev,
      {
        id: c.id,
        name: c.name,
        weight: c.weight,
        description: c.description,
        categories: c.categories,
      },
    ]);
  }
  function removeCriterion(id: string) {
    setPicked((prev) => prev.filter((c) => c.id !== id));
  }

  function handleSave() {
    if (!onSave) return;
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      // Description is no longer part of the scorecard editor — keep the
      // existing one when editing so we don't blank it out, leave empty
      // for new scorecards.
      description: initial?.description ?? "",
      criteria: picked,
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/40 p-6 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-5 py-4">
          <Field label="Scorecard Name" required>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isView}
              placeholder="Please Enter"
              className="input"
            />
          </Field>

          <Field label="Criteria" required>
            <div className="space-y-1.5">
              {picked.length === 0 && (
                <div className="rounded-md border-2 border-dashed border-gray-200 bg-gray-50/60 px-4 py-6 text-center">
                  <p className="text-sm font-medium text-gray-600">
                    This scorecard does not have criteria yet.
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Please add criteria from the library or create new ones to
                    complete the interview evaluation form.
                  </p>
                </div>
              )}
              {picked.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-2 rounded-md border border-gray-200 bg-white px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">
                      {c.name}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1">
                      {c.categories?.map((cat) => (
                        <span
                          key={cat}
                          className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                  {!isView && (
                    <button
                      type="button"
                      onClick={() => removeCriterion(c.id)}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Remove ${c.name}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {!isView && (
              <AddCriteriaCombobox
                allCriteria={allCriteria}
                pickedIds={picked.map((p) => p.id)}
                onPick={addCriterion}
              />
            )}
          </Field>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          {isView ? (
            <button
              onClick={onEditClick}
              className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
            >
              <Edit3 size={13} />
              Edit
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save
            </button>
          )}
        </div>
      </div>

    </div>
  );
}

/** Inline expanding combobox — collapsed it shows a dashed "+ Add
 *  Criteria" pill; clicking it expands into a search input that
 *  surfaces the criterion library beneath. Picks add to the parent
 *  list and the slot stays open so the user can add several in a row.
 *  Esc / blur (after a tick to allow option clicks) collapses. */
function AddCriteriaCombobox({
  allCriteria,
  pickedIds,
  onPick,
}: {
  allCriteria: CriterionTemplate[];
  pickedIds: string[];
  onPick: (c: CriterionTemplate) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [highlight, setHighlight] = useState(0);

  const taken = new Set(pickedIds);
  const term = q.trim().toLowerCase();
  const filtered = allCriteria
    .filter((c) => !taken.has(c.id))
    .filter((c) => {
      if (!term) return true;
      return (
        c.name.toLowerCase().includes(term) ||
        c.categories.some((cat) => cat.toLowerCase().includes(term))
      );
    });

  function pick(c: CriterionTemplate) {
    onPick(c);
    setQ("");
    setHighlight(0);
  }

  function close() {
    setOpen(false);
    setQ("");
    setHighlight(0);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 inline-flex items-center gap-1 rounded-md border border-dashed border-violet-300 bg-violet-50/40 px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-100"
      >
        <Plus size={12} />
        Add Criteria
      </button>
    );
  }

  return (
    <div className="mt-2 rounded-md border-2 border-dashed border-violet-300 bg-white p-2">
      {/* Input row — leading "+" mirrors the wireframe's prefix. */}
      <div className="relative flex items-center gap-1.5 rounded-md border border-violet-300 bg-violet-50/40 px-2 py-1.5">
        <Plus size={12} className="text-violet-600" />
        <input
          autoFocus
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setHighlight(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              close();
            } else if (e.key === "Enter") {
              e.preventDefault();
              const choice = filtered[highlight];
              if (choice) pick(choice);
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              setHighlight((h) =>
                Math.min(h + 1, Math.max(filtered.length - 1, 0))
              );
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlight((h) => Math.max(h - 1, 0));
            }
          }}
          placeholder="Type to search the library…"
          className="flex-1 border-0 bg-transparent text-xs text-violet-900 placeholder:text-violet-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={close}
          className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          aria-label="Close"
        >
          <X size={12} />
        </button>
      </div>

      {/* Dropdown */}
      <ul className="mt-1 max-h-64 overflow-y-auto rounded-md border border-gray-200 bg-white py-1 text-xs">
        {filtered.map((c, i) => {
          const active = i === highlight;
          return (
            <li key={c.id}>
              <button
                type="button"
                onMouseEnter={() => setHighlight(i)}
                onClick={() => pick(c)}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left transition-colors",
                  active
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <span className="flex-1 truncate font-medium">{c.name}</span>
                {c.categories.slice(0, 3).map((cat) => (
                  <span
                    key={cat}
                    className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600"
                  >
                    {cat}
                  </span>
                ))}
              </button>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="px-3 py-3 text-gray-400">
            {term.length > 0
              ? "No matches — try a different keyword."
              : "Every criterion is already on this scorecard."}
          </li>
        )}
      </ul>
    </div>
  );
}

/* ============================================================
 * Bits
 * ============================================================ */

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

function ToolbarBtn({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="inline-flex h-5 w-5 items-center justify-center rounded text-gray-500 hover:bg-gray-100"
    >
      {children}
    </button>
  );
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "—";
  const diff = Date.now() - t;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < hour) return "Just now";
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
