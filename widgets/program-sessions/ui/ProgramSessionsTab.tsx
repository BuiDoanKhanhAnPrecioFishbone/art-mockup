"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { Test, TestSession } from "@/entities/test";

interface SessionRow {
  session: TestSession;
  test: Test | null;
  counts: {
    pending: number;
    underReview: number;
    done: number;
    total: number;
  };
}

/** Sessions tab on the Program detail page (wireframe node 3228:197638
 *  — Reviewer view). One card per Test session attached to the
 *  program, with Pending / Under Review / Done / Total Assign counters
 *  on the right. Clicking a row drills into the Submissions list for
 *  that session. */
export function ProgramSessionsTab({ programId }: { programId: string }) {
  const [rows, setRows] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/programs/${programId}/sessions`)
      .then((r) => r.json())
      .then((d) => setRows(d.rows ?? []))
      .finally(() => setLoading(false));
  }, [programId]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      {loading ? (
        <div className="p-12 text-center text-sm text-gray-400">
          Loading sessions…
        </div>
      ) : rows.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-sm font-medium text-gray-700">
            No sessions yet.
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Sessions appear here once the program's workflow has Test steps
            with at least one scheduled session.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {rows.map((row) => (
            <SessionRow key={row.session.id} row={row} />
          ))}
        </ul>
      )}
    </div>
  );
}

function SessionRow({ row }: { row: SessionRow }) {
  const { session, counts } = row;
  return (
    <li>
      <Link
        href={`/submissions/${session.id}`}
        className="flex items-start justify-between gap-6 px-6 py-5 transition-colors hover:bg-gray-50"
      >
        {/* Left: title + date range */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900">
            {session.name}
          </p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar size={13} />
            {formatRange(session.startISO, session.endISO)}
          </p>
        </div>

        {/* Right: 4 stat columns separated by vertical dividers */}
        <div className="grid shrink-0 grid-cols-4 items-center divide-x divide-gray-200 text-center">
          <Stat label="Pending" value={counts.pending} />
          <Stat label="Under Review" value={counts.underReview} />
          <Stat label="Done" value={counts.done} />
          <Stat label="Total Assign" value={counts.total} />
        </div>
      </Link>
    </li>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="px-6 first:pl-0 last:pr-0 text-right">
      <p className="text-[11px] font-medium text-gray-500">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-semibold tabular-nums",
          value === 0 ? "text-gray-400" : "text-gray-900"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function formatRange(startISO: string, endISO: string): string {
  const fmt = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const time = d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const date = d.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
    });
    return `${time} ${date}`;
  };
  const year = new Date(endISO).getFullYear();
  return `${fmt(startISO)} – ${fmt(endISO)}, ${year}`;
}
