"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Download,
  ExternalLink,
  FileText,
  Mail,
  MoveRight,
  StickyNote,
  Trash2,
  X,
} from "lucide-react";
import { REVIEWERS } from "@/shared/fixtures/reviewers";
import {
  candidateInitials,
  type Candidate,
  type CandidateStatus,
} from "@/entities/candidate";
import type { WorkflowStage } from "@/entities/program";
import {
  GroupLabelBadge,
  ReviewerStack,
  SkillsBadge,
  StatusBadge,
} from "./pieces";

export function CandidateDetailPanel({
  candidate,
  stages,
  onClose,
  onMove,
  onChangeStatus,
  onUndoReject,
  onDownloadCV,
  onDelete,
}: {
  candidate: Candidate;
  stages: WorkflowStage[];
  onClose: () => void;
  onMove: () => void;
  onChangeStatus: () => void;
  /** Visible only when the candidate is currently `rejected`. Doc 02
   *  §2.5: HR can re-activate a rejected candidate; the auto-assigner
   *  picks a fresh reviewer for the same step. */
  onUndoReject?: () => void;
  onDownloadCV: () => void;
  onDelete: () => void;
}) {
  const stage = stages.find((s) => s.id === candidate.currentStageId);
  const step = stage?.steps.find((st) => st.id === candidate.currentStepId);
  const reviewers = candidate.reviewerIds
    .map((id) => REVIEWERS.find((r) => r.id === id))
    .filter((r): r is (typeof REVIEWERS)[number] => Boolean(r));

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex">
      <div
        className="flex-1 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <aside className="flex w-full max-w-md flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start gap-3 border-b border-gray-100 p-5">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-base font-semibold uppercase text-white">
            {candidateInitials(candidate.name)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-base font-semibold text-gray-900">
                {candidate.name}
              </p>
              <Link
                href={`/programs/${candidate.programId}/candidates/${candidate.id}`}
                className="inline-flex shrink-0 items-center gap-1 rounded-md border border-violet-300 bg-white px-2 py-0.5 text-[11px] font-medium text-violet-700 hover:bg-violet-50"
                title="Open full candidate profile"
              >
                Open <ExternalLink size={10} />
              </Link>
            </div>
            <p className="truncate text-xs text-gray-500">{candidate.email}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <StatusBadge status={candidate.status} />
              {candidate.groupLabel && (
                <GroupLabelBadge label={candidate.groupLabel} />
              )}
              <SkillsBadge percent={candidate.skillsMatchPercent} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {/* Current stage */}
          <Section title="Current position">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Stage → Step
              </p>
              <p className="mt-0.5 text-sm font-medium text-gray-900">
                {stage?.name ?? "—"}{" "}
                <span className="text-gray-400">→</span> {step?.name ?? "—"}
              </p>
              {step?.instruction && (
                <p className="mt-2 text-xs text-gray-600">{step.instruction}</p>
              )}
            </div>
          </Section>

          {/* Schedule + result */}
          <Section title="Schedule & result">
            <KeyValue
              icon={<Calendar size={14} />}
              label="Booked"
              value={
                candidate.bookedDateISO
                  ? `${candidate.bookedTime ?? ""}, ${candidate.bookedDateISO}`
                  : "Not booked"
              }
            />
            <KeyValue
              icon={<FileText size={14} />}
              label="Last step result"
              value={candidate.stepResult ?? "—"}
            />
          </Section>

          {/* Reviewers */}
          <Section title={`Reviewers (${reviewers.length})`}>
            {reviewers.length === 0 ? (
              <p className="text-xs text-gray-400">No reviewers assigned.</p>
            ) : (
              <ul className="space-y-1.5">
                {reviewers.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center gap-2 rounded-lg border border-gray-100 bg-white px-2.5 py-1.5"
                  >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-[10px] font-semibold uppercase text-white">
                      {candidateInitials(r.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-gray-900">
                        {r.name}
                      </p>
                      <p className="truncate text-[11px] text-gray-500">
                        {r.role}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-2">
              <ReviewerStack reviewerIds={candidate.reviewerIds} />
            </div>
          </Section>

          {/* Activity */}
          <Section title="Activity">
            <KeyValue
              icon={<Mail size={14} className="text-violet-500" />}
              label="Pending emails"
              value={
                candidate.pendingEmailCount > 0
                  ? `${candidate.pendingEmailCount} queued`
                  : "None"
              }
            />
            <KeyValue
              icon={<StickyNote size={14} className="text-amber-500" />}
              label="Reviewer note"
              value={candidate.hasNote ? "Has note" : "No note"}
            />
          </Section>

          {/* Status history — Doc 10 audit trail */}
          {candidate.statusHistory && candidate.statusHistory.length > 0 && (
            <Section title="Status History">
              <ul className="space-y-1.5">
                {[...candidate.statusHistory].reverse().map((evt) => (
                  <li
                    key={evt.id}
                    className="rounded-lg border border-gray-100 bg-white px-2.5 py-1.5 text-[11px]"
                  >
                    <p className="text-gray-700">
                      <span className="font-medium">{evt.from}</span> →{" "}
                      <span className="font-medium">{evt.to}</span>
                    </p>
                    {evt.reason && (
                      <p className="mt-0.5 text-gray-500">
                        Reason: {evt.reason}
                      </p>
                    )}
                    <p className="mt-0.5 text-[10px] text-gray-400">
                      {new Date(evt.atISO).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      · {evt.by}
                    </p>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Mock CV */}
          <Section title="CV">
            <button
              onClick={onDownloadCV}
              className="flex w-full items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-xs hover:bg-gray-50"
            >
              <span className="flex items-center gap-2">
                <FileText size={14} className="text-gray-500" />
                <span className="font-medium text-gray-800">
                  {candidate.name.replace(/\s+/g, "_")}_CV.pdf
                </span>
              </span>
              <Download size={14} className="text-gray-400" />
            </button>
          </Section>
        </div>

        {/* Footer actions */}
        <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 bg-gray-50 px-4 py-3">
          <button
            onClick={onMove}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
          >
            <MoveRight size={13} />
            Move to step
          </button>
          <button
            onClick={onChangeStatus}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
          >
            Change status
          </button>
          {candidate.status === "rejected" && onUndoReject && (
            <button
              onClick={onUndoReject}
              className="inline-flex items-center gap-1.5 rounded-lg border border-violet-300 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-100"
              title="Re-activate this candidate. A new reviewer is auto-assigned based on current workload."
            >
              ↺ Undo Reject
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            <Trash2 size={13} />
            Delete
          </button>
        </div>
      </aside>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h4 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </h4>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function KeyValue({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="flex items-center gap-1.5 text-gray-500">
        {icon}
        {label}
      </span>
      <span className="text-right font-medium text-gray-800">{value}</span>
    </div>
  );
}

// re-export to keep the call site self-contained
export type { CandidateStatus };
