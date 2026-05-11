"use client";

import { cn } from "@/shared/lib/cn";
import { REVIEWERS } from "@/shared/fixtures/reviewers";
import {
  CANDIDATE_STATUS_LABEL,
  GROUP_LABEL_LABEL,
  candidateInitials,
  skillsMatchTier,
  type CandidateGroupLabel,
  type CandidateStatus,
} from "@/entities/candidate";

/** Coloured status pill. */
export function StatusBadge({
  status,
  compact,
}: {
  status: CandidateStatus;
  compact?: boolean;
}) {
  const cls =
    status === "hired"
      ? "bg-green-100 text-green-700"
      : status === "completed"
        ? "bg-emerald-100 text-emerald-700"
        : status === "rejected"
          ? "bg-red-100 text-red-700"
          : status === "withdrawn"
            ? "bg-amber-100 text-amber-700"
            : "bg-gray-100 text-gray-700";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs",
        cls
      )}
    >
      {CANDIDATE_STATUS_LABEL[status]}
    </span>
  );
}

export function SkillsBadge({
  percent,
  compact,
}: {
  percent: number;
  compact?: boolean;
}) {
  const tier = skillsMatchTier(percent);
  const dot =
    tier === "green"
      ? "bg-green-500"
      : tier === "amber"
        ? "bg-amber-500"
        : "bg-red-500";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium text-gray-800",
        compact ? "text-[11px]" : "text-xs"
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", dot)} aria-hidden />
      {percent}%
    </span>
  );
}

export function GroupLabelBadge({
  label,
  compact,
}: {
  label: CandidateGroupLabel;
  compact?: boolean;
}) {
  const cls =
    label === "high-priority"
      ? "bg-red-50 text-red-700 border-red-200"
      : label === "mid-priority"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-emerald-50 text-emerald-700 border-emerald-200";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border font-medium",
        compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
        cls
      )}
    >
      {GROUP_LABEL_LABEL[label]}
    </span>
  );
}

export function ReviewerStack({ reviewerIds }: { reviewerIds: string[] }) {
  const reviewers = reviewerIds
    .map((id) => REVIEWERS.find((r) => r.id === id))
    .filter((r): r is (typeof REVIEWERS)[number] => Boolean(r));
  if (reviewers.length === 0)
    return <span className="text-xs text-gray-300">—</span>;
  return (
    <div className="flex -space-x-1">
      {reviewers.slice(0, 4).map((r) => (
        <span
          key={r.id}
          title={`${r.name} · ${r.role}`}
          className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white bg-violet-600 text-[9px] font-semibold uppercase text-white"
        >
          {candidateInitials(r.name)}
        </span>
      ))}
      {reviewers.length > 4 && (
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white bg-gray-200 text-[9px] font-medium text-gray-700">
          +{reviewers.length - 4}
        </span>
      )}
    </div>
  );
}

/** Modal scaffold used by AddCandidate / MoveToStep / ChangeStatus. */
export function ModalShell({
  title,
  onClose,
  footer,
  children,
}: {
  title: string;
  onClose: () => void;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="mx-4 flex w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4 p-5">{children}</div>
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-3">
          {footer}
        </div>
      </div>
    </div>
  );
}
