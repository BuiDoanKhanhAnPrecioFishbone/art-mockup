"use client";

import { useState } from "react";
import type { WorkflowStage } from "@/entities/program";
import { ModalShell } from "./pieces";

export function MoveToStepModal({
  stages,
  candidateName,
  currentStageId,
  currentStepId,
  onClose,
  onConfirm,
}: {
  stages: WorkflowStage[];
  candidateName: string;
  currentStageId: string;
  currentStepId: string;
  onClose: () => void;
  onConfirm: (stageId: string, stepId: string) => Promise<void>;
}) {
  const [stageId, setStageId] = useState(currentStageId);
  const [stepId, setStepId] = useState(currentStepId);
  const [submitting, setSubmitting] = useState(false);

  const stage = stages.find((s) => s.id === stageId);
  const validStepId = stage?.steps.some((st) => st.id === stepId)
    ? stepId
    : stage?.steps[0]?.id ?? "";

  const unchanged = stageId === currentStageId && validStepId === currentStepId;

  async function submit() {
    if (unchanged || submitting || !stage || !validStepId) return;
    setSubmitting(true);
    try {
      await onConfirm(stageId, validStepId);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalShell
      title={`Move ${candidateName}`}
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
            {submitting ? "Moving…" : "Move candidate"}
          </button>
        </>
      }
    >
      <p className="text-xs text-gray-500">
        Pick the destination stage and step. The candidate will appear in the
        target column immediately.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Stage
          </label>
          <select
            value={stageId}
            onChange={(e) => {
              const next = e.target.value;
              setStageId(next);
              setStepId(stages.find((s) => s.id === next)?.steps[0]?.id ?? "");
            }}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
          >
            {stages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Step
          </label>
          <select
            value={validStepId}
            onChange={(e) => setStepId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
            disabled={!stage || stage.steps.length === 0}
          >
            {stage?.steps.length ? (
              stage.steps.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))
            ) : (
              <option value="">— No steps in this stage —</option>
            )}
          </select>
        </div>
      </div>
    </ModalShell>
  );
}
