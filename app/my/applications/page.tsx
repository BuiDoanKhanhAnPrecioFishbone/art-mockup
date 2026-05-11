"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import {
  APPLICATION_OUTCOME_TONE,
  CANDIDATE_STATUS_LABEL,
  type CandidateApplicationHistory,
  type CandidateStatus,
} from "@/entities/candidate";

interface ApplicationRow {
  candidateId: string;
  program: {
    id: string;
    title: string;
    position: string;
    level: string;
    startDate: string;
    endDate: string;
    status: string;
    description: string | null;
    location: string | null;
    employmentType: string | null;
  };
  currentStage: { id: string; name: string } | null;
  currentStep: { id: string; name: string; type: string } | null;
  status: CandidateStatus;
  addedAtISO: string | null;
}

const STATUS_TONE: Record<CandidateStatus, string> = {
  "on-going": "bg-violet-100 text-violet-700",
  hired: "bg-emerald-100 text-emerald-700",
  completed: "bg-sky-100 text-sky-700",
  rejected: "bg-red-100 text-red-700",
  withdrawn: "bg-gray-200 text-gray-600",
};

/** Candidate self-service "My Applications" page. Lists every program
 *  the logged-in candidate is currently a candidate in (drives the
 *  active applications block) plus their cross-program history (the
 *  read-only past applications without HR reviewer notes). */
export default function MyApplicationsPage() {
  const [name, setName] = useState("");
  const [active, setActive] = useState<ApplicationRow[]>([]);
  const [history, setHistory] = useState<CandidateApplicationHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/my/me")
      .then((r) => r.json())
      .then((d) => {
        setName(d.candidate?.name ?? "");
        setActive(d.applications ?? []);
        setHistory(d.profile?.applicationHistory ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12 text-sm text-gray-400">
        Loading your applications…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-semibold text-gray-900">
        Hello, {name?.split(" ").slice(-1)[0] ?? "Candidate"} 👋
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Here&rsquo;s every program you&rsquo;ve applied to. Click a card to
        review the role details.
      </p>

      {/* Active applications */}
      <section className="mt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-violet-700">
          Active applications
        </p>
        {active.length === 0 ? (
          <p className="rounded-md border border-dashed border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
            You don&rsquo;t have any active applications right now.
          </p>
        ) : (
          <ul className="space-y-3">
            {active.map((row) => (
              <ActiveApplicationCard key={row.candidateId} row={row} />
            ))}
          </ul>
        )}
      </section>

      {/* History */}
      {history.length > 0 && (
        <section className="mt-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Past applications
          </p>
          <ul className="space-y-3">
            {history.map((entry) => (
              <PastApplicationCard key={entry.id} entry={entry} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function ActiveApplicationCard({ row }: { row: ApplicationRow }) {
  return (
    <li className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <Link
        href={`/my/applications/${row.program.id}`}
        className="block px-5 py-4 transition-colors hover:bg-gray-50"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-semibold text-gray-900">
                {row.program.title}
              </h3>
              <span
                className={cn(
                  "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium",
                  STATUS_TONE[row.status]
                )}
              >
                {CANDIDATE_STATUS_LABEL[row.status]}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-700">
              {row.program.position} · {row.program.level}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
              <span className="inline-flex items-center gap-1">
                <Calendar size={11} />
                {formatRange(row.program.startDate, row.program.endDate)}
              </span>
              {row.program.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={11} /> {row.program.location}
                </span>
              )}
              {row.currentStep && (
                <span className="inline-flex items-center gap-1">
                  Current step: <strong>{row.currentStep.name}</strong>
                </span>
              )}
            </div>
          </div>
          <ArrowRight size={16} className="mt-1 shrink-0 text-gray-400" />
        </div>
      </Link>
    </li>
  );
}

function PastApplicationCard({
  entry,
}: {
  entry: CandidateApplicationHistory;
}) {
  return (
    <li className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="px-5 py-4">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-gray-900">
            {entry.programName}
          </h3>
          <span
            className={cn(
              "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold",
              APPLICATION_OUTCOME_TONE[entry.outcome]
            )}
          >
            {entry.outcome}
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-700">
          {entry.jobTitle} · {entry.jobLevel}
        </p>
        <p className="mt-1 text-[11px] text-gray-500">
          {formatRange(entry.startDate, entry.endDate ?? "")}
        </p>
      </div>
    </li>
  );
}

function formatRange(start: string, end: string): string {
  const fmt = (s: string) => {
    if (!s) return "—";
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  if (!end) return `${fmt(start)} → present`;
  return `${fmt(start)} → ${fmt(end)}`;
}
