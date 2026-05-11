"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Copy,
  Eye,
  Lock,
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
  FLOW_TEMPLATE_STATUSES,
  type FlowTemplate,
  type FlowTemplateStatus,
} from "@/entities/flow-template";
import { CreateFlowModal } from "./CreateFlowModal";
import { RecruitmentFlowTabs } from "./RecruitmentFlowTabs";

interface FlowRow extends FlowTemplate {
  stageCount: number;
  stepCount: number;
  usedInCount: number;
}

const STATUS_TONE: Record<FlowTemplateStatus, string> = {
  Default: "bg-violet-100 text-violet-700",
  Active: "bg-emerald-100 text-emerald-700",
  Archived: "bg-gray-200 text-gray-600",
};

/** Master Library list — wireframe `Recruitment Flow / Master
 *  Library`. Table of every flow with metadata + per-row actions. */
export function FlowTemplateLibraryList() {
  const { showToast } = useToast();
  const [rows, setRows] = useState<FlowRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<FlowRow | null>(null);

  function refresh() {
    setLoading(true);
    return fetch("/api/flow-templates")
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
        id: "status",
        label: "Status",
        kind: "multi-select",
        options: FLOW_TEMPLATE_STATUSES.map((s) => ({ value: s, label: s })),
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
          { value: "used", label: "Used in ≥1 program" },
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
          r.description.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q));
        if (!hit) return false;
      }
      for (const f of filterFields) {
        const v = filterValues[f.id];
        if (!isFieldActive(v)) continue;
        if (v?.kind === "multi-select") {
          if (f.id === "status" && !v.values.includes(r.status)) return false;
          if (f.id === "tags") {
            const hit = r.tags.some((t) => v.values.includes(t));
            if (!hit) return false;
          }
        } else if (v?.kind === "single-select") {
          if (f.id === "usage") {
            if (v.value === "used" && r.usedInCount === 0) return false;
            if (v.value === "unused" && r.usedInCount > 0) return false;
          }
        }
      }
      return true;
    });
  }, [rows, search, filterValues, filterFields]);

  async function duplicate(row: FlowRow) {
    // Mock duplicate — POST a new flow with " (Copy)" appended; the
    // editor inherits an empty stage list since the API doesn't yet
    // accept stages on POST.
    const res = await fetch("/api/flow-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${row.name} (Copy)`,
        description: row.description,
        tags: row.tags,
        status: "Active",
      }),
    });
    if (res.ok) {
      const data = await res.json();
      // Then PATCH the new flow with the source's stages so it's a
      // true clone.
      await fetch(`/api/flow-templates/${data.template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stages: row.stages }),
      });
      showToast("success", `Cloned: ${row.name}`);
      void refresh();
    }
  }

  async function doDelete(row: FlowRow) {
    const res = await fetch(`/api/flow-templates/${row.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      showToast("success", `Deleted ${row.name}.`);
      void refresh();
    } else {
      const data = await res.json();
      showToast("error", data.error ?? "Failed to delete.");
    }
    setConfirmDelete(null);
  }

  return (
    <div className="space-y-4 px-8 py-6">
      {/* Header — title + Flows / Stages / Steps tab strip on the
       *  left, "+ New Flow" CTA on the right. */}
      <div className="flex items-start justify-between gap-3">
        <RecruitmentFlowTabs />
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          <Plus size={14} /> New Flow
        </button>
      </div>

      {/* Toolbar */}
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
            placeholder="Search by name, description, or tag…"
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
        onRemove={(id) => {
          setFilterValues((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
        }}
        onClearAll={() => setFilterValues({})}
      />

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-[11px] uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Flow Name</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium tabular-nums">Stages</th>
              <th className="px-4 py-3 font-medium tabular-nums">Steps</th>
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
                  colSpan={8}
                  className="px-4 py-12 text-center text-sm text-gray-400"
                >
                  Loading flows…
                </td>
              </tr>
            ) : visible.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-sm text-gray-500"
                >
                  No flows match your search.
                </td>
              </tr>
            ) : (
              visible.map((row) => (
                <FlowRow
                  key={row.id}
                  row={row}
                  onDuplicate={() => duplicate(row)}
                  onDelete={() => setConfirmDelete(row)}
                />
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

      {creating && <CreateFlowModal onClose={() => setCreating(false)} />}

      {confirmDelete && (
        <DeleteFlowConfirm
          row={confirmDelete}
          onConfirm={() => doDelete(confirmDelete)}
          onClose={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

/* ---------- Per-row ---------- */

function FlowRow({
  row,
  onDuplicate,
  onDelete,
}: {
  row: FlowRow;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const isDefault = row.status === "Default";
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Link
            href={`/templates/recruitment-flow/${row.id}`}
            className="text-sm font-medium text-gray-900 hover:text-violet-700"
          >
            {row.name}
          </Link>
          {isDefault && <Lock size={11} className="text-violet-500" />}
        </div>
        {row.description && (
          <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">
            {row.description}
          </p>
        )}
      </td>
      <td className="px-4 py-3">
        <span
          className={cn(
            "inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            STATUS_TONE[row.status]
          )}
        >
          {row.status}
        </span>
      </td>
      <td className="px-4 py-3 text-sm tabular-nums text-gray-700">
        {row.stageCount}
      </td>
      <td className="px-4 py-3 text-sm tabular-nums text-gray-700">
        {row.stepCount}
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
        {row.usedInCount === 0 ? (
          <span className="text-gray-400">Unused</span>
        ) : (
          <>
            {row.usedInCount}{" "}
            {row.usedInCount === 1 ? "program" : "programs"}
          </>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-gray-500">
        {formatDate(row.updatedAtISO)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1 text-gray-400">
          <Link
            href={`/templates/recruitment-flow/${row.id}`}
            title="View"
            className="rounded p-1.5 hover:bg-gray-100 hover:text-gray-700"
          >
            <Eye size={14} />
          </Link>
          {!isDefault && (
            <Link
              href={`/templates/recruitment-flow/${row.id}/edit`}
              title="Edit"
              className="rounded p-1.5 hover:bg-gray-100 hover:text-gray-700"
            >
              <Pencil size={14} />
            </Link>
          )}
          <button
            type="button"
            onClick={onDuplicate}
            title="Duplicate"
            className="rounded p-1.5 hover:bg-gray-100 hover:text-gray-700"
          >
            <Copy size={14} />
          </button>
          {!isDefault && (
            <button
              type="button"
              onClick={onDelete}
              title="Delete"
              className="rounded p-1.5 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

/* ---------- Delete confirm ---------- */

function DeleteFlowConfirm({
  row,
  onConfirm,
  onClose,
}: {
  row: FlowRow;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const inUse = row.usedInCount > 0;
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
              Delete this flow?
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {inUse ? (
                <>
                  This flow is currently used by{" "}
                  <strong>
                    {row.usedInCount}{" "}
                    {row.usedInCount === 1 ? "program" : "programs"}
                  </strong>
                  . Programs already created from it keep their snapshot —
                  but you should archive instead so it stays auditable.
                </>
              ) : (
                <>
                  Deleting <strong>{row.name}</strong> will remove it from
                  the master library. Programs already created from it
                  keep their snapshot copy.
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
            className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
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
