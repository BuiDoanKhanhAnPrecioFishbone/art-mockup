"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronRight,
  Filter,
  GitCompare,
  Search,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import {
  APPLICATION_OUTCOME_TONE,
  type CandidateApplicationHistory,
} from "@/entities/candidate";
import { ApplicationCompareHubModal } from "./ApplicationCompareHubModal";

/** Application History tab — wireframe nodes 3228:225956 (list) and
 *  3228:225949 (empty state). Lists every past program the candidate
 *  has applied to (current included as "On-going") with a Compare
 *  button that opens the side-by-side comparison hub. */
export function ApplicationHistoryTab({
  history,
  viewerMode = "hr",
}: {
  history: CandidateApplicationHistory[];
  /** When `candidate`, hide the Compare button + per-card "View
   *  Application Details →" link. The candidate sees their past
   *  applications as read-only summary rows; reviewer notes /
   *  comparison hub stay HR-only. */
  viewerMode?: "hr" | "candidate";
}) {
  const [query, setQuery] = useState("");
  const [comparing, setComparing] = useState(false);
  const isHr = viewerMode === "hr";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return history;
    return history.filter(
      (h) =>
        h.programName.toLowerCase().includes(q) ||
        h.jobTitle.toLowerCase().includes(q) ||
        h.jobLevel.toLowerCase().includes(q)
    );
  }, [history, query]);

  if (history.length === 0) {
    return <EmptyHistory />;
  }

  return (
    <section>
      {/* Toolbar — heading + Compare + Search */}
      <div className="mb-3 flex items-center gap-3">
        <h3 className="inline-flex items-center gap-1.5 text-base font-semibold text-violet-700">
          Application History
          <span
            title="Programs this candidate has applied to"
            className="grid h-4 w-4 cursor-help place-items-center rounded-full bg-gray-200 text-[10px] text-gray-600"
          >
            ?
          </span>
        </h3>

        <div className="ml-auto flex items-center gap-2">
          {isHr && (
            <button
              type="button"
              onClick={() => setComparing(true)}
              disabled={history.length < 2}
              className="inline-flex items-center gap-1.5 rounded-md border border-violet-300 bg-white px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-60"
              title={
                history.length < 2
                  ? "Need at least two applications to compare"
                  : ""
              }
            >
              <GitCompare size={11} /> Compare
            </button>
          )}

          <div className="relative">
            <Search
              size={12}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="rounded-md border border-gray-200 py-1.5 pl-8 pr-3 text-xs focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <button
            type="button"
            title="Filter"
            className="rounded-md border border-gray-200 bg-white p-1.5 text-gray-500 hover:bg-gray-50"
          >
            <Filter size={12} />
          </button>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <p className="rounded-md border border-dashed border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
          No applications match your search.
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((entry) => (
            <ApplicationCard
              key={entry.id}
              entry={entry}
              showDetailsLink={isHr}
            />
          ))}
        </ul>
      )}

      {comparing && isHr && (
        <ApplicationCompareHubModal
          history={history}
          onClose={() => setComparing(false)}
        />
      )}
    </section>
  );
}

/* ---------- Application card ---------- */

function ApplicationCard({
  entry,
  showDetailsLink,
}: {
  entry: CandidateApplicationHistory;
  showDetailsLink: boolean;
}) {
  return (
    <li className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      {/* Header row — program name + outcome chip + View link */}
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/60 px-4 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-violet-100 text-[10px] font-semibold text-violet-700">
            P
          </span>
          <p className="truncate text-sm font-semibold text-gray-900">
            {entry.programName}
          </p>
          <span
            className={cn(
              "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold",
              APPLICATION_OUTCOME_TONE[entry.outcome]
            )}
          >
            {entry.outcome}
          </span>
        </div>
        {showDetailsLink && (
          <a
            href={entry.detailsHref ?? "#"}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-800"
          >
            View Application Details <ArrowRight size={11} />
          </a>
        )}
      </div>

      {/* Body — labelled rows */}
      <div className="space-y-2 px-4 py-3 text-xs">
        <Row label="Job Title - Level:">
          {entry.jobTitle} - {entry.jobLevel}
        </Row>
        <Row label="Duration:">{formatRange(entry.startDate, entry.endDate)}</Row>
        {entry.finalStep && (
          <Row label="Final Step:">{entry.finalStep}</Row>
        )}
        {entry.reason && (
          <Row label="Reason:">
            <span className="text-gray-700">{entry.reason}</span>
          </Row>
        )}
      </div>
    </li>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-start gap-3">
      <p className="text-[11px] font-medium text-gray-500">{label}</p>
      <p className="text-sm text-gray-800">{children}</p>
    </div>
  );
}

/* ---------- Empty state ---------- */

function EmptyHistory() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
      <ConfettiIllustration />
      <p className="mt-4 text-base font-semibold text-gray-800">
        The Application history is empty
      </p>
      <p className="mx-auto mt-1 max-w-md text-xs text-gray-500">
        The candidate has not submitted applications for any other
        positions within the system.
      </p>
    </div>
  );
}

/** Lightweight stand-in for the wireframe's clipboard + confetti
 *  illustration. Inline SVG keeps the bundle size flat. */
function ConfettiIllustration() {
  return (
    <svg
      viewBox="0 0 220 130"
      className="mx-auto h-32 w-auto"
      aria-hidden
    >
      <polygon
        points="20,75 24,82 32,82 26,87 28,95 20,90 12,95 14,87 8,82 16,82"
        fill="#fde68a"
      />
      <polygon
        points="190,80 194,87 202,87 196,92 198,100 190,95 182,100 184,92 178,87 186,87"
        fill="#fbcfe8"
      />
      <polygon
        points="40,55 43,60 48,60 44,63 45,68 40,65 35,68 36,63 32,60 37,60"
        fill="#c4b5fd"
      />
      {/* Clipboard */}
      <rect
        x="80"
        y="35"
        width="65"
        height="80"
        rx="6"
        fill="#fff"
        stroke="#c4b5fd"
        strokeWidth={2}
      />
      <rect x="98" y="28" width="29" height="14" rx="3" fill="#c4b5fd" />
      <rect x="92" y="55" width="42" height="3" rx="1.5" fill="#ddd6fe" />
      <rect x="92" y="64" width="36" height="3" rx="1.5" fill="#ddd6fe" />
      <rect x="92" y="73" width="40" height="3" rx="1.5" fill="#ddd6fe" />
      <rect x="92" y="82" width="30" height="3" rx="1.5" fill="#ddd6fe" />
      <rect x="92" y="91" width="38" height="3" rx="1.5" fill="#ddd6fe" />
      {/* Star */}
      <polygon
        points="155,35 159,45 169,45 161,52 164,62 155,55 146,62 149,52 141,45 151,45"
        fill="#fcd34d"
      />
    </svg>
  );
}

/* ---------- helpers ---------- */

function formatRange(start: string, end?: string): string {
  const fmt = (s?: string) => {
    if (!s) return "—";
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };
  if (!end) return `${fmt(start)} → present`;
  return `${fmt(start)} → ${fmt(end)}`;
}
