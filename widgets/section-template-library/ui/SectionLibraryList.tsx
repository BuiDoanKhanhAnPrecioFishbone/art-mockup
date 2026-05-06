"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Eye,
  HelpCircle,
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
  SECTION_TEMPLATE_TAGS,
  containsPreview,
  formatRelative,
  type SectionTemplateRecord,
} from "@/entities/section-template";
import { TagPill, TypePill } from "./pieces";

export function SectionLibraryList() {
  const { showToast } = useToast();
  const [sections, setSections] = useState<SectionTemplateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function refresh() {
    setLoading(true);
    return fetch("/api/section-templates")
      .then((r) => r.json())
      .then((d) => setSections(d.sections ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    void refresh();
  }, []);

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        id: "type",
        label: "Type",
        kind: "multi-select",
        options: [
          { value: "system", label: "System" },
          { value: "custom", label: "Custom" },
        ],
      },
      {
        id: "tags",
        label: "Tags",
        kind: "multi-select",
        options: SECTION_TEMPLATE_TAGS.map((t) => ({ value: t, label: t })),
      },
    ],
    []
  );

  function passesFilters(s: SectionTemplateRecord): boolean {
    for (const f of filterFields) {
      const v = filterValues[f.id];
      if (!isFieldActive(v)) continue;
      if (v?.kind === "multi-select") {
        if (f.id === "type" && !v.values.includes(s.type)) return false;
        if (
          f.id === "tags" &&
          !s.tags.some((t) => v.values.includes(t))
        )
          return false;
      }
    }
    return true;
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sections.filter((s) => {
      if (q) {
        const hay = `${s.name} ${s.description ?? ""} ${s.fields
          .map((f) => f.label)
          .join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return passesFilters(s);
    });
  }, [sections, search, filterValues]);

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((s) => selected.has(s.id));

  function toggleAllVisible() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        for (const s of filtered) next.delete(s.id);
      } else {
        for (const s of filtered) next.add(s.id);
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

  async function handleDelete(s: SectionTemplateRecord) {
    if (s.type === "system") {
      showToast("error", "System sections cannot be deleted.");
      return;
    }
    const res = await fetch(`/api/section-templates/${s.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      showToast("error", data.error ?? "Could not delete.");
      return;
    }
    setSections((prev) => prev.filter((x) => x.id !== s.id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(s.id);
      return next;
    });
    showToast("success", `${s.name} deleted.`);
  }

  async function handleBulkDelete() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    const res = await fetch("/api/section-templates/bulk-delete", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) {
      showToast("error", "Bulk delete failed.");
      return;
    }
    const { removed, rejected } = (await res.json()) as {
      removed: number;
      rejected: string[];
    };
    setSections((prev) => prev.filter((x) => !selected.has(x.id) || rejected.includes(x.id)));
    setSelected(new Set());
    if (rejected.length > 0) {
      showToast(
        "success",
        `${removed} removed. ${rejected.length} kept (system sections).`
      );
    } else {
      showToast("success", `${removed} section${removed === 1 ? "" : "s"} removed.`);
    }
  }

  return (
    <div className="px-8 py-6">
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Template Library
          </p>
          <h1 className="mt-1 inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-gray-900">
            Section Template
            <span
              title="Reusable section templates that programs drop into the candidate profile form."
              className="cursor-help text-gray-400"
            >
              <HelpCircle size={16} />
            </span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Build, manage and reuse blocks of fields across all program candidate profiles.
          </p>
        </div>
        <Link
          href="/templates/sections/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          <Plus size={16} />
          Add New Section
        </Link>
      </header>

      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4">
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
              placeholder="Search by name, contained fields…"
              className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm focus:border-violet-500 focus:outline-none"
            />
          </div>
          <FilterButton
            activeCount={countActiveFilters(filterValues)}
            onClick={() => setFilterOpen(true)}
          />
        </div>

        {countActiveFilters(filterValues) > 0 && (
          <AppliedFilterChips
            fields={filterFields}
            values={filterValues}
            onRemove={clearFilter}
            onClearAll={() => setFilterValues({})}
          />
        )}

        {loading ? (
          <p className="py-12 text-center text-sm text-gray-400">
            Loading section library…
          </p>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 p-10 text-center">
            <p className="font-medium text-gray-500">
              {sections.length === 0
                ? "No sections yet."
                : "No sections match this search."}
            </p>
            {sections.length === 0 && (
              <Link
                href="/templates/sections/new"
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700"
              >
                <Plus size={13} />
                Create the first section
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="w-10 p-3">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleAllVisible}
                      className="accent-violet-600"
                    />
                  </th>
                  <th className="p-3">Section Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Tags</th>
                  <th className="p-3">Contains</th>
                  <th className="p-3">Date Modified</th>
                  <th className="w-32 p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const checked = selected.has(s.id);
                  return (
                    <tr
                      key={s.id}
                      className={cn(
                        "border-t border-gray-100 align-top hover:bg-gray-50/60",
                        checked && "bg-violet-50/50"
                      )}
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleOne(s.id)}
                          className="accent-violet-600"
                        />
                      </td>
                      <td className="p-3">
                        <Link
                          href={`/templates/sections/${s.id}`}
                          className="font-medium text-gray-900 hover:text-violet-700"
                        >
                          {s.name}
                        </Link>
                        {s.repeatable && (
                          <span className="ml-2 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-gray-600">
                            Repeatable
                          </span>
                        )}
                        {s.description && (
                          <p className="mt-0.5 line-clamp-1 text-[11px] text-gray-500">
                            {s.description}
                          </p>
                        )}
                      </td>
                      <td className="p-3">
                        <TypePill type={s.type} />
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {s.tags.length === 0 ? (
                            <span className="text-xs text-gray-300">—</span>
                          ) : (
                            s.tags.map((t) => <TagPill key={t} label={t} />)
                          )}
                        </div>
                      </td>
                      <td className="max-w-[300px] p-3 text-xs text-gray-700">
                        {s.fields.length === 0 ? (
                          <span className="text-gray-300">—</span>
                        ) : (
                          <span className="line-clamp-1">
                            {containsPreview(s, 4)}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-xs text-gray-700">
                        {formatRelative(s.dateModifiedISO)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/templates/sections/${s.id}`}
                            className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            <Eye size={12} />
                            View
                          </Link>
                          {s.type !== "system" || s.fields.length > 0 ? (
                            <Link
                              href={`/templates/sections/${s.id}/edit`}
                              className={cn(
                                "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium",
                                s.type === "system"
                                  ? "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
                                  : "border-violet-200 bg-white text-violet-700 hover:bg-violet-50"
                              )}
                              title={
                                s.type === "system"
                                  ? "System sections allow tag/order edits only."
                                  : "Edit fields"
                              }
                            >
                              <Pencil size={12} />
                              Edit
                            </Link>
                          ) : null}
                          {s.type !== "system" && (
                            <button
                              onClick={() => handleDelete(s)}
                              className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected.size > 0 && (
        <div className="sticky bottom-3 z-20 mt-4 flex items-center justify-center">
          <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-lg">
            <span className="text-sm font-medium text-gray-800">
              {selected.size} section{selected.size > 1 ? "s" : ""} selected
            </span>
            <span className="h-4 w-px bg-gray-200" />
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
            >
              <Trash2 size={12} />
              Delete
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="text-xs text-gray-500 hover:text-gray-800"
            >
              Clear
            </button>
          </div>
        </div>
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
    </div>
  );
}
