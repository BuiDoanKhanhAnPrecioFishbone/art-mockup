"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  ClipboardCheck,
  Inbox,
  Mail,
  Search,
  Shield,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type {
  Submission,
  TestSession,
  Test,
} from "@/entities/test";
import type { Candidate } from "@/entities/candidate";

interface InboxRow {
  submission: Submission;
  session: TestSession | null;
  test: Test | null;
  candidate: Candidate | null;
  program: { id: string; title: string } | null;
}

interface InboxResponse {
  reviewer: { id: string; name: string; role: string } | null;
  rows: InboxRow[];
}

/** Reviewer Inbox — the "what's waiting for me right now" surface.
 *  Lists every submission whose status is `submitted` and whose
 *  final review is still Pending / Under Review, where the current
 *  reviewer is assigned. One-click `Review` jumps straight into the
 *  per-question review page. */
export function ReviewerInboxView() {
  const [data, setData] = useState<InboxResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [bucket, setBucket] = useState<"all" | "pending" | "under-review">(
    "all"
  );

  useEffect(() => {
    setLoading(true);
    fetch("/api/reviewer/inbox")
      .then((r) => r.json())
      .then((d: InboxResponse) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const pending = (data?.rows ?? []).filter(
      (r) => r.submission.finalReview !== "Under Review"
    ).length;
    const underReview = (data?.rows ?? []).filter(
      (r) => r.submission.finalReview === "Under Review"
    ).length;
    return { all: data?.rows.length ?? 0, pending, underReview };
  }, [data]);

  const visible = useMemo(() => {
    const rows = data?.rows ?? [];
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (bucket === "pending" && r.submission.finalReview === "Under Review")
        return false;
      if (
        bucket === "under-review" &&
        r.submission.finalReview !== "Under Review"
      )
        return false;
      if (!q) return true;
      return (
        r.submission.candidateName.toLowerCase().includes(q) ||
        r.submission.candidateEmail.toLowerCase().includes(q) ||
        (r.session?.name.toLowerCase().includes(q) ?? false) ||
        (r.test?.title.toLowerCase().includes(q) ?? false) ||
        (r.program?.title.toLowerCase().includes(q) ?? false)
      );
    });
  }, [data, search, bucket]);

  return (
    <div className="space-y-4 px-8 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-gray-500">Assessment Management</p>
          <h1 className="inline-flex items-center gap-2 text-2xl font-semibold text-gray-900">
            <Inbox size={20} className="text-violet-600" />
            Review Inbox
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Submissions waiting for your verdict. Final-reviewed entries
            don&rsquo;t show here — find those on the per-program Sessions
            tab.
          </p>
        </div>
        {data?.reviewer && (
          <div className="rounded-lg border border-violet-200 bg-violet-50/40 px-3 py-2 text-xs text-violet-800">
            Acting as <strong>{data.reviewer.name}</strong> ·{" "}
            {data.reviewer.role}
          </div>
        )}
      </div>

      {/* Bucket toggle + search */}
      <div className="flex flex-wrap items-center gap-2">
        <BucketChip
          active={bucket === "all"}
          onClick={() => setBucket("all")}
          label="All"
          count={counts.all}
        />
        <BucketChip
          active={bucket === "pending"}
          onClick={() => setBucket("pending")}
          label="New"
          count={counts.pending}
          tone="violet"
        />
        <BucketChip
          active={bucket === "under-review"}
          onClick={() => setBucket("under-review")}
          label="Under review"
          count={counts.underReview}
          tone="amber"
        />

        <div className="relative ml-auto min-w-[260px] max-w-md flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate, session, or program…"
            className="w-full rounded-md border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-400">
          Loading…
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <p className="text-sm font-medium text-gray-700">
            🎉 You&rsquo;re all caught up.
          </p>
          <p className="mt-1 text-xs text-gray-500">
            No submissions waiting on your verdict right now.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {visible.map((row) => (
            <InboxRowCard key={row.submission.id} row={row} />
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------- Bucket chip ---------- */

function BucketChip({
  active,
  onClick,
  label,
  count,
  tone = "gray",
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  tone?: "gray" | "violet" | "amber";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? tone === "violet"
            ? "border-violet-300 bg-violet-50 text-violet-700"
            : tone === "amber"
              ? "border-amber-300 bg-amber-50 text-amber-700"
              : "border-gray-300 bg-gray-100 text-gray-800"
          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
      )}
    >
      {label}
      <span
        className={cn(
          "rounded px-1.5 py-0.5 text-[10px] tabular-nums",
          active
            ? tone === "violet"
              ? "bg-violet-200 text-violet-800"
              : tone === "amber"
                ? "bg-amber-200 text-amber-800"
                : "bg-gray-300 text-gray-800"
            : "bg-gray-100 text-gray-600"
        )}
      >
        {count}
      </span>
    </button>
  );
}

/* ---------- Per-row card ---------- */

function InboxRowCard({ row }: { row: InboxRow }) {
  const { submission, session, test, candidate, program } = row;
  const isUnderReview = submission.finalReview === "Under Review";
  const submittedAt = submission.submittedAtISO
    ? formatRelative(submission.submittedAtISO)
    : null;

  // Deep-link to the per-question review page when we have a session,
  // otherwise fall back to the submission detail.
  const href = session
    ? `/submissions/${session.id}/${submission.id}/review`
    : `#`;

  return (
    <li className="overflow-hidden rounded-lg border border-gray-200 bg-white transition-colors hover:border-violet-200">
      <Link href={href} className="block p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-gray-900">
                {submission.candidateName}
              </p>
              <span
                className={cn(
                  "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  isUnderReview
                    ? "bg-amber-100 text-amber-700"
                    : "bg-violet-100 text-violet-700"
                )}
              >
                {isUnderReview ? "Under Review" : "New"}
              </span>
              {submission.scorePercent != null && (
                <span
                  className={cn(
                    "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold tabular-nums",
                    submission.scorePercent >= 80
                      ? "bg-emerald-100 text-emerald-700"
                      : submission.scorePercent >= 60
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                  )}
                >
                  {submission.scorePercent}%
                </span>
              )}
            </div>
            <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-gray-500">
              <Mail size={11} />
              {submission.candidateEmail}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-gray-600">
              {test && (
                <span className="inline-flex items-center gap-1">
                  <ClipboardCheck size={11} className="text-violet-500" />
                  {test.title}
                </span>
              )}
              {session && (
                <span className="text-gray-400">·</span>
              )}
              {session && <span className="truncate">{session.name}</span>}
              {program && (
                <>
                  <span className="text-gray-400">·</span>
                  <Link
                    href={`/programs/${program.id}/edit?tab=pipelines`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-violet-600 underline hover:text-violet-800"
                  >
                    {program.title}
                  </Link>
                </>
              )}
            </div>

            {/* Integrity hints */}
            {submission.integrity && (
              <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px]">
                <IntegritySummary integrity={submission.integrity} />
                {submittedAt && (
                  <span className="inline-flex items-center gap-1 text-gray-500">
                    <Calendar size={11} /> Submitted {submittedAt}
                  </span>
                )}
              </div>
            )}
          </div>

          {candidate && (
            <Link
              href={`/programs/${candidate.programId}/candidates/${candidate.id}`}
              onClick={(e) => e.stopPropagation()}
              className="shrink-0 self-start rounded-md border border-gray-200 px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-50"
              title="Open candidate profile"
            >
              View profile
            </Link>
          )}

          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-violet-600 px-3 py-2 text-xs font-medium text-white hover:bg-violet-700">
            Review <ArrowRight size={12} />
          </span>
        </div>
      </Link>
    </li>
  );
}

/* ---------- Inline integrity summary ---------- */

function IntegritySummary({
  integrity,
}: {
  integrity: NonNullable<Submission["integrity"]>;
}) {
  const flags: string[] = [];
  if (integrity.devtoolsOpenCount > 0) flags.push("DevTools");
  if (integrity.multiInstanceCount > 0) flags.push("multi-instance");
  if (integrity.multiMonitorFlag) flags.push("multi-monitor");
  if (integrity.leavingTabCount >= 3) flags.push(`${integrity.leavingTabCount} tab leaves`);
  if (integrity.copyPasteCount >= 3) flags.push(`${integrity.copyPasteCount} pastes`);
  if (flags.length === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-700">
        <Shield size={11} /> Clean
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-red-700">
      <Shield size={11} /> Flagged · {flags.join(", ")}
    </span>
  );
}

/* ---------- helpers ---------- */

function formatRelative(iso: string): string {
  const ms = Date.now() - Date.parse(iso);
  if (Number.isNaN(ms)) return iso;
  const minutes = Math.round(ms / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
