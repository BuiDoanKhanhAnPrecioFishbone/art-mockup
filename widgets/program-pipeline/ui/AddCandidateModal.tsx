"use client";

import { useState } from "react";
import type { CandidateGroupLabel } from "@/entities/candidate";
import type { WorkflowStage } from "@/entities/program";
import { ModalShell } from "./pieces";

export interface NewCandidatePayload {
  name: string;
  email: string;
  groupLabel?: CandidateGroupLabel;
  currentStageId: string;
  currentStepId: string;
  skillsMatchPercent: number;
}

export function AddCandidateModal({
  stages,
  onClose,
  onCreate,
}: {
  stages: WorkflowStage[];
  onClose: () => void;
  onCreate: (data: NewCandidatePayload) => Promise<void>;
}) {
  const firstStage = stages.find((s) => s.steps.length > 0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [groupLabel, setGroupLabel] = useState<CandidateGroupLabel | "">(
    ""
  );
  const [stageId, setStageId] = useState(firstStage?.id ?? "");
  const [stepId, setStepId] = useState(firstStage?.steps[0]?.id ?? "");
  const [matchPercent, setMatchPercent] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const stage = stages.find((s) => s.id === stageId);
  const validStepId = stage?.steps.some((st) => st.id === stepId)
    ? stepId
    : stage?.steps[0]?.id ?? "";

  const valid = name.trim() && email.trim() && stageId && validStepId;

  async function submit() {
    if (!valid || submitting) return;
    setSubmitting(true);
    try {
      await onCreate({
        name: name.trim(),
        email: email.trim(),
        groupLabel: groupLabel || undefined,
        currentStageId: stageId,
        currentStepId: validStepId,
        skillsMatchPercent: matchPercent,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalShell
      title="Add new candidate"
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
            disabled={!valid || submitting}
            className="rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {submitting ? "Adding…" : "Add candidate"}
          </button>
        </>
      }
    >
      <Field label="Full name" required>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Alex Tran"
          className="input"
        />
      </Field>
      <Field label="Email" required>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="alex.tran@example.com"
          className="input"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Stage" required>
          <select
            value={stageId}
            onChange={(e) => {
              const next = e.target.value;
              setStageId(next);
              setStepId(stages.find((s) => s.id === next)?.steps[0]?.id ?? "");
            }}
            className="input"
          >
            {stages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Step" required>
          <select
            value={validStepId}
            onChange={(e) => setStepId(e.target.value)}
            className="input"
          >
            {stage?.steps.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Group label">
          <select
            value={groupLabel}
            onChange={(e) =>
              setGroupLabel((e.target.value || "") as CandidateGroupLabel | "")
            }
            className="input"
          >
            <option value="">— None —</option>
            <option value="high-priority">High-priority</option>
            <option value="mid-priority">Mid-priority</option>
            <option value="low-priority">Low-priority</option>
          </select>
        </Field>
        <Field label="Skills match %">
          <input
            type="number"
            min={0}
            max={100}
            value={matchPercent}
            onChange={(e) =>
              setMatchPercent(
                Math.max(0, Math.min(100, Number(e.target.value) || 0))
              )
            }
            className="input"
          />
        </Field>
      </div>
      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgb(209 213 219);
          background: white;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: rgb(17 24 39);
        }
        .input:focus {
          border-color: rgb(139 92 246);
          outline: none;
        }
      `}</style>
    </ModalShell>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
