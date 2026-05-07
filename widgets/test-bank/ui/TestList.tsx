"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
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
  TEST_STATUSES,
  TEST_TYPES,
  type Test,
} from "@/entities/test";
import { StatusPill, TagChips, TypePill } from "./pieces";

export function TestList() {
  const { showToast } = useToast();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  function refresh() {
    setLoading(true);
    return fetch("/api/tests")
      .then((r) => r.json())
      .then((d) => setTests(d.tests ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    void refresh();
  }, []);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const t of tests) for (const x of t.tags) set.add(x);
    return Array.from(set).sort();
  }, [tests]);

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        id: "status",
        label: "Status",
        kind: "multi-select",
        options: TEST_STATUSES.map((s) => ({ value: s, label: s })),
      },
      {
        id: "type",
        label: "Type",
        kind: "multi-select",
        options: TEST_TYPES.map((t) => ({ value: t, label: t })),
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

  function passesFilters(t: Test): boolean {
    for (const f of filterFields) {
      const v = filterValues[f.id];
      if (!isFieldActive(v)) continue;
      if (v?.kind === "multi-select") {
        if (f.id === "status" && !v.values.includes(t.status)) return false;
        if (f.id === "type" && !v.values.includes(t.type)) return false;
        if (f.id === "tags" && !t.tags.some((x) => v.values.includes(x)))
          return false;
      }
    }
    return true;
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return tests.filter((t) => {
      if (term && !t.title.toLowerCase().includes(term)) return false;
      return passesFilters(t);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tests, search, filterValues]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (safePage - 1) * perPage,
    safePage * perPage
  );

  function clearFilter(id: string) {
    setFilterValues((p) => {
      const n = { ...p };
      delete n[id];
      return n;
    });
  }

  async function handleDelete(t: Test) {
    if (!confirm(`Delete "${t.title}"?`)) return;
    const res = await fetch(`/api/tests/${t.id}`, { method: "DELETE" });
    if (!res.ok) {
      showToast("error", "Could not delete test.");
      return;
    }
    setTests((prev) => prev.filter((x) => x.id !== t.id));
    showToast("success", `Deleted "${t.title}".`);
  }

  return (
    <div className="px-8 py-6">
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Tests
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage reusable tests for hiring and assessments.
          </p>
        </div>
        <Link
          href="/tests/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          <Plus size={16} />
          Create New Test
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
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by Title"
              className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm focus:border-violet-500 focus:outline-none"
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
            onRemove={clearFilter}
            onClearAll={() => setFilterValues({})}
          />
        )}

        {loading ? (
          <p className="py-12 text-center text-sm text-gray-400">
            Loading tests…
          </p>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 p-10 text-center">
            <p className="font-medium text-gray-500">
              {tests.length === 0
                ? "No tests yet."
                : "No tests match this search."}
            </p>
            {tests.length === 0 && (
              <Link
                href="/tests/new"
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700"
              >
                <Plus size={13} />
                Create the first test
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="w-28 p-3">Status</th>
                  <th className="w-40 p-3">Type</th>
                  <th className="p-3">Tags</th>
                  <th className="w-32 p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((t) => (
                  <tr
                    key={t.id}
                    className="border-t border-gray-100 hover:bg-gray-50/60"
                  >
                    <td className="p-3">
                      <Link
                        href={`/tests/${t.id}`}
                        className="line-clamp-2 font-medium text-gray-900 hover:text-violet-700"
                      >
                        {t.title}
                      </Link>
                    </td>
                    <td className="p-3">
                      <StatusPill status={t.status} />
                    </td>
                    <td className="p-3">
                      <TypePill type={t.type} />
                    </td>
                    <td className="p-3">
                      <TagChips tags={t.tags} />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/tests/${t.id}`}
                          className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                          title="Create new Test session"
                          aria-label={`Create session for ${t.title}`}
                        >
                          <Eye size={14} />
                        </Link>
                        <Link
                          href={`/tests/${t.id}/edit`}
                          className="rounded p-1.5 text-gray-500 hover:bg-violet-50 hover:text-violet-700"
                          title="Edit Test"
                          aria-label={`Edit ${t.title}`}
                        >
                          <Pencil size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(t)}
                          className="rounded p-1.5 text-red-500 hover:bg-red-50"
                          title="Delete Test"
                          aria-label={`Delete ${t.title}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between gap-2 border-t border-gray-100 bg-gray-50 px-3 py-2 text-xs">
              <span className="text-gray-500">
                Showing {(safePage - 1) * perPage + 1}–
                {Math.min(safePage * perPage, filtered.length)} of{" "}
                {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="rounded border border-gray-300 bg-white px-2 py-1 hover:bg-gray-50 disabled:opacity-40"
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={cn(
                        "min-w-[28px] rounded border px-2 py-1",
                        p === safePage
                          ? "border-violet-600 bg-violet-600 text-white"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="rounded border border-gray-300 bg-white px-2 py-1 hover:bg-gray-50 disabled:opacity-40"
                >
                  ›
                </button>
              </div>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-xs"
              >
                {[10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n} / page
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
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
    </div>
  );
}
