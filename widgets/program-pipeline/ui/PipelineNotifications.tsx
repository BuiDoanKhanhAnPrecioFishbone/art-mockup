"use client";

import { useMemo } from "react";
import { Bell, Clock, Mail, Send, X, Wrench } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { Candidate } from "@/entities/candidate";
import type { WorkflowStage } from "@/entities/program";

export type NotificationKind = "test-setup" | "pending-email";

export interface PipelineNotification {
  key: string;
  kind: NotificationKind;
  stageName: string;
  stepName: string;
  candidates: Candidate[];
}

/** Compute notification cards from current candidate + workflow state.
 *  Group on-going candidates by current step:
 *   - test step + assigned tests → Test Setup card
 *   - pendingEmailCount > 0      → Pending Email card
 *  Multiple candidates in the same step collapse into a bulk card. */
export function computeNotifications(
  candidates: Candidate[],
  stages: WorkflowStage[]
): PipelineNotification[] {
  const stepIndex = new Map<
    string,
    { stage: WorkflowStage; step: WorkflowStage["steps"][number] }
  >();
  for (const stage of stages)
    for (const step of stage.steps) stepIndex.set(step.id, { stage, step });

  const byStep = new Map<string, Candidate[]>();
  for (const c of candidates) {
    if (c.status !== "on-going") continue;
    const arr = byStep.get(c.currentStepId) ?? [];
    arr.push(c);
    byStep.set(c.currentStepId, arr);
  }

  const out: PipelineNotification[] = [];
  for (const [stepId, group] of byStep) {
    const ref = stepIndex.get(stepId);
    if (!ref) continue;
    const { stage, step } = ref;

    if (step.type === "test" && (step.testIds?.length ?? 0) > 0) {
      out.push({
        key: `test-setup:${stepId}`,
        kind: "test-setup",
        stageName: stage.name,
        stepName: step.name,
        candidates: group,
      });
    }

    const withEmail = group.filter((c) => c.pendingEmailCount > 0);
    if (withEmail.length > 0) {
      out.push({
        key: `pending-email:${stepId}`,
        kind: "pending-email",
        stageName: stage.name,
        stepName: step.name,
        candidates: withEmail,
      });
    }
  }

  // Show pending-email first (more urgent), then test-setup.
  out.sort((a, b) => {
    if (a.kind === b.kind) return a.stepName.localeCompare(b.stepName);
    return a.kind === "pending-email" ? -1 : 1;
  });

  return out;
}

export function PipelineNotifications({
  notifications,
  onSetupTest,
  onReviewSend,
  onSnooze,
  onDismiss,
}: {
  notifications: PipelineNotification[];
  onSetupTest: (n: PipelineNotification) => void;
  onReviewSend: (n: PipelineNotification) => void;
  onSnooze: (n: PipelineNotification) => void;
  onDismiss: (n: PipelineNotification) => void;
}) {
  const visible = useMemo(() => notifications.slice(0, 4), [notifications]);
  if (visible.length === 0) return null;

  return (
    <aside
      aria-label="Pipeline notifications"
      className="pointer-events-none fixed bottom-4 right-4 z-30 flex w-[340px] flex-col gap-2"
    >
      {notifications.length > 4 && (
        <div className="pointer-events-auto self-end rounded-full bg-violet-600 px-2.5 py-1 text-[10px] font-semibold text-white shadow">
          +{notifications.length - 4} more
        </div>
      )}
      {visible.map((n) => (
        <NotificationCard
          key={n.key}
          n={n}
          onSetupTest={() => onSetupTest(n)}
          onReviewSend={() => onReviewSend(n)}
          onSnooze={() => onSnooze(n)}
          onDismiss={() => onDismiss(n)}
        />
      ))}
    </aside>
  );
}

function NotificationCard({
  n,
  onSetupTest,
  onReviewSend,
  onSnooze,
  onDismiss,
}: {
  n: PipelineNotification;
  onSetupTest: () => void;
  onReviewSend: () => void;
  onSnooze: () => void;
  onDismiss: () => void;
}) {
  const isBulk = n.candidates.length > 1;
  const isTest = n.kind === "test-setup";
  const tone = isTest
    ? { ring: "ring-amber-200", icon: "text-amber-600", bg: "bg-amber-50" }
    : { ring: "ring-violet-200", icon: "text-violet-600", bg: "bg-violet-50" };

  const title = isTest
    ? isBulk
      ? `Test setup required (${n.candidates.length})`
      : "Test setup required"
    : isBulk
      ? `Bulk email pending (${n.candidates.length})`
      : "Pending email";

  const summary = isBulk
    ? `${n.candidates.length} candidates in ${n.stageName} → ${n.stepName}`
    : `${n.candidates[0]?.name} · ${n.stageName} → ${n.stepName}`;

  return (
    <div
      className={cn(
        "pointer-events-auto rounded-xl border border-gray-200 bg-white shadow-lg ring-1",
        tone.ring
      )}
    >
      <div className="flex items-start gap-3 p-3">
        <span
          className={cn(
            "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            tone.bg,
            tone.icon
          )}
        >
          {isTest ? <Wrench size={16} /> : <Mail size={16} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Bell size={11} className="text-gray-400" />
            <p className="text-xs font-semibold text-gray-900">{title}</p>
          </div>
          <p className="mt-0.5 truncate text-[11px] text-gray-500">{summary}</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-300 hover:text-gray-600"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
      <div className="flex items-center gap-1.5 border-t border-gray-100 px-3 py-2">
        {isTest ? (
          <button
            onClick={onSetupTest}
            className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-amber-600"
          >
            <Wrench size={11} />
            Setup now{isBulk ? ` (${n.candidates.length})` : ""}
          </button>
        ) : (
          <button
            onClick={onReviewSend}
            className="inline-flex items-center gap-1 rounded-md bg-violet-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-violet-700"
          >
            <Send size={11} />
            Review &amp; send{isBulk ? ` (${n.candidates.length})` : ""}
          </button>
        )}
        <button
          onClick={onSnooze}
          className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50"
        >
          <Clock size={11} />
          Snooze 1h
        </button>
        <button
          onClick={onDismiss}
          className="rounded-md px-2 py-1 text-[11px] font-medium text-gray-500 hover:bg-gray-100"
        >
          Remind later
        </button>
      </div>
    </div>
  );
}
