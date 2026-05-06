"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Download,
  FileText,
  FileUp,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useToast } from "@/shared/ui/toast";
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
  CV_STATUS_LABEL,
  isCVNew,
  type CVRecord,
  type CVStatus,
} from "@/entities/cv-record";
import type { Program } from "@/entities/program";
import { CVStatusBadge, formatAdded } from "./pieces";
import { AddCandidateModal } from "./AddCandidateModal";
import { BulkUploadModal } from "./BulkUploadModal";

interface Props {
  program: Program;
}

type StatusFilter = "all" | CVStatus;

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "extracting", label: CV_STATUS_LABEL.extracting },
  { id: "needs-review", label: CV_STATUS_LABEL["needs-review"] },
  { id: "duplicate", label: CV_STATUS_LABEL.duplicate },
  { id: "error", label: CV_STATUS_LABEL.error },
  { id: "done", label: CV_STATUS_LABEL.done },
];

export function CVTrackingTab({ program }: Props) {
  const [cvs, setCvs] = useState<CVRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [addOpen, setAddOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editing, setEditing] = useState<CVRecord | null>(null);
  /** Highlight ring on a row that was just saved / updated. */
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const { showToast } = useToast();

  function refresh(opts?: { silent?: boolean }) {
    if (!opts?.silent) setLoading(true);
    return fetch(`/api/cvs?programId=${encodeURIComponent(program.id)}`)
      .then((r) => r.json())
      .then((d) => {
        setCvs(d.cvs ?? []);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program.id]);

  // While anything is "extracting", poll quietly so the demo shows
  // statuses transitioning to Done / Needs Review / etc.
  useEffect(() => {
    const hasExtracting = cvs.some((c) => c.status === "extracting");
    if (!hasExtracting) return;
    const id = setInterval(() => void refresh({ silent: true }), 1500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cvs]);

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        id: "type",
        label: "Type",
        kind: "multi-select",
        options: [
          { value: "auto-sync", label: "Auto-Sync" },
          { value: "manual", label: "Manual" },
        ],
      },
      {
        id: "source",
        label: "Source",
        kind: "multi-select",
        options: [
          { value: "LinkedIn", label: "LinkedIn" },
          { value: "Facebook", label: "Facebook" },
          { value: "Tiktok", label: "Tiktok" },
          { value: "Gmail", label: "Gmail" },
          { value: "Other", label: "Other" },
        ],
      },
      {
        id: "addedRange",
        label: "Added Date",
        kind: "date-range",
      },
    ],
    []
  );

  function passesFilters(c: CVRecord): boolean {
    for (const f of filterFields) {
      const v = filterValues[f.id];
      if (!isFieldActive(v)) continue;
      if (v?.kind === "multi-select") {
        if (f.id === "type" && !v.values.includes(c.type)) return false;
        if (f.id === "source" && !v.values.includes(c.source)) return false;
      }
      if (v?.kind === "date-range") {
        const t = Date.parse(c.addedAtISO);
        if (v.from) {
          if (t < Date.parse(v.from)) return false;
        }
        if (v.to) {
          if (t > Date.parse(v.to) + 24 * 3600 * 1000) return false;
        }
      }
    }
    return true;
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cvs.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (q) {
        const hay =
          `${c.parsedName ?? ""} ${c.parsedEmail ?? ""} ${c.fileName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return passesFilters(c);
    });
  }, [cvs, statusFilter, search, filterValues]);

  const countByStatus = useMemo(() => {
    const map = new Map<StatusFilter, number>();
    map.set("all", 0);
    let total = 0;
    for (const c of cvs) {
      const q = search.trim().toLowerCase();
      if (q) {
        const hay =
          `${c.parsedName ?? ""} ${c.parsedEmail ?? ""} ${c.fileName}`.toLowerCase();
        if (!hay.includes(q)) continue;
      }
      if (!passesFilters(c)) continue;
      map.set(c.status, (map.get(c.status) ?? 0) + 1);
      total++;
    }
    map.set("all", total);
    return map;
  }, [cvs, search, filterValues]);

  const totalUnfiltered = cvs.length;
  const allVisibleSelected =
    filtered.length > 0 && filtered.every((c) => selected.has(c.id));

  function toggleAllVisible() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        for (const c of filtered) next.delete(c.id);
      } else {
        for (const c of filtered) next.add(c.id);
      }
      return next;
    });
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearFilter(id: string) {
    setFilterValues((p) => {
      const n = { ...p };
      delete n[id];
      return n;
    });
  }

  async function handleDelete(id: string) {
    const cv = cvs.find((c) => c.id === id);
    const res = await fetch(`/api/cvs/${id}`, { method: "DELETE" });
    if (!res.ok) {
      showToast("error", "Could not delete CV record.");
      return;
    }
    setCvs((prev) => prev.filter((c) => c.id !== id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    showToast("success", `Removed ${cv?.fileName ?? "CV"}.`);
  }

  async function handleBulkDelete() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    const res = await fetch(`/api/cvs/bulk-delete`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) {
      showToast("error", "Could not delete CV records.");
      return;
    }
    setCvs((prev) => prev.filter((c) => !selected.has(c.id)));
    setSelected(new Set());
    showToast("success", `${ids.length} CV${ids.length > 1 ? "s" : ""} removed.`);
  }

  function flashRow(id: string) {
    setHighlightId(id);
    setTimeout(() => setHighlightId(null), 2200);
  }

  function handlePromoted(info: { candidateId: string; cvId?: string }) {
    setAddOpen(false);
    setEditing(null);
    showToast("success", "The candidate's profile has been moved to the Pipeline.");
    void refresh({ silent: true });
    if (info.candidateId) flashRow(info.candidateId);
  }

  /* -------------------- Render -------------------- */

  return (
    <div className="space-y-4">
      {/* Status chevron tab strip */}
      <StatusTabStrip
        active={statusFilter}
        onChange={setStatusFilter}
        countByStatus={countByStatus}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, file name…"
            className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm focus:border-violet-500 focus:outline-none"
          />
        </div>
        <FilterButton
          activeCount={countActiveFilters(filterValues)}
          onClick={() => setFilterOpen(true)}
        />
        <button
          onClick={() => setBulkOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <FileUp size={15} />
          Bulk Upload CVs
        </button>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          <Plus size={16} />
          Add New Candidate
        </button>
      </div>

      {countActiveFilters(filterValues) > 0 && (
        <AppliedFilterChips
          fields={filterFields}
          values={filterValues}
          onRemove={clearFilter}
          onClearAll={() => setFilterValues({})}
        />
      )}

      {/* Body */}
      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-400">
          Loading CV records…
        </div>
      ) : totalUnfiltered === 0 ? (
        <EmptyState onAdd={() => setAddOpen(true)} />
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
          <p className="font-medium text-gray-500">No CVs match</p>
          <p className="mt-1 text-sm text-gray-400">
            Try a different status, clear filters, or broaden the search.
          </p>
        </div>
      ) : (
        <CVTable
          cvs={filtered}
          selected={selected}
          allSelected={allVisibleSelected}
          highlightId={highlightId}
          onToggleAll={toggleAllVisible}
          onToggleOne={toggleOne}
          onEdit={(c) => setEditing(c)}
          onDelete={handleDelete}
          onDownload={(c) =>
            showToast("success", `Downloading ${c.fileName}…`)
          }
        />
      )}

      {selected.size > 0 && (
        <SelectionBar
          count={selected.size}
          onClear={() => setSelected(new Set())}
          onDelete={handleBulkDelete}
        />
      )}

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

      {addOpen && (
        <AddCandidateModal
          program={program}
          onClose={() => setAddOpen(false)}
          onPromoted={handlePromoted}
        />
      )}
      {editing && (
        <AddCandidateModal
          program={program}
          cv={editing}
          onClose={() => setEditing(null)}
          onPromoted={handlePromoted}
        />
      )}
      {bulkOpen && (
        <BulkUploadModal
          program={program}
          onClose={() => {
            setBulkOpen(false);
            void refresh({ silent: true });
          }}
          onCompleted={(n) =>
            showToast("success", `${n} file${n > 1 ? "s" : ""} uploaded.`)
          }
        />
      )}
    </div>
  );
}

/* ============================================================
 * Status tab strip — All | AI Extracting | Needs Review | … (counts)
 * ============================================================ */

function StatusTabStrip({
  active,
  onChange,
  countByStatus,
}: {
  active: StatusFilter;
  onChange: (s: StatusFilter) => void;
  countByStatus: Map<StatusFilter, number>;
}) {
  return (
    <div className="flex items-stretch gap-1 overflow-x-auto rounded-lg border border-gray-200 bg-white p-1">
      {STATUS_TABS.map((tab) => {
        const count = countByStatus.get(tab.id) ?? 0;
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              isActive
                ? "bg-violet-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            {tab.id === "extracting" && <Sparkles size={11} />}
            {tab.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
                isActive ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================
 * Table
 * ============================================================ */

function CVTable({
  cvs,
  selected,
  allSelected,
  highlightId,
  onToggleAll,
  onToggleOne,
  onEdit,
  onDelete,
  onDownload,
}: {
  cvs: CVRecord[];
  selected: Set<string>;
  allSelected: boolean;
  highlightId: string | null;
  onToggleAll: () => void;
  onToggleOne: (id: string) => void;
  onEdit: (c: CVRecord) => void;
  onDelete: (id: string) => void;
  onDownload: (c: CVRecord) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          <tr>
            <th className="w-10 p-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleAll}
                aria-label="Select all visible"
                className="accent-violet-600"
              />
            </th>
            <th className="p-3">Name &amp; Contact Information</th>
            <th className="p-3">Status</th>
            <th className="p-3">Type</th>
            <th className="p-3">Source</th>
            <th className="p-3">Added Time</th>
            <th className="p-3">File Name</th>
            <th className="p-3">Skills</th>
            <th className="w-20 p-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {cvs.map((c) => {
            const isSel = selected.has(c.id);
            const flashing = highlightId === c.id;
            const isExtracting = c.status === "extracting";
            const showName = c.parsedName || c.parsedEmail;
            return (
              <tr
                key={c.id}
                className={cn(
                  "border-t border-gray-100 align-top transition-colors",
                  isSel ? "bg-violet-50/60" : "hover:bg-gray-50/60",
                  flashing && "animate-pulse bg-amber-50"
                )}
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={isSel}
                    onChange={() => onToggleOne(c.id)}
                    className="accent-violet-600"
                  />
                </td>
                <td className="p-3">
                  {isExtracting && !showName ? (
                    <span className="text-xs italic text-gray-400">
                      AI is parsing this CV…
                    </span>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-gray-900">
                          {c.parsedName || (
                            <span className="italic text-gray-400">
                              Name unknown
                            </span>
                          )}
                        </p>
                        {isCVNew(c) && (
                          <span className="inline-flex items-center rounded bg-violet-600 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-gray-500">
                        {c.parsedEmail || (
                          <span className="italic text-gray-300">
                            no email parsed
                          </span>
                        )}
                      </p>
                    </>
                  )}
                </td>
                <td className="p-3">
                  <CVStatusBadge status={c.status} />
                  {c.status === "error" && c.errorReason && (
                    <p className="mt-0.5 max-w-[180px] text-[10px] text-red-600">
                      {c.errorReason}
                    </p>
                  )}
                </td>
                <td className="p-3 text-xs text-gray-700">
                  {c.type === "auto-sync" ? "Auto-Sync" : "Manual"}
                </td>
                <td className="p-3 text-xs text-gray-700">{c.source}</td>
                <td className="p-3 text-xs text-gray-700">
                  {formatAdded(c.addedAtISO)}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => onDownload(c)}
                    className="group inline-flex max-w-[260px] items-center gap-1.5 truncate text-left text-xs font-medium text-gray-700 hover:text-violet-700"
                    title={c.fileName}
                  >
                    <FileText
                      size={13}
                      className="shrink-0 text-gray-400 group-hover:text-violet-500"
                    />
                    <span className="truncate">{c.fileName}</span>
                    <Download
                      size={12}
                      className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </button>
                </td>
                <td className="p-3 text-xs">
                  <span
                    className={cn(
                      "inline-flex min-w-[1.75rem] justify-center rounded-full px-2 py-0.5 font-semibold",
                      c.skills.length === 0
                        ? "bg-gray-100 text-gray-500"
                        : "bg-violet-100 text-violet-700"
                    )}
                  >
                    {c.skills.length}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(c)}
                      disabled={c.status === "extracting"}
                      title={
                        c.status === "extracting"
                          ? "Wait for AI parsing to finish."
                          : "Check & Fix"
                      }
                      className="rounded p-1.5 text-gray-500 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(c.id)}
                      className="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
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
 * Selection bar — sticky bottom
 * ============================================================ */

function SelectionBar({
  count,
  onClear,
  onDelete,
}: {
  count: number;
  onClear: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="sticky bottom-3 z-20 mx-auto flex w-fit items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-lg">
      <span className="text-sm font-medium text-gray-800">
        {count} candidate{count > 1 ? "s" : ""} selected
      </span>
      <span className="h-4 w-px bg-gray-200" />
      <button
        onClick={onDelete}
        className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
      >
        <Trash2 size={12} />
        Delete
      </button>
      <button
        onClick={onClear}
        className="text-xs text-gray-500 hover:text-gray-800"
      >
        Clear
      </button>
    </div>
  );
}

/* ============================================================
 * Empty state
 * ============================================================ */

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-16 text-center">
      <div className="mx-auto mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-violet-100 text-violet-600">
        <Upload size={32} />
      </div>
      <p className="text-base font-semibold text-gray-700">
        No CVs have been uploaded yet.
      </p>
      <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
        A central space for managing and tracking all candidate profiles.
        Please upload your first CV for the system to automatically extract
        and analyse the data.
      </p>
      <button
        onClick={onAdd}
        className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
      >
        <Plus size={16} />
        Add New Candidate
      </button>
    </div>
  );
}
