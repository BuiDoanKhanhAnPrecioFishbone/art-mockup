"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
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
import type { StageTemplate } from "@/entities/stage-template";
import { RecruitmentFlowTabs } from "@/widgets/flow-template-library";
import { StageTemplateEditModal } from "./StageTemplateEditModal";

/** Stage Master Library — wireframe `Stage / Master Library`. List
 *  table with search, filter, edit modal, and a delete confirm that
 *  refuses when any flow template still references the stage. */
export function StageTemplateLibraryList() {
  const { showToast } = useToast();
  const [rows, setRows] = useState<StageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [editing, setEditing] = useState<StageTemplate | "new" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    row: StageTemplate;
    inUse: number;
  } | null>(null);

  function refresh() {
    setLoading(true);
    return fetch("/api/stage-templates")
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
        id: "tags",
        label: "Tags",
        kind: "multi-select",
        options: allTags.map((t) => ({ value: t, label: t })),
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
          (r.description?.toLowerCase().includes(q) ?? false) ||
          r.tags.some((t) => t.toLowerCase().includes(q)) ||
          r.steps.some((s) => s.name.toLowerCase().includes(q));
        if (!hit) return false;
      }
      for (const f of filterFields) {
        const v = filterValues[f.id];
        if (!isFieldActive(v)) continue;
        if (v?.kind === "multi-select" && f.id === "tags") {
          if (!r.tags.some((t) => v.values.includes(t))) return false;
        }
      }
      return true;
    });
  }, [rows, search, filterValues, filterFields]);

  async function tryDelete(row: StageTemplate) {
    // Probe the API first so we can tell the user whether it'll get a
    // 409. The DELETE endpoint enforces the rule too — this is just
    // for nicer UX.
    const res = await fetch(`/api/stage-templates/${row.id}`);
    const data = await res.json();
    setConfirmDelete({
      row,
      inUse: (data.usage?.flowTemplateIds ?? []).length,
    });
  }

  async function doDelete(row: StageTemplate) {
    const res = await fetch(`/api/stage-templates/${row.id}`, {
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
          <Plus size={14} /> New Stage
        </button>
      </div>
      <p className="text-xs text-gray-500">
        Reusable stage blueprints. Each step inside a stage is
        snapshot-cloned when the stage is applied.
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
            placeholder="Search by name, description, tag, or step…"
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
              <th className="px-4 py-3 font-medium">Stage Name</th>
              <th className="px-4 py-3 font-medium tabular-nums">Steps</th>
              <th className="px-4 py-3 font-medium">Tags</th>
              <th className="px-4 py-3 font-medium">Updated</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-sm text-gray-400"
                >
                  Loading stages…
                </td>
              </tr>
            ) : visible.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-sm text-gray-500"
                >
                  No stages match your search.
                </td>
              </tr>
            ) : (
              visible.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">
                      {row.name}
                    </p>
                    {row.description && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">
                        {row.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm tabular-nums text-gray-700">
                    {row.steps.length}
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
                        onClick={() => tryDelete(row)}
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
        <StageTemplateEditModal
          initial={editing === "new" ? null : editing}
          onSaved={() => void refresh()}
          onClose={() => setEditing(null)}
        />
      )}

      {confirmDelete && (
        <DeleteStageConfirm
          row={confirmDelete.row}
          inUse={confirmDelete.inUse}
          onConfirm={() => doDelete(confirmDelete.row)}
          onClose={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

function DeleteStageConfirm({
  row,
  inUse,
  onConfirm,
  onClose,
}: {
  row: StageTemplate;
  inUse: number;
  onConfirm: () => void;
  onClose: () => void;
}) {
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
              Delete this stage?
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              You are about to delete the stage <strong>{row.name}</strong>
              . This stage contains {row.steps.length} step
              {row.steps.length === 1 ? "" : "s"}. Deleting this stage
              will also delete the embedded step copies. This action
              cannot be undone.
            </p>
            {inUse > 0 && (
              <p className="mt-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                Currently used in: <strong>{inUse}</strong> flow template
                {inUse === 1 ? "" : "s"}. Detach it first.
              </p>
            )}
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
            disabled={inUse > 0}
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
