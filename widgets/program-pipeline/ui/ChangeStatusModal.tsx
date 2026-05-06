"use client";

import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import type { CandidateStatus } from "@/entities/candidate";
import { ModalShell } from "./pieces";

const STATUS_OPTIONS: {
  value: CandidateStatus;
  label: string;
  description: string;
  cls: string;
}[] = [
  {
    value: "on-going",
    label: "On-going",
    description: "Active in the pipeline.",
    cls: "border-gray-300 bg-gray-50 text-gray-800",
  },
  {
    value: "hired",
    label: "Hired",
    description: "Moves to Final Decisions → Hired.",
    cls: "border-green-300 bg-green-50 text-green-800",
  },
  {
    value: "rejected",
    label: "Rejected",
    description: "Moves to Final Decisions → Rejected.",
    cls: "border-red-300 bg-red-50 text-red-800",
  },
];

export function ChangeStatusModal({
  candidateName,
  currentStatus,
  currentResult,
  onClose,
  onConfirm,
}: {
  candidateName: string;
  currentStatus: CandidateStatus;
  currentResult?: string;
  onClose: () => void;
  onConfirm: (status: CandidateStatus, result?: string) => Promise<void>;
}) {
  const [status, setStatus] = useState<CandidateStatus>(currentStatus);
  const [result, setResult] = useState(currentResult ?? "");
  const [submitting, setSubmitting] = useState(false);

  const isFinal = status === "hired" || status === "rejected";
  const unchanged =
    status === currentStatus && (result || "") === (currentResult || "");

  async function submit() {
    if (unchanged || submitting) return;
    setSubmitting(true);
    try {
      await onConfirm(status, isFinal ? result.trim() || undefined : undefined);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalShell
      title={`Change status — ${candidateName}`}
      onClose={onClose}
      footer={
        <>
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={unchanged || submitting}
            className="rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Update status"}
          </button>
        </>
      }
    >
      <div className="space-y-2">
        {STATUS_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
              status === opt.value
                ? `${opt.cls} ring-2 ring-offset-1 ring-violet-300`
                : "border-gray-200 bg-white hover:bg-gray-50"
            )}
          >
            <input
              type="radio"
              name="status"
              value={opt.value}
              checked={status === opt.value}
              onChange={() => setStatus(opt.value)}
              className="mt-0.5 accent-violet-600"
            />
            <div>
              <p className="text-sm font-medium">{opt.label}</p>
              <p className="text-xs text-gray-500">{opt.description}</p>
            </div>
          </label>
        ))}
      </div>
      {isFinal && (
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Decision note (optional)
          </label>
          <textarea
            value={result}
            onChange={(e) => setResult(e.target.value)}
            rows={3}
            placeholder={
              status === "hired"
                ? "e.g. Strong fit on backend skills, ready to onboard."
                : "e.g. Lacked the senior leadership experience for this role."
            }
            className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
          />
        </div>
      )}
    </ModalShell>
  );
}
