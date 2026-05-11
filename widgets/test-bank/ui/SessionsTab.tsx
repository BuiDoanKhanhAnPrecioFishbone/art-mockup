"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Copy, Plus, Search, Trash2 } from "lucide-react";
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
import type { TestSession } from "@/entities/test";
import { SessionStatusPill } from "./pieces";

const SESSION_STATUSES = [
  "Upcoming",
  "Active",
  "Closing",
  "Completed",
  "Cancelled",
] as const;

export function SessionsTab({
  testId,
  testTitle,
}: {
  testId: string;
  testTitle: string;
}) {
  const { showToast } = useToast();
  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValues>({});

  function refresh() {
    setLoading(true);
    return fetch(`/api/tests/${testId}/sessions`)
      .then((r) => r.json())
      .then((d) => setSessions(d.sessions ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId]);

  const filterFields: FilterField[] = useMemo(
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
        options: [
          { value: "Public", label: "Public" },
          { value: "Private", label: "Private" },
          { value: "Private Onsite", label: "Private Onsite" },
        ],
      },
    ],
    []
  );

  function passes(s: TestSession): boolean {
    for (const f of filterFields) {
      const v = filterValues[f.id];
      if (!isFieldActive(v)) continue;
      if (v?.kind === "multi-select") {
        if (f.id === "status" && !v.values.includes(s.status)) return false;
        if (f.id === "type" && !v.values.includes(s.type)) return false;
      }
    }
    return true;
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return sessions.filter((s) => {
      if (term && !s.name.toLowerCase().includes(term)) return false;
      return passes(s);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions, search, filterValues]);

  function handleCopyLink(s: TestSession) {
    const url = `https://careers.example.com/tests/${s.id}?code=${s.accessCode}`;
    void navigator.clipboard?.writeText(url);
    showToast("success", `Test link copied — ${url}`);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        <Link
          href={`/tests/${testId}/sessions/new`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          <Plus size={14} />
          Create new session with this test
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative max-w-md flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Session"
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
          Loading sessions…
        </p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-10 text-center">
          <p className="font-medium text-gray-500">No sessions yet.</p>
          <Link
            href={`/tests/${testId}/sessions/new`}
            className="mt-3 inline-flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700"
          >
            <Plus size={12} />
            Create the first session
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="p-3">Session</th>
                <th className="p-3">Test</th>
                <th className="w-20 p-3">Type</th>
                <th className="w-28 p-3">Access Code</th>
                <th className="w-24 p-3">Status</th>
                <th className="p-3">Duration</th>
                <th className="w-20 p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  className="border-t border-gray-100 hover:bg-gray-50/60"
                >
                  <td className="p-3 font-medium text-gray-900">{s.name}</td>
                  <td className="p-3 text-xs text-gray-700">{testTitle}</td>
                  <td className="p-3 text-xs text-gray-700">{s.type}</td>
                  <td className="p-3 font-mono text-xs text-gray-700">
                    {s.accessCode}
                  </td>
                  <td className="p-3">
                    <SessionStatusPill status={s.status} />
                  </td>
                  <td className="p-3 text-xs text-gray-700">
                    {formatRange(s.startISO, s.endISO)}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleCopyLink(s)}
                        className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        title="Copy Test Link"
                        aria-label={`Copy test link for ${s.name}`}
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        className="rounded p-1.5 text-red-500 hover:bg-red-50"
                        title="Delete Session"
                        aria-label={`Delete ${s.name}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
      {/* silence unused */}
      <span className={cn("hidden")} />
    </div>
  );
}

function formatRange(startISO: string, endISO: string): string {
  const fmt = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const date = d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
    const time = d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `${time} ${date}`;
  };
  return `${fmt(startISO)} - ${fmt(endISO)}`;
}
