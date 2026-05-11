"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
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
import { useToast } from "@/shared/ui/toast";
import {
  STEP_TYPE_LABEL,
  type StepType,
} from "@/entities/program/model/workflow";
import type { StepTemplate } from "@/entities/step-template";
import { RecruitmentFlowTabs } from "@/widgets/flow-template-library";
import { StepTemplateEditModal } from "./StepTemplateEditModal";

interface StepRow extends StepTemplate {
  usage: { flowTemplateCount: number; stageTemplateCount: number };
}

const STEP_TYPE_TONE: Record<StepType, string> = {
  default: "bg-gray-100 text-gray-700",
  test: "bg-blue-100 text-blue-700",
  interview: "bg-violet-100 text-violet-700",
};

/** Step Master Library — wireframe `Step / Master Library`. Same
 *  shape as the Recruitment Flow library but for individual steps.
 *  Backs the search-then-create combobox on the workflow canvas. */
export function StepTemplateLibraryList() {
  const { showToast } = useToast();
  const [rows, setRows] = useState<StepRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [editing, setEditing] = useState<StepRow | "new" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<StepRow | null>(null);

  function refresh() {
    setLoading(true);
    return fetch("/api/step-templates")
      .then((r) => r.json())
      .then((d) => setRows(d.templates ?? []))
      .finally(() => setLoading(false));
  }
  useEffect(() => {
    void refresh();
  }, []);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) for (const t of r.tags) set.add(t);
    return Array.from(set).sort();
  }, [rows]);

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        id: "type",
        label: "Type",
        kind: "multi-select",
        options: (Object.keys(STEP_TYPE_LABEL) as StepType[]).map((t) => ({
          value: t,
          label: STEP_TYPE_LABEL[t],
        })),
      },
      {
        id: "tags",
        label: "Tags",
        kind: "multi-select",
        options: allTags.map((t) => ({ value: t, label: t })),
      },
      {
        id: "usage",
        label: "Usage",
        kind: "single-select",
        options: [
          { value: "any", label: "Any" },
          { value: "used", label: "Used in ≥1 template" },
          { value: "unused", label: "Unused" },
        ],
      },
    ],
    [allTags]
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (q) {
        const hit =
          r.name.toLowerCase().includes(q) ||
          (r.instruction?.toLowerCase().includes(q) ?? false) ||
          r.tags.some((t) => t.toLowerCase().includes(q));
        if (!hit) return false;
      }
      for (const f of filterFields) {
        const v = filterValues[f.id];
        if (!isFieldActive(v)) continue;
        if (v?.kind === "multi-select") {
          if (f.id === "type" && !v.values.includes(r.type)) return false;
          if (f.id === "tags") {
            if (!r.tags.some((t) => v.values.includes(t))) return false;
          }
        } else if (v?.kind === "single-select") {
          if (f.id === "usage") {
            const total =
              r.usage.flowTemplateCount + r.usage.stageTemplateCount;
            if (v.value === "used" && total === 0) return false;
            if (v.value === "unused" && total > 0) return false;
          }
        }
      }
      return true;
    });
  }, [rows, search, filterValues, filterFields]);

  async function doDelete(row: StepRow) {
    const res = await fetch(`/api/step-templates/${row.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      showToast("success", `Deleted "${row.name}".`);
      void refresh();
    } else {
      const data = await res.json();
      showToast("error", data.error ?? "Failed to delete.");
    }
    setConfirmDelete(null);
  }

  return (
    <div className="space-y-4 px-8 py-6">
      <div className="flex items-start justify-between gap-3">
        <RecruitmentFlowTabs />
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          <Plus size={14} /> New Step
        </button>
      </div>
      <p className="text-xs text-gray-500">
        Reusable step blueprints. Picking one in the workflow canvas
        snapshots its config into the consumer.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, instruction, or tag…"
            className="w-full rounded-md border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
        <FilterButton
          activeCount={countActiveFilters(filterValues)}
          onClick={() => setFilterOpen(true)}
        />
      </div>

      <AppliedFilterChips
        fields={filterFields}
        values={filterValues}
        onRemove={(id) =>
          setFilterValues((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
          })
        }
        onClearAll={() => setFilterValues({})}
      />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-[11px] uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Step Name</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Tags</th>
              <th className="px-4 py-3 font-medium">Used in</th>
              <th className="px-4 py-3 font-medium">Updated</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-sm text-gray-400"
                >
                  Loading steps…
                </td>
              </tr>
            ) : visible.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-sm text-gray-500"
                >
                  No steps match your search.
                </td>
              </tr>
            ) : (
              visible.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">
                      {row.name}
                    </p>
                    {row.instruction && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">
                        {row.instruction}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase",
                        STEP_TYPE_TONE[row.type]
                      )}
                    >
                      {STEP_TYPE_LABEL[row.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {row.tags.length === 0 ? (
                        <span className="text-xs text-gray-400">—</span>
                      ) : (
                        row.tags.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700"
                          >
                            {t}
                          </span>
                        ))
                      )}
                      {row.tags.length > 3 && (
                        <span className="text-[11px] text-gray-500">
                          +{row.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-700">
                    {row.usage.flowTemplateCount +
                      row.usage.stageTemplateCount ===
                    0 ? (
                      <span className="text-gray-400">Unused</span>
                    ) : (
                      <span title={`${row.usage.flowTemplateCount} flows · ${row.usage.stageTemplateCount} stages`}>
                        {row.usage.flowTemplateCount} flow
                        {row.usage.flowTemplateCount === 1 ? "" : "s"} ·{" "}
                        {row.usage.stageTemplateCount} stage
                        {row.usage.stageTemplateCount === 1 ? "" : "s"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {formatDate(row.updatedAtISO)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 text-gray-400">
                      <button
                        type="button"
                        onClick={() => setEditing(row)}
                        title="Edit"
                        className="rounded p-1.5 hover:bg-gray-100 hover:text-gray-700"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(row)}
                        title="Delete"
                        className="rounded p-1.5 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <FilterModal
        open={filterOpen}
        fields={filterFields}
        initialValues={filterValues}
        onApply={(v) => {
          setFilterValues(v);
          setFilterOpen(false);
        }}
        onCancel={() => setFilterOpen(false)}
      />

      {editing && (
        <StepTemplateEditModal
          initial={editing === "new" ? null : editing}
          onSaved={() => void refresh()}
          onClose={() => setEditing(null)}
        />
      )}

      {confirmDelete && (
        <DeleteStepConfirm
          row={confirmDelete}
          onConfirm={() => doDelete(confirmDelete)}
          onClose={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

function DeleteStepConfirm({
  row,
  onConfirm,
  onClose,
}: {
  row: StepRow;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const total = row.usage.flowTemplateCount + row.usage.stageTemplateCount;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-amber-100 text-amber-600">
            <AlertTriangle size={18} />
          </span>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-gray-900">
              Delete this step?
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {total > 0 ? (
                <>
                  <strong>{row.name}</strong> is currently used by{" "}
                  <strong>
                    {row.usage.flowTemplateCount} flow
                    {row.usage.flowTemplateCount === 1 ? "" : "s"}
                  </strong>{" "}
                  and{" "}
                  <strong>
                    {row.usage.stageTemplateCount} stage
                    {row.usage.stageTemplateCount === 1 ? "" : "s"}
                  </strong>
                  . Detach it first or it&rsquo;ll come back as a 409.
                </>
              ) : (
                <>
                  Deleting <strong>{row.name}</strong> removes it from the
                  master library. Programs already snapshotted from it
                  keep their copy.
                </>
              )}
            </p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={total > 0}
            className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:bg-red-300"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
