"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronRight,
  Copy,
  Download,
  LayoutGrid,
  Mail,
  MoreVertical,
  Plus,
  Search,
  StickyNote,
  Trash2,
  User,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import {
  AppliedFilterChips,
  FilterButton,
  FilterModal,
  countActiveFilters,
  isFieldActive,
  type FilterField,
  type FilterValues,
} from "@/shared/ui/filter";
import { useToast } from "@/shared/ui/toast";
import {
  getLastVisit,
  markProgramVisited,
  markReviewed,
  useReviewedSet,
} from "@/shared/lib/reviewed-applicants";
import type { Candidate, CandidateStatus } from "@/entities/candidate";
import type { Program, WorkflowStage } from "@/entities/program";
import {
  GroupLabelBadge,
  ReviewerStack,
  SkillsBadge,
  StatusBadge,
} from "./pieces";
// Reuse the richer CV-tracking Add Candidate modal + menu here so both
// tabs go through the same upload-and-parse flow. The CV record is
// auto-deleted by the /promote endpoint once the candidate is created.
import { AddCandidateModal } from "@/widgets/program-cv-tracking/ui/AddCandidateModal";
import { AddCandidateMenu } from "@/widgets/program-cv-tracking/ui/AddCandidateMenu";
import { BulkUploadModal } from "@/widgets/program-cv-tracking/ui/BulkUploadModal";
import { MoveToStepModal } from "./MoveToStepModal";
import { ChangeStatusModal } from "./ChangeStatusModal";
import { CandidateDetailPanel } from "./CandidateDetailPanel";
import {
  PipelineNotifications,
  computeNotifications,
  type PipelineNotification,
} from "./PipelineNotifications";

interface PipelineTabProps {
  program: Program;
}

type ViewMode = "grid" | "kanban";

type ModalState =
  | { kind: "none" }
  | { kind: "add" }
  | { kind: "bulk-upload" }
  | { kind: "move"; candidate: Candidate }
  | { kind: "status"; candidate: Candidate }
  | { kind: "delete"; candidate: Candidate };

export function PipelineTab({ program }: PipelineTabProps) {
  const stages: WorkflowStage[] = program.workflow?.stages ?? [];
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("grid");
  const [activeStageId, setActiveStageId] = useState<string | "all">("all");
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [modal, setModal] = useState<ModalState>({ kind: "none" });
  const [detailId, setDetailId] = useState<string | null>(null);
  const [dismissedKeys, setDismissedKeys] = useState<Set<string>>(new Set());
  const reviewedSet = useReviewedSet();
  // Snapshot the last-visit timestamp BEFORE we stamp this open as a
  // visit. Used to distinguish "arrived after my last visit" (NEW) from
  // "still on my desk from a previous session" (UNREVIEWED). 48h-ago
  // fallback for first-ever users so the demo opens with NEW pills on
  // the seeded recent arrivals.
  const [previousVisitMs] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const iso = getLastVisit(program.id);
    if (iso) {
      const t = Date.parse(iso);
      if (!Number.isNaN(t)) return t;
    }
    return Date.now() - 48 * 60 * 60 * 1000;
  });
  const { showToast } = useToast();

  function refresh(opts?: { silent?: boolean }) {
    if (!opts?.silent) setLoading(true);
    return fetch(`/api/candidates?programId=${encodeURIComponent(program.id)}`)
      .then((r) => r.json())
      .then((d) => {
        setCandidates(d.candidates ?? []);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    void refresh();
    // Stamp this program as "visited" — clears the +N NEW badge on the
    // program card. Pipeline-row highlights persist independently.
    markProgramVisited(program.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program.id]);

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        id: "status",
        label: "Status",
        kind: "multi-select",
        options: [
          { value: "on-going", label: "On-going" },
          { value: "hired", label: "Hired" },
          { value: "rejected", label: "Rejected" },
        ],
      },
      {
        id: "groupLabel",
        label: "Group Label",
        kind: "multi-select",
        options: [
          { value: "high-priority", label: "High-priority" },
          { value: "mid-priority", label: "Mid-priority" },
          { value: "low-priority", label: "Low-priority" },
        ],
      },
      {
        id: "matchRange",
        label: "Skills Match",
        kind: "range",
        min: 0,
        max: 100,
        unit: "%",
      },
    ],
    []
  );

  function matchesFilters(c: Candidate): boolean {
    for (const f of filterFields) {
      const v = filterValues[f.id];
      if (!isFieldActive(v)) continue;
      if (v?.kind === "multi-select") {
        if (f.id === "status" && !v.values.includes(c.status)) return false;
        if (f.id === "groupLabel") {
          if (!c.groupLabel || !v.values.includes(c.groupLabel)) return false;
        }
      }
      if (v?.kind === "range") {
        if (
          (v.operator === "between" || v.operator === "gt") &&
          v.min !== undefined &&
          c.skillsMatchPercent < v.min
        )
          return false;
        if (
          (v.operator === "between" || v.operator === "lt") &&
          v.max !== undefined &&
          c.skillsMatchPercent > v.max
        )
          return false;
      }
    }
    return true;
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return candidates.filter((c) => {
      if (activeStageId !== "all" && c.currentStageId !== activeStageId)
        return false;
      if (
        q &&
        !c.name.toLowerCase().includes(q) &&
        !c.email.toLowerCase().includes(q)
      )
        return false;
      return matchesFilters(c);
    });
  }, [candidates, activeStageId, search, filterValues]);

  const countByStage = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of candidates) {
      const q = search.trim().toLowerCase();
      if (q && !c.name.toLowerCase().includes(q) && !c.email.toLowerCase().includes(q))
        continue;
      if (!matchesFilters(c)) continue;
      map.set(c.currentStageId, (map.get(c.currentStageId) ?? 0) + 1);
    }
    return map;
  }, [candidates, search, filterValues]);

  const totalFiltered = useMemo(
    () => Array.from(countByStage.values()).reduce((a, b) => a + b, 0),
    [countByStage]
  );

  const notifications = useMemo(() => {
    return computeNotifications(candidates, stages).filter(
      (n) => !dismissedKeys.has(n.key)
    );
  }, [candidates, stages, dismissedKeys]);

  const detailCandidate = detailId
    ? candidates.find((c) => c.id === detailId) ?? null
    : null;

  function clearFilter(id: string) {
    setFilterValues((p) => {
      const n = { ...p };
      delete n[id];
      return n;
    });
  }

  /* -------------------- Mutations -------------------- */

  async function patchCandidate(id: string, patch: Partial<Candidate>) {
    const res = await fetch(`/api/candidates/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      showToast("error", "Could not save candidate change.");
      return null;
    }
    const { candidate } = (await res.json()) as { candidate: Candidate };
    setCandidates((prev) => prev.map((c) => (c.id === candidate.id ? candidate : c)));
    return candidate;
  }

  async function handleMove(stageId: string, stepId: string) {
    if (modal.kind !== "move") return;
    const c = modal.candidate;
    // Action = implicit review.
    markReviewed(c.id);
    const updated = await patchCandidate(c.id, {
      currentStageId: stageId,
      currentStepId: stepId,
    });
    if (updated) {
      const stage = stages.find((s) => s.id === stageId);
      const step = stage?.steps.find((s) => s.id === stepId);
      showToast("success", `${updated.name} moved to ${stage?.name} → ${step?.name}.`);
    }
    setModal({ kind: "none" });
  }

  async function handleChangeStatus(
    status: CandidateStatus,
    result?: string
  ) {
    if (modal.kind !== "status") return;
    const c = modal.candidate;
    markReviewed(c.id);
    const patch: Partial<Candidate> = { status, stepResult: result };

    // If moving to a final outcome, also park the candidate at the matching
    // Final Decisions step when one exists in the workflow.
    if (status === "hired" || status === "rejected") {
      const finalStage =
        stages.find((s) => s.name.toLowerCase().includes("final")) ?? null;
      if (finalStage) {
        const stepName = status === "hired" ? "hired" : "rejected";
        const targetStep = finalStage.steps.find((s) =>
          s.name.toLowerCase().includes(stepName)
        );
        if (targetStep) {
          patch.currentStageId = finalStage.id;
          patch.currentStepId = targetStep.id;
        }
      }
    }

    const updated = await patchCandidate(c.id, patch);
    if (updated)
      showToast("success", `${updated.name} marked as ${updated.status}.`);
    setModal({ kind: "none" });
  }

  async function handleDelete() {
    if (modal.kind !== "delete") return;
    const c = modal.candidate;
    const res = await fetch(`/api/candidates/${c.id}`, { method: "DELETE" });
    if (!res.ok) {
      showToast("error", "Could not delete candidate.");
      return;
    }
    setCandidates((prev) => prev.filter((x) => x.id !== c.id));
    if (detailId === c.id) setDetailId(null);
    setModal({ kind: "none" });
    showToast("success", `${c.name} removed from pipeline.`);
  }

  async function handleDownloadCV(c: Candidate) {
    showToast("success", `Downloading ${c.name.replace(/\s+/g, "_")}_CV.pdf …`);
  }

  /* -------------------- Notification handlers -------------------- */

  /** Record that the recruiter has actioned (candidate, step) so a later
   *  re-entry of the same step won't re-fire the notification. */
  function withStepActioned(c: Candidate): Partial<Candidate> {
    const stepId = c.currentStepId;
    const prev = c.actionedStepIds ?? [];
    if (prev.includes(stepId)) return {};
    return { actionedStepIds: [...prev, stepId] };
  }

  async function handleReviewSend(n: PipelineNotification) {
    // "Sending" the queued emails — decrement pendingEmailCount on each
    // AND mark the (candidate, step) as actioned so re-entry doesn't
    // surface another Pending Email notification. Email sent = clearly
    // reviewed, so also drain the unread state.
    markReviewed(n.candidates.map((c) => c.id));
    const updates = await Promise.all(
      n.candidates.map((c) =>
        patchCandidate(c.id, {
          pendingEmailCount: Math.max(0, c.pendingEmailCount - 1),
          ...withStepActioned(c),
        })
      )
    );
    const sent = updates.filter(Boolean).length;
    if (sent > 0)
      showToast(
        "success",
        sent === 1
          ? `Email sent to ${n.candidates[0].name}.`
          : `${sent} emails sent for ${n.stepName}.`
      );
    setDismissedKeys((prev) => {
      const next = new Set(prev);
      next.add(n.key);
      return next;
    });
  }

  async function handleSetupTest(n: PipelineNotification) {
    // Mark every candidate in this group as actioned for the current
    // step so the Test Setup notification doesn't re-fire if HR moves
    // them out and back later.
    await Promise.all(
      n.candidates.map((c) => {
        const patch = withStepActioned(c);
        return Object.keys(patch).length > 0
          ? patchCandidate(c.id, patch)
          : Promise.resolve(null);
      })
    );
    showToast(
      "success",
      n.candidates.length === 1
        ? `Test setup wizard for ${n.candidates[0].name} (mock).`
        : `Bulk test setup for ${n.candidates.length} candidates (mock).`
    );
    setDismissedKeys((prev) => {
      const next = new Set(prev);
      next.add(n.key);
      return next;
    });
  }

  function handleSnooze(n: PipelineNotification) {
    setDismissedKeys((prev) => {
      const next = new Set(prev);
      next.add(n.key);
      return next;
    });
    showToast("success", "Snoozed for 1 hour.");
  }

  function handleDismiss(n: PipelineNotification) {
    setDismissedKeys((prev) => {
      const next = new Set(prev);
      next.add(n.key);
      return next;
    });
  }

  /* -------------------- Render -------------------- */

  return (
    <div className="space-y-4">
      <StageChevronBar
        stages={stages}
        countByStage={countByStage}
        totalAll={totalFiltered}
        active={activeStageId}
        onChange={setActiveStageId}
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email…"
            className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm focus:border-violet-500 focus:outline-none"
          />
        </div>
        <FilterButton
          activeCount={countActiveFilters(filterValues)}
          onClick={() => setFilterOpen(true)}
        />
        {(() => {
          const pending = filtered.filter((c) => !reviewedSet.has(c.id));
          if (pending.length === 0) return null;
          return (
            <button
              onClick={() => {
                markReviewed(pending.map((c) => c.id));
                showToast(
                  "success",
                  `Marked ${pending.length} applicant${
                    pending.length === 1 ? "" : "s"
                  } as reviewed.`
                );
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-medium text-violet-700 hover:bg-violet-100"
              title="Drain the inbox — every visible NEW + UNREVIEWED highlight clears"
            >
              Mark {pending.length} as reviewed
            </button>
          );
        })()}
        <ViewToggle value={view} onChange={setView} />
        <AddCandidateMenu
          disabled={stages.length === 0}
          title={
            stages.length === 0
              ? "Configure a workflow before adding candidates."
              : undefined
          }
          onSingle={() => setModal({ kind: "add" })}
          onBulk={() => setModal({ kind: "bulk-upload" })}
        />
      </div>

      {countActiveFilters(filterValues) > 0 && (
        <AppliedFilterChips
          fields={filterFields}
          values={filterValues}
          onRemove={clearFilter}
          onClearAll={() => setFilterValues({})}
        />
      )}

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-400">
          Loading candidates…
        </div>
      ) : stages.length === 0 ? (
        <EmptyState
          title="No workflow yet"
          message="Configure stages and steps in Settings → Workflow before adding candidates."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No candidates match"
          message={
            candidates.length === 0
              ? "Add the first candidate with the button above, or import them from the public form."
              : "Try a different stage, clearing filters, or a broader search."
          }
        />
      ) : view === "grid" ? (
        <CandidateGridView
          candidates={filtered}
          stages={stages}
          isFinalStage={isFinalStageId}
          reviewedSet={reviewedSet}
          previousVisitMs={previousVisitMs}
          onAction={(c, action) => runAction(c, action)}
        />
      ) : (
        <CandidateKanbanView
          candidates={filtered}
          stages={stages}
          reviewedSet={reviewedSet}
          previousVisitMs={previousVisitMs}
          onAction={(c, action) => runAction(c, action)}
          onMoveToStep={async (candidate, stageId, stepId) => {
            // Drag-drop = implicit review.
            markReviewed(candidate.id);
            const updated = await patchCandidate(candidate.id, {
              currentStageId: stageId,
              currentStepId: stepId,
            });
            if (updated) {
              const stage = stages.find((s) => s.id === stageId);
              const step = stage?.steps.find((s) => s.id === stepId);
              showToast(
                "success",
                `${updated.name} moved to ${stage?.name} → ${step?.name}.`
              );
            }
          }}
        />
      )}

      <FilterModal
        open={filterOpen}
        fields={filterFields}
        initialValues={filterValues}
        onApply={(v) => {
          setFilterValues(v);
          setFilterOpen(false);
        }}
        onCancel={() => setFilterOpen(false)}
      />

      {/* Modals */}
      {modal.kind === "add" && (
        <AddCandidateModal
          program={program}
          onClose={() => setModal({ kind: "none" })}
          onPromoted={() => {
            setModal({ kind: "none" });
            void refresh({ silent: true });
            showToast(
              "success",
              "Candidate added — moved to the Pipeline."
            );
          }}
        />
      )}
      {modal.kind === "bulk-upload" && (
        <BulkUploadModal
          program={program}
          onClose={() => setModal({ kind: "none" })}
          onCompleted={(n) =>
            showToast(
              "success",
              `${n} CV${n > 1 ? "s" : ""} uploaded — review them in the CVs Tracking tab.`
            )
          }
        />
      )}
      {modal.kind === "move" && (
        <MoveToStepModal
          stages={stages}
          candidateName={modal.candidate.name}
          currentStageId={modal.candidate.currentStageId}
          currentStepId={modal.candidate.currentStepId}
          onClose={() => setModal({ kind: "none" })}
          onConfirm={handleMove}
        />
      )}
      {modal.kind === "status" && (
        <ChangeStatusModal
          candidateName={modal.candidate.name}
          currentStatus={modal.candidate.status}
          currentResult={modal.candidate.stepResult}
          onClose={() => setModal({ kind: "none" })}
          onConfirm={handleChangeStatus}
        />
      )}
      {modal.kind === "delete" && (
        <ConfirmDelete
          candidateName={modal.candidate.name}
          onCancel={() => setModal({ kind: "none" })}
          onConfirm={handleDelete}
        />
      )}

      {/* Side panel */}
      {detailCandidate && (
        <CandidateDetailPanel
          candidate={detailCandidate}
          stages={stages}
          onClose={() => setDetailId(null)}
          onMove={() => setModal({ kind: "move", candidate: detailCandidate })}
          onChangeStatus={() =>
            setModal({ kind: "status", candidate: detailCandidate })
          }
          onDownloadCV={() => handleDownloadCV(detailCandidate)}
          onDelete={() => setModal({ kind: "delete", candidate: detailCandidate })}
        />
      )}

      {/* Notification dock */}
      <PipelineNotifications
        notifications={notifications}
        onSetupTest={handleSetupTest}
        onReviewSend={handleReviewSend}
        onSnooze={handleSnooze}
        onDismiss={handleDismiss}
      />
    </div>
  );

  function runAction(c: Candidate, action: ActionKind) {
    switch (action) {
      case "view":
        // Opening the detail panel = the recruiter has actually
        // reviewed this candidate, so drain the unread state.
        markReviewed(c.id);
        setDetailId(c.id);
        return;
      case "move":
        setModal({ kind: "move", candidate: c });
        return;
      case "status":
        setModal({ kind: "status", candidate: c });
        return;
      case "download":
        handleDownloadCV(c);
        return;
      case "delete":
        setModal({ kind: "delete", candidate: c });
        return;
    }
  }
}

function isFinalStageId(stage: WorkflowStage): boolean {
  return stage.name.toLowerCase().includes("final");
}

/* ============================================================
 * Stage chevron bar
 * ============================================================ */

function StageChevronBar({
  stages,
  countByStage,
  totalAll,
  active,
  onChange,
}: {
  stages: WorkflowStage[];
  countByStage: Map<string, number>;
  totalAll: number;
  active: string | "all";
  onChange: (id: string | "all") => void;
}) {
  return (
    <div className="flex items-stretch overflow-x-auto rounded-lg border border-gray-200 bg-white p-1">
      <Chevron
        label="All Stages"
        count={totalAll}
        active={active === "all"}
        onClick={() => onChange("all")}
        first
      />
      {stages.map((s, i) => (
        <Chevron
          key={s.id}
          label={s.name}
          count={countByStage.get(s.id) ?? 0}
          active={active === s.id}
          onClick={() => onChange(s.id)}
          last={i === stages.length - 1}
        />
      ))}
    </div>
  );
}

function Chevron({
  label,
  count,
  active,
  onClick,
  first,
  last,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  first?: boolean;
  last?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex shrink-0 items-center gap-1.5 px-5 py-2 text-xs font-medium transition-colors",
        !first && "pl-7",
        !last && "pr-7",
        active
          ? "bg-violet-600 text-white"
          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
      )}
      style={{ clipPath: chevronClip(first, last) }}
    >
      {label}
      {count > 0 && (
        <span
          className={cn(
            "rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
            active ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function chevronClip(first?: boolean, last?: boolean): string {
  const leftIn = first ? "0% 0" : "12px 0";
  const leftOut = first ? "0% 100%" : "12px 100%";
  const rightIn = last ? "100% 100%" : "calc(100% - 12px) 100%";
  const rightOut = last ? "100% 0" : "calc(100% - 12px) 0";
  const arrowOut = last ? "" : ", 100% 50%";
  const arrowIn = first ? "" : ", 0% 50%";
  return `polygon(${leftIn}, ${rightOut}${arrowOut}, ${rightIn}, ${leftOut}${arrowIn})`;
}

/* ============================================================
 * View toggle
 * ============================================================ */

function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <div className="inline-flex rounded-md border border-gray-300 bg-white p-0.5">
      <button
        type="button"
        onClick={() => onChange("grid")}
        className={cn(
          "flex items-center gap-1 rounded px-3 py-1 text-xs font-medium transition-colors",
          value === "grid"
            ? "bg-violet-600 text-white"
            : "text-gray-600 hover:text-gray-800"
        )}
      >
        Grid
      </button>
      <button
        type="button"
        onClick={() => onChange("kanban")}
        className={cn(
          "flex items-center gap-1 rounded px-3 py-1 text-xs font-medium transition-colors",
          value === "kanban"
            ? "bg-violet-600 text-white"
            : "text-gray-600 hover:text-gray-800"
        )}
      >
        <LayoutGrid size={12} />
        Kanban
      </button>
    </div>
  );
}

/* ============================================================
 * Grid view
 * ============================================================ */

type ActionKind = "view" | "move" | "status" | "download" | "delete";

type InboxKind = null | "new" | "unreviewed";

function inboxKind(
  c: Candidate,
  reviewedSet: Set<string>,
  previousVisitMs: number
): InboxKind {
  if (reviewedSet.has(c.id)) return null;
  const t = c.addedAtISO ? Date.parse(c.addedAtISO) : NaN;
  if (Number.isNaN(t)) return "unreviewed";
  return t > previousVisitMs ? "new" : "unreviewed";
}

function CandidateGridView({
  candidates,
  stages,
  isFinalStage,
  reviewedSet,
  previousVisitMs,
  onAction,
}: {
  candidates: Candidate[];
  stages: WorkflowStage[];
  isFinalStage: (s: WorkflowStage) => boolean;
  reviewedSet: Set<string>;
  previousVisitMs: number;
  onAction: (c: Candidate, action: ActionKind) => void;
}) {
  const stageById = useMemo(
    () => new Map(stages.map((s) => [s.id, s])),
    [stages]
  );
  const showStepResult = candidates.some((c) => {
    const s = stageById.get(c.currentStageId);
    return s && isFinalStage(s);
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          <tr>
            <th className="w-10 p-3">
              <input type="checkbox" className="accent-violet-600" disabled />
            </th>
            <th className="p-3">Name &amp; Contact Information</th>
            <th className="p-3">Status</th>
            <th className="p-3">Skills</th>
            <th className="p-3">Group Label</th>
            <th className="p-3">Booked Date</th>
            {showStepResult && <th className="p-3">Step Result</th>}
            <th className="p-3">Stage - Step</th>
            <th className="p-3">Reviewers</th>
            <th className="w-12 p-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((c) => {
            const stage = stageById.get(c.currentStageId);
            const step = stage?.steps.find((s) => s.id === c.currentStepId);
            const kind = inboxKind(c, reviewedSet, previousVisitMs);
            return (
              <tr
                key={c.id}
                className={cn(
                  "cursor-pointer border-t border-gray-100 align-top hover:bg-gray-50/60",
                  kind === "new" && "bg-rose-50/50 hover:bg-rose-50",
                  kind === "unreviewed" && "bg-amber-50/50 hover:bg-amber-50"
                )}
                onClick={() => onAction(c, "view")}
              >
                <td className="p-3" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" className="accent-violet-600" />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1.5">
                    <p className="font-medium text-gray-900">{c.name}</p>
                    <InboxPill kind={kind} />
                  </div>
                  <p className="text-xs text-gray-500">{c.email}</p>
                </td>
                <td className="p-3">
                  <StatusBadge status={c.status} />
                </td>
                <td className="p-3">
                  <SkillsBadge percent={c.skillsMatchPercent} />
                </td>
                <td className="p-3">
                  {c.groupLabel ? (
                    <GroupLabelBadge label={c.groupLabel} />
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
                <td className="p-3 text-xs text-gray-700">
                  {c.bookedDateISO ? (
                    <span>
                      {c.bookedTime}, {c.bookedDateISO}
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                {showStepResult && (
                  <td className="p-3 text-xs text-gray-700">
                    {c.stepResult ?? <span className="text-gray-300">—</span>}
                  </td>
                )}
                <td className="p-3 text-xs">
                  <p className="font-medium text-gray-800">{stage?.name}</p>
                  <p className="text-gray-500">{step?.name}</p>
                </td>
                <td className="p-3">
                  <ReviewerStack reviewerIds={c.reviewerIds} />
                  {(c.pendingEmailCount > 0 || c.hasNote) && (
                    <div className="mt-1 flex items-center gap-2">
                      {c.hasNote && (
                        <StickyNote size={12} className="text-amber-500" />
                      )}
                      {c.pendingEmailCount > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-[11px] text-violet-700">
                          <Mail size={11} />
                          {c.pendingEmailCount}
                        </span>
                      )}
                    </div>
                  )}
                </td>
                <td className="p-3" onClick={(e) => e.stopPropagation()}>
                  <ActionMenu candidate={c} onAction={onAction} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ============================================================
 * Kanban view
 * ============================================================ */

/** Drag MIME used by the kanban board. Including the mime in dataTransfer
 *  lets us check `isOurDrag()` during dragover (the actual payload isn't
 *  readable until drop, per the HTML drag-drop spec). */
const KANBAN_DRAG_MIME = "application/x-art-mockup-pipeline-card";

function CandidateKanbanView({
  candidates,
  stages,
  reviewedSet,
  previousVisitMs,
  onAction,
  onMoveToStep,
}: {
  candidates: Candidate[];
  stages: WorkflowStage[];
  reviewedSet: Set<string>;
  previousVisitMs: number;
  onAction: (c: Candidate, action: ActionKind) => void;
  onMoveToStep: (
    candidate: Candidate,
    stageId: string,
    stepId: string
  ) => void;
}) {
  // Flatten stages → step columns. Each column tracks its parent stage
  // so the drop handler can patch both ids in one go.
  const columns = useMemo(
    () =>
      stages.flatMap((stage) =>
        stage.steps.map((step) => ({
          key: `${stage.id}:${step.id}`,
          stage,
          step,
        }))
      ),
    [stages]
  );

  // Currently-dragged candidate id (for visual de-emphasis on the source).
  const [draggingId, setDraggingId] = useState<string | null>(null);
  // Column key currently hovered by an in-flight drag (for highlight).
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  // Candidate id we'd insert *before* when the user drops right now.
  const [insertBeforeId, setInsertBeforeId] = useState<string | null>(null);
  // Client-side ordering — kept in component state so users can rearrange
  // within a step. Maps candidate id → an ordering key. Lower = earlier.
  const [order, setOrder] = useState<Record<string, number>>({});

  // Reconcile the order map whenever the candidate list changes — give any
  // newly-arriving candidate the next-largest key so they land at the end.
  useEffect(() => {
    setOrder((prev) => {
      const next = { ...prev };
      let max = -1;
      for (const v of Object.values(next)) if (v > max) max = v;
      let changed = false;
      for (const c of candidates) {
        if (next[c.id] === undefined) {
          max += 1;
          next[c.id] = max;
          changed = true;
        }
      }
      // Drop entries for candidates that no longer exist.
      const live = new Set(candidates.map((c) => c.id));
      for (const id of Object.keys(next)) {
        if (!live.has(id)) {
          delete next[id];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [candidates]);

  const byColumn = useMemo(() => {
    const map = new Map<string, Candidate[]>();
    for (const col of columns) map.set(col.key, []);
    for (const c of candidates) {
      const k = `${c.currentStageId}:${c.currentStepId}`;
      const arr = map.get(k);
      if (arr) arr.push(c);
    }
    // Sort each column's candidates by the local order key (defaulting
    // to a large number for any not yet in the map).
    for (const arr of map.values()) {
      arr.sort(
        (a, b) =>
          (order[a.id] ?? Number.MAX_SAFE_INTEGER) -
          (order[b.id] ?? Number.MAX_SAFE_INTEGER)
      );
    }
    return map;
  }, [candidates, columns, order]);

  /** Move `draggedId` to immediately before `targetId` in the order map.
   *  Both ids must end up adjacent — we simply rewrite the entire map for
   *  the candidates that share the target's column so their order keys
   *  stay simple integers. */
  function reorderBefore(draggedId: string, targetId: string) {
    if (draggedId === targetId) return;
    const target = candidates.find((c) => c.id === targetId);
    if (!target) return;
    const colKey = `${target.currentStageId}:${target.currentStepId}`;
    const colCandidates = candidates.filter(
      (c) => `${c.currentStageId}:${c.currentStepId}` === colKey
    );
    // Build the new order list for this column: existing column members
    // sorted by current order, with `draggedId` (if it isn't already in
    // the column) inserted right before `targetId`.
    const sorted = colCandidates
      .filter((c) => c.id !== draggedId)
      .sort(
        (a, b) =>
          (order[a.id] ?? Number.MAX_SAFE_INTEGER) -
          (order[b.id] ?? Number.MAX_SAFE_INTEGER)
      )
      .map((c) => c.id);
    const targetIdx = sorted.indexOf(targetId);
    if (targetIdx === -1) return;
    sorted.splice(targetIdx, 0, draggedId);

    setOrder((prev) => {
      const next = { ...prev };
      // Renumber the column with sequential ints starting from the
      // smallest existing order in that column (preserves relative
      // positions vs other columns).
      const baseline =
        Math.min(
          ...sorted
            .map((id) => prev[id])
            .filter((v): v is number => typeof v === "number")
        ) || 0;
      sorted.forEach((id, i) => {
        next[id] = baseline + i;
      });
      return next;
    });
  }

  /** Append `draggedId` to the end of the column it's dropping into. */
  function reorderToEnd(draggedId: string, columnKey: string) {
    setOrder((prev) => {
      const colCandidates = candidates.filter(
        (c) =>
          `${c.currentStageId}:${c.currentStepId}` === columnKey &&
          c.id !== draggedId
      );
      const max =
        colCandidates.reduce(
          (acc, c) => Math.max(acc, prev[c.id] ?? 0),
          0
        ) + 1;
      return { ...prev, [draggedId]: max };
    });
  }

  function onCardDragStart(e: React.DragEvent, c: Candidate) {
    // Set BOTH mimes — text/plain is mandatory for Firefox to actually
    // start a drag, and the custom mime is what we read back on drop.
    e.dataTransfer.setData(KANBAN_DRAG_MIME, c.id);
    e.dataTransfer.setData("text/plain", c.id);
    e.dataTransfer.effectAllowed = "move";
    setDraggingId(c.id);
  }
  function onCardDragEnd() {
    setDraggingId(null);
    setHoverKey(null);
  }

  function onColumnDragOver(e: React.DragEvent, key: string) {
    // Always preventDefault during a drag so drop fires reliably. We
    // can't read the custom mime here in Safari/Firefox (the spec hides
    // the data during dragover for security), so we filter at drop time
    // by checking we actually have a candidate id in the payload.
    if (!draggingId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setHoverKey(key);
    // Hovering empty space inside the column = drop at the end.
    setInsertBeforeId(null);
  }
  function onColumnDragLeave() {
    setHoverKey(null);
  }
  function onColumnDrop(
    e: React.DragEvent,
    stageId: string,
    stepId: string
  ) {
    e.preventDefault();
    setHoverKey(null);
    setInsertBeforeId(null);
    // Try our custom mime first, fall back to text/plain (which we also
    // populate with the candidate id).
    const id =
      e.dataTransfer.getData(KANBAN_DRAG_MIME) ||
      e.dataTransfer.getData("text/plain");
    setDraggingId(null);
    if (!id) return;
    const candidate = candidates.find((c) => c.id === id);
    if (!candidate) return;
    const colKey = `${stageId}:${stepId}`;
    const sameColumn =
      candidate.currentStageId === stageId &&
      candidate.currentStepId === stepId;
    if (!sameColumn) {
      // Cross-column drop — patch the candidate AND park them at the end
      // of the destination column locally.
      onMoveToStep(candidate, stageId, stepId);
    }
    reorderToEnd(id, colKey);
  }

  /** Drop directly on another card → insert dragged candidate before it.
   *  Bubbling is stopped so the column's own onDrop doesn't also fire. */
  function onCardDragOver(e: React.DragEvent, target: Candidate) {
    if (!draggingId || draggingId === target.id) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setHoverKey(`${target.currentStageId}:${target.currentStepId}`);
    setInsertBeforeId(target.id);
  }

  function onCardDrop(e: React.DragEvent, target: Candidate) {
    e.preventDefault();
    e.stopPropagation();
    const id =
      e.dataTransfer.getData(KANBAN_DRAG_MIME) ||
      e.dataTransfer.getData("text/plain");
    setHoverKey(null);
    setInsertBeforeId(null);
    setDraggingId(null);
    if (!id || id === target.id) return;
    const dragged = candidates.find((c) => c.id === id);
    if (!dragged) return;
    const sameColumn =
      dragged.currentStageId === target.currentStageId &&
      dragged.currentStepId === target.currentStepId;
    if (!sameColumn) {
      // Cross-column drop on a card — also moves the candidate to that
      // step, then positions them just above the target.
      onMoveToStep(dragged, target.currentStageId, target.currentStepId);
    }
    reorderBefore(id, target.id);
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {columns.map(({ key, stage, step }) => {
        const cs = byColumn.get(key) ?? [];
        const isHover = hoverKey === key;
        return (
          <div
            key={key}
            onDragOver={(e) => onColumnDragOver(e, key)}
            onDragLeave={onColumnDragLeave}
            onDrop={(e) => onColumnDrop(e, stage.id, step.id)}
            className={cn(
              "flex w-72 shrink-0 flex-col rounded-xl border bg-gray-50 transition-colors",
              isHover
                ? "border-violet-400 bg-violet-50/70 ring-2 ring-violet-300"
                : "border-gray-200"
            )}
          >
            <div className="border-b border-gray-200 bg-white px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                {stage.name}
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                <span className="text-sm font-semibold text-gray-900">
                  {step.name}
                </span>
                <StepSetupBadges step={step} />
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700">
                  {cs.length}
                </span>
                {/* Manual-review marker for plain default steps so the
                 *  column has a hint even when no auto-setup exists. */}
                {step.type === "default" && (
                  <StickyNote
                    size={12}
                    className="text-gray-400"
                    aria-label="Manual review step"
                  />
                )}
              </div>
            </div>
            <div className="flex-1 space-y-2 p-2">
              {cs.length === 0 ? (
                <p
                  className={cn(
                    "rounded-md px-3 py-6 text-center text-[11px] transition-colors",
                    isHover
                      ? "border border-dashed border-violet-300 bg-violet-50 text-violet-700"
                      : "bg-white text-gray-400"
                  )}
                >
                  {isHover ? "Drop to move here" : "No candidates here."}
                </p>
              ) : (
                cs.map((c) => (
                  <div
                    key={c.id}
                    onDragOver={(e) => onCardDragOver(e, c)}
                    onDrop={(e) => onCardDrop(e, c)}
                    className="relative"
                  >
                    {/* Insertion line above the card the user is hovering. */}
                    {insertBeforeId === c.id && draggingId && draggingId !== c.id && (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute -top-1 left-0 right-0 h-1 rounded-full bg-violet-500 shadow-[0_0_0_2px_rgba(139,92,246,0.25)]"
                      />
                    )}
                    <CandidateCard
                      candidate={c}
                      stepName={step.name}
                      onAction={onAction}
                      inboxKind={inboxKind(c, reviewedSet, previousVisitMs)}
                      isDragging={draggingId === c.id}
                      onDragStart={(e) => onCardDragStart(e, c)}
                      onDragEnd={onCardDragEnd}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Pills that label which auto-setups the step has — surfaced in the
 *  kanban column header so the recruiter can see at a glance which
 *  columns will trigger Test / Email / Interview notifications when a
 *  candidate lands here. */
/** Pipeline inbox pill — NEW (rose) for arrivals since last visit,
 *  UNREVIEWED (amber) for older un-actioned applicants still on the
 *  desk from a previous session. Returns null when reviewed. */
function InboxPill({ kind }: { kind: InboxKind }) {
  if (kind === null) return null;
  if (kind === "new") {
    return (
      <span className="inline-flex items-center rounded bg-rose-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
        New
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
      Unreviewed
    </span>
  );
}

function StepSetupBadges({ step }: { step: WorkflowStage["steps"][number] }) {
  const hasTest = step.type === "test" && (step.testIds?.length ?? 0) > 0;
  const hasInterview = step.type === "interview";
  const hasEmail = Boolean(step.emailTemplateId);
  if (!hasTest && !hasInterview && !hasEmail) return null;
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {hasTest && (
        <span className="inline-flex items-center rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700">
          Test
        </span>
      )}
      {hasInterview && (
        <span className="inline-flex items-center rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
          Interview
        </span>
      )}
      {hasEmail && (
        <span className="inline-flex items-center gap-0.5 rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700">
          <Mail size={9} />
          Email
        </span>
      )}
    </span>
  );
}

function CandidateCard({
  candidate: c,
  stepName,
  onAction,
  inboxKind: kind,
  isDragging,
  onDragStart,
  onDragEnd,
}: {
  candidate: Candidate;
  stepName?: string;
  onAction: (c: Candidate, action: ActionKind) => void;
  /** Inbox state for this candidate — drives the pill + ring colour.
   *  NEW = arrived since the user's last visit. UNREVIEWED = older
   *  but still un-actioned. null = reviewed. */
  inboxKind?: InboxKind;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
}) {
  const isDraggable = Boolean(onDragStart);
  return (
    <div
      role="button"
      tabIndex={0}
      // Whole-card drag is reliable here because the only nested
      // interactive children (action menu button) get explicit
      // `draggable={false}` below to keep them clickable.
      draggable={isDraggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={() => onAction(c, "view")}
      onKeyDown={(e) => {
        if (e.key === "Enter") onAction(c, "view");
      }}
      className={cn(
        "rounded-lg border bg-white p-3 shadow-sm hover:border-violet-300",
        kind === "new" && "border-rose-300 bg-rose-50/40",
        kind === "unreviewed" && "border-amber-300 bg-amber-50/40",
        !kind && "border-gray-200",
        isDraggable
          ? "cursor-grab active:cursor-grabbing"
          : "cursor-pointer",
        isDragging && "opacity-40"
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-medium text-gray-900">
              {c.name}
            </p>
            <InboxPill kind={kind ?? null} />
          </div>
          <p className="truncate text-[11px] text-gray-500">{c.email}</p>
        </div>
        {/* Stop click + drag from the action menu so it stays a normal
         *  button — clicking opens the menu, doesn't drag the card. */}
        <div
          draggable={false}
          onClick={(e) => e.stopPropagation()}
          onDragStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <ActionMenu candidate={c} onAction={onAction} />
        </div>
      </div>
      <dl className="space-y-1 text-[11px]">
        <KvRow label="Status">
          <StatusBadge status={c.status} compact />
        </KvRow>
        <KvRow label="Matched">
          <SkillsBadge percent={c.skillsMatchPercent} compact />
        </KvRow>
        <KvRow label="Booked">
          {c.bookedDateISO ? (
            <span>
              {c.bookedTime}, {c.bookedDateISO}
            </span>
          ) : (
            <span className="text-gray-400">Not booked</span>
          )}
        </KvRow>
        {c.stepResult && (
          <KvRow label="Result">
            <span className="text-gray-700">{c.stepResult}</span>
          </KvRow>
        )}
        <KvRow label="Group">
          {c.groupLabel ? (
            <GroupLabelBadge label={c.groupLabel} compact />
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </KvRow>
      </dl>
      <div className="mt-2 flex items-center justify-between">
        <ReviewerStack reviewerIds={c.reviewerIds} />
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
          {c.hasNote && <StickyNote size={11} className="text-amber-500" />}
          {c.pendingEmailCount > 0 && (
            <span className="inline-flex items-center gap-0.5 text-violet-700">
              <Mail size={11} />
              {c.pendingEmailCount}
            </span>
          )}
        </div>
      </div>
      {stepName && (
        <p className="mt-2 truncate border-t border-gray-100 pt-1.5 text-[10px] text-gray-400">
          → {stepName}
        </p>
      )}
    </div>
  );
}

function KvRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="shrink-0 text-gray-400">{label}:</dt>
      <dd className="min-w-0 truncate text-right">{children}</dd>
    </div>
  );
}

/* ============================================================
 * Action menu
 * ============================================================ */

function ActionMenu({
  candidate,
  onAction,
}: {
  candidate: Candidate;
  onAction: (c: Candidate, action: ActionKind) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickAway(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickAway);
    return () => document.removeEventListener("mousedown", onClickAway);
  }, [open]);

  function pick(action: ActionKind) {
    setOpen(false);
    onAction(candidate, action);
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        aria-label="Open candidate menu"
      >
        <MoreVertical size={14} />
      </button>
      {open && (
        <div className="absolute right-0 top-7 z-20 w-52 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 text-xs shadow-lg">
          <MenuItem icon={<User size={12} />} onClick={() => pick("view")}>
            View Candidate Details
          </MenuItem>
          <MenuItem
            icon={<ChevronRight size={12} />}
            onClick={() => pick("move")}
          >
            Move to Step …
          </MenuItem>
          <MenuItem icon={<Copy size={12} />} onClick={() => pick("status")}>
            Change status
          </MenuItem>
          <MenuItem
            icon={<Download size={12} />}
            onClick={() => pick("download")}
          >
            Download CV
          </MenuItem>
          <MenuItem
            icon={<Trash2 size={12} />}
            tone="danger"
            onClick={() => pick("delete")}
          >
            Delete
          </MenuItem>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  children,
  onClick,
  icon,
  tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  icon?: React.ReactNode;
  tone?: "danger";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-left transition-colors",
        tone === "danger"
          ? "text-red-600 hover:bg-red-50"
          : "text-gray-700 hover:bg-gray-100"
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
      <p className="font-medium text-gray-500">{title}</p>
      <p className="mt-1 text-sm text-gray-400">{message}</p>
    </div>
  );
}

/* ============================================================
 * Confirm delete (lightweight, modal-shape parity with others)
 * ============================================================ */

function ConfirmDelete({
  candidateName,
  onCancel,
  onConfirm,
}: {
  candidateName: string;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            <Trash2 size={16} />
          </span>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Delete candidate?
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              <span className="font-medium text-gray-800">{candidateName}</span>{" "}
              will be removed from this pipeline. This is mocked locally and
              cannot be recovered in the demo.
            </p>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm();
              } finally {
                setBusy(false);
              }
            }}
            disabled={busy}
            className="rounded-lg bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
