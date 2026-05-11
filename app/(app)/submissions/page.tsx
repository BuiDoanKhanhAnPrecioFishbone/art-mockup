"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, IdCard, Search } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import {
  FilterButton,
  FilterModal,
  countActiveFilters,
  isFieldActive,
  type FilterField,
  type FilterValues,
} from "@/shared/ui/filter";
import {
  SESSION_STATUSES,
  SESSION_STATUS_TONE,
  type SessionStatus,
  type SessionType,
  type Test,
  type TestSession,
} from "@/entities/test";

interface IndexRow {
  session: TestSession;
  test: Test | null;
  submissionsTotal: number;
  submissionsSubmitted: number;
  submissionsInProgress: number;
}

export default function SubmissionsPage() {
  const [rows, setRows] = useState<IndexRow[]>([]);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/submissions")
      .then((r) => r.json())
      .then((d) => setRows(d.rows ?? []))
      .finally(() => setLoading(false));
  }, []);

  const fields: FilterField[] = useMemo(
    () => [
      {
        id: "status",
        label: "Status",
        kind: "multi-select",
        options: SESSION_STATUSES.map((s) => ({ value: s, label: s })),
      },
      {
        id: "type",
        label: "Type",
        kind: "multi-select",
        options: (
          ["Public", "Private", "Private Onsite"] as SessionType[]
        ).map((t) => ({ value: t, label: t })),
      },
    ],
    []
  );

  const filtered = rows.filter((r) => {
    if (search) {
      const q = search.toLowerCase();
      const haystack = `${r.session.name} ${r.test?.title ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    const s = filterValues.status;
    if (isFieldActive(s) && s?.kind === "multi-select") {
      if (!s.values.includes(r.session.status)) return false;
    }
    const t = filterValues.type;
    if (isFieldActive(t) && t?.kind === "multi-select") {
      if (!t.values.includes(r.session.type)) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-8 py-5">
        <p className="text-xs text-gray-400">Assessment Management</p>
        <h1 className="mt-1 text-xl font-bold text-gray-900">Submission</h1>
        <p className="mt-1 text-xs text-gray-500">
          Every test session in the platform — click a row to inspect its
          per-candidate submissions.
        </p>
      </header>

      <div className="px-8 py-6">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3">
            <div className="relative max-w-md flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by session name or test…"
                className="h-9 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm focus:border-violet-500 focus:outline-none"
              />
            </div>
            <FilterButton
              activeCount={countActiveFilters(filterValues)}
              onClick={() => setFilterOpen(true)}
            />
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-gray-400">
              Loading sessions…
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="p-3">Session Name</th>
                    <th className="p-3">Test</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Access Code</th>
                    <th className="p-3">Window</th>
                    <th className="p-3">Submissions</th>
                    <th className="w-12 p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.session.id} className="border-t border-gray-100">
                      <td className="p-3">
                        <Link
                          href={`/submissions/${r.session.id}`}
                          className="font-medium text-violet-700 hover:text-violet-900"
                        >
                          {r.session.name}
                        </Link>
                      </td>
                      <td className="p-3 text-xs text-gray-600">
                        {r.test?.title ?? "—"}
                      </td>
                      <td className="p-3 text-xs text-gray-700">
                        {r.session.type}
                      </td>
                      <td className="p-3">
                        <SessionStatusPill status={r.session.status} />
                      </td>
                      <td className="p-3 font-mono text-xs text-gray-700">
                        {r.session.accessCode}
                      </td>
                      <td className="p-3 text-xs text-gray-500">
                        {formatWindow(r.session.startISO, r.session.endISO)}
                      </td>
                      <td className="p-3 text-xs text-gray-700">
                        <span className="font-semibold">
                          {r.submissionsTotal}
                        </span>
                        <span className="ml-1 text-gray-400">
                          ({r.submissionsSubmitted} done
                          {r.submissionsInProgress > 0
                            ? `, ${r.submissionsInProgress} live`
                            : ""}
                          )
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Link
                          href={`/submissions/${r.session.id}`}
                          className="inline-flex items-center text-xs font-medium text-violet-600 hover:text-violet-800"
                        >
                          View
                          <ChevronRight size={12} className="ml-0.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="p-12 text-center text-sm text-gray-400"
                      >
                        <IdCard
                          size={28}
                          className="mx-auto mb-2 text-gray-300"
                        />
                        No sessions match your filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
    </div>
  );
}

function SessionStatusPill({ status }: { status: SessionStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
        SESSION_STATUS_TONE[status]
      )}
    >
      {status}
    </span>
  );
}

function formatWindow(startISO: string, endISO: string): string {
  const f = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  return `${f(startISO)} → ${f(endISO)}`;
}
