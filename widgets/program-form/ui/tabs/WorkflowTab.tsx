"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ClipboardCheck,
  Copy,
  FileText,
  GripVertical,
  HelpCircle,
  Lock,
  Mail,
  MoreHorizontal,
  Plus,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useToast } from "@/shared/ui/toast";
import {
  STEP_TYPE_LABEL,
  newStage,
  newStep,
  type ProgramWorkflow,
  type ScorecardCriterion,
  type StepType,
  type WorkflowStage,
  type WorkflowStep,
} from "@/entities/program";
import type { FlowTemplate } from "@/entities/flow-template";
import type { ScorecardTemplate } from "@/entities/scorecard-template";
import type { CriterionTemplate } from "@/entities/criterion-template";
import type { TestTemplate } from "@/entities/test-template";
import type { Reviewer } from "@/shared/fixtures/reviewers";
import { emailTemplates } from "@/shared/fixtures/email-templates";
import type { ProgramDraft } from "../../model/types";

interface WorkflowTabProps {
  draft: ProgramDraft;
  onChange: (updates: Partial<ProgramDraft>) => void;
  /** When true, stage / step drag-drop is disabled and clicking a
   *  step opens the side panel in VIEW mode. When false, drag-drop
   *  is enabled and clicking a step opens it directly in EDIT mode
   *  (skip the view → edit step). */
  readOnly?: boolean;
}

export function WorkflowTab({ draft, onChange, readOnly }: WorkflowTabProps) {
  const workflow = draft.workflow;
  const { showToast } = useToast();

  const [flowTemplates, setFlowTemplates] = useState<FlowTemplate[]>([]);
  const [scorecards, setScorecards] = useState<ScorecardTemplate[]>([]);
  const [criteriaLib, setCriteriaLib] = useState<CriterionTemplate[]>([]);
  const [tests, setTests] = useState<TestTemplate[]>([]);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);

  // Selected step for the side panel (null = panel closed).
  const [selected, setSelected] = useState<{
    stageId: string;
    stepId: string;
  } | null>(null);

  // Guard so the auto-apply only runs once per mount, even if the data
  // fetch resolves while React is mid-rendering.
  const autoAppliedRef = useRef(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/flow-templates").then((r) => r.json()),
      fetch("/api/scorecard-templates").then((r) => r.json()),
      fetch("/api/criterion-templates").then((r) => r.json()),
      fetch("/api/test-templates").then((r) => r.json()),
      fetch("/api/reviewers").then((r) => r.json()),
    ]).then(([flow, sc, crit, ts, rv]) => {
      setFlowTemplates(flow.templates);
      setScorecards(sc.templates);
      setCriteriaLib(crit.items);
      setTests(ts.items);
      setReviewers(rv.reviewers);

      // Empty workflow → seed the wireframe's "starter" shape: one
       // editable stage with a single step + the locked Final
       // Decisions terminal stage. The user can then rename / add
       // steps / pick a real flow template via the dropdown.
      // Wireframe ref: 3241:41072.
      if (
        !autoAppliedRef.current &&
        workflow.stages.length === 0 &&
        !workflow.flowTemplateId
      ) {
        autoAppliedRef.current = true;
        const starterStage: WorkflowStage = {
          ...newStage("New Stage"),
          steps: [{ ...newStep("New Step"), type: "default" }],
        };
        const finalStage: WorkflowStage = {
          ...newStage("Final Decisions"),
          steps: [
            { ...newStep("Hired"), type: "default", timelineDays: 0 },
            { ...newStep("Rejected"), type: "default", timelineDays: 0 },
          ],
        };
        update({ stages: [starterStage, finalStage] });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update(patch: Partial<ProgramWorkflow>) {
    onChange({ workflow: { ...workflow, ...patch } });
  }

  async function applyFlowTemplate(templateId: string) {
    if (!templateId) {
      update({ flowTemplateId: undefined });
      return;
    }
    if (workflow.stages.length > 0) {
      const ok = window.confirm(
        "Applying a flow template will replace all current stages and steps. Continue?"
      );
      if (!ok) return;
    }
    const tplRes = await fetch(`/api/flow-templates/${templateId}`);
    if (!tplRes.ok) {
      showToast("error", "Failed to load flow template.");
      return;
    }
    const { template } = (await tplRes.json()) as { template: FlowTemplate };

    const newStages: WorkflowStage[] = await Promise.all(
      template.stages.map(async (s) => ({
        ...newStage(s.name),
        steps: await Promise.all(
          s.steps.map(async (sStep) => {
            const base: WorkflowStep = {
              ...newStep(sStep.name),
              type: sStep.type,
              timelineDays: sStep.timelineDays,
              instruction: sStep.instruction ?? "",
              reviewerIds: sStep.reviewerIds ? [...sStep.reviewerIds] : [],
              autoAllocate: sStep.autoAllocate,
              emailTemplateId: sStep.emailTemplateId,
            };
            if (sStep.type === "test" && sStep.testIds) {
              base.testIds = [...sStep.testIds];
            }
            if (sStep.type === "interview" && sStep.scorecardTemplateId) {
              const scRes = await fetch(
                `/api/scorecard-templates/${sStep.scorecardTemplateId}`
              );
              if (scRes.ok) {
                const { template: sc } = (await scRes.json()) as {
                  template: ScorecardTemplate;
                };
                base.scorecard = {
                  templateId: sc.id,
                  criteria: sc.criteria.map<ScorecardCriterion>((c) => ({
                    id: `crit-${Date.now()}-${Math.random()
                      .toString(36)
                      .slice(2, 6)}`,
                    templateId: c.id,
                    name: c.name,
                    weight: c.weight,
                    description: c.description,
                    categories: c.categories,
                  })),
                };
              }
            }
            return base;
          })
        ),
      }))
    );

    // Append a Final Decisions stage to match the wireframe — terminal
    // stage with Hired / Rejected.
    const finalStage: WorkflowStage = {
      ...newStage("Final Decisions"),
      steps: [
        { ...newStep("Hired"), type: "default", timelineDays: 0 },
        { ...newStep("Rejected"), type: "default", timelineDays: 0 },
      ],
    };

    update({ flowTemplateId: templateId, stages: [...newStages, finalStage] });
    showToast("success", `Applied flow template: ${template.name}.`);
  }

  function patchStage(id: string, patch: Partial<WorkflowStage>) {
    update({
      stages: workflow.stages.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  }

  function deleteStage(id: string) {
    if (selected?.stageId === id) setSelected(null);
    update({ stages: workflow.stages.filter((s) => s.id !== id) });
  }

  function addStage() {
    update({ stages: [...workflow.stages, newStage()] });
  }

  /** Insert a brand-new stage at `idx` (0..stages.length). Used by the
   *  "+" connector buttons between stages. */
  function insertStageAt(idx: number) {
    const next = [...workflow.stages];
    next.splice(Math.max(0, Math.min(idx, next.length)), 0, newStage());
    update({ stages: next });
  }

  /** Move a stage from `fromIdx` to insertion point `toIdx`
   *  (0..stages.length). Standard list-reorder semantics — when
   *  toIdx > fromIdx the target shifts down by one after the source
   *  is spliced out. */
  function moveStage(fromIdx: number, toIdx: number) {
    if (fromIdx < 0 || fromIdx >= workflow.stages.length) return;
    if (toIdx === fromIdx || toIdx === fromIdx + 1) return;
    const next = [...workflow.stages];
    const [stage] = next.splice(fromIdx, 1);
    const adjusted = toIdx > fromIdx ? toIdx - 1 : toIdx;
    next.splice(Math.max(0, Math.min(adjusted, next.length)), 0, stage);
    update({ stages: next });
  }

  function addStep(stageId: string) {
    const stage = workflow.stages.find((s) => s.id === stageId);
    if (!stage) return;
    const step = newStep("New step");
    patchStage(stageId, { steps: [...stage.steps, step] });
    setSelected({ stageId, stepId: step.id });
  }

  function patchStep(
    stageId: string,
    stepId: string,
    patch: Partial<WorkflowStep>
  ) {
    const stage = workflow.stages.find((s) => s.id === stageId);
    if (!stage) return;
    patchStage(stageId, {
      steps: stage.steps.map((st) => (st.id === stepId ? { ...st, ...patch } : st)),
    });
  }

  function deleteStep(stageId: string, stepId: string) {
    const stage = workflow.stages.find((s) => s.id === stageId);
    if (!stage) return;
    if (selected?.stepId === stepId) setSelected(null);
    patchStage(stageId, { steps: stage.steps.filter((st) => st.id !== stepId) });
  }

  /** Move a step within or across stages. `insertAt` is the target index in
   *  toStage's steps (use stage.steps.length to append). */
  function moveStep(
    fromStageId: string,
    stepId: string,
    toStageId: string,
    insertAt: number
  ) {
    const fromStage = workflow.stages.find((s) => s.id === fromStageId);
    if (!fromStage) return;
    const step = fromStage.steps.find((st) => st.id === stepId);
    if (!step) return;
    const sameStage = fromStageId === toStageId;
    if (sameStage) {
      const fromIdx = fromStage.steps.findIndex((st) => st.id === stepId);
      const newSteps = [...fromStage.steps];
      newSteps.splice(fromIdx, 1);
      const adjusted = insertAt > fromIdx ? insertAt - 1 : insertAt;
      newSteps.splice(
        Math.max(0, Math.min(adjusted, newSteps.length)),
        0,
        step
      );
      patchStage(fromStageId, { steps: newSteps });
    } else {
      const toStage = workflow.stages.find((s) => s.id === toStageId);
      if (!toStage) return;
      const fromSteps = fromStage.steps.filter((st) => st.id !== stepId);
      const toSteps = [...toStage.steps];
      toSteps.splice(Math.max(0, Math.min(insertAt, toSteps.length)), 0, step);
      update({
        stages: workflow.stages.map((s) => {
          if (s.id === fromStageId) return { ...s, steps: fromSteps };
          if (s.id === toStageId) return { ...s, steps: toSteps };
          return s;
        }),
      });
    }
  }

  const selectedStage = selected
    ? workflow.stages.find((s) => s.id === selected.stageId)
    : undefined;
  const selectedStep = selected && selectedStage
    ? selectedStage.steps.find((st) => st.id === selected.stepId)
    : undefined;
  const selectedStageIdx = selected
    ? workflow.stages.findIndex((s) => s.id === selected.stageId)
    : -1;
  const selectedStepIdx = selected && selectedStage
    ? selectedStage.steps.findIndex((st) => st.id === selected.stepId)
    : -1;
  // Resolve the matching FlowStepTemplate for "Reset to default". Only
  // available when the program was bootstrapped from a flow template AND
  // the user hasn't reordered stages/steps to a position the template
  // didn't have.
  const selectedDefault =
    workflow.flowTemplateId && selectedStageIdx >= 0 && selectedStepIdx >= 0
      ? flowTemplates
          .find((t) => t.id === workflow.flowTemplateId)
          ?.stages?.[selectedStageIdx]?.steps?.[selectedStepIdx]
      : undefined;

  return (
    <div className="space-y-4">
      {/* Recruitment Flow selector */}
      <section>
        <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
          Recruitment Flow
          <span className="text-red-500">*</span>
        </label>
        <select
          value={workflow.flowTemplateId ?? ""}
          onChange={(e) => applyFlowTemplate(e.target.value)}
          disabled={readOnly}
          className="w-full max-w-xl rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
        >
          <option value="">Default Flow</option>
          {flowTemplates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </section>

      {/* Canvas */}
      <section className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        {workflow.stages.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-200 bg-white p-12 text-center">
            <p className="font-medium text-gray-500">No workflow stages yet</p>
            <p className="mt-1 text-sm text-gray-400">
              Pick a flow template above to get started, or add a stage manually.
            </p>
            <button
              onClick={addStage}
              disabled={readOnly}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-violet-300 bg-white px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={16} />
              Add stage
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto pb-2">
            <StageRow
              stages={workflow.stages}
              readOnly={Boolean(readOnly)}
              isFinalDecisions={isFinalDecisionsStage}
              selected={selected}
              onPatchStage={patchStage}
              onDeleteStage={deleteStage}
              onAddStep={addStep}
              onPatchStep={patchStep}
              onDeleteStep={deleteStep}
              onSelectStep={(stageId, stepId) => setSelected({ stageId, stepId })}
              onMoveStep={moveStep}
              onMoveStage={moveStage}
              onInsertStageAt={insertStageAt}
              onAppendStage={addStage}
            />
          </div>
        )}
      </section>

      {/* Side panel for step details. Opens in EDIT mode when the
       *  whole Workflow tab is in edit mode (the user already clicked
       *  the per-tab Edit), and VIEW mode otherwise. */}
      {selectedStep && selectedStage && (
        <StepDetailPanel
          step={selectedStep}
          stageName={selectedStage.name}
          scorecards={scorecards}
          criteriaLib={criteriaLib}
          tests={tests}
          reviewers={reviewers}
          defaultStep={selectedDefault}
          initialMode={readOnly ? "view" : "edit"}
          onPatch={(patch) =>
            patchStep(selectedStage.id, selectedStep.id, patch)
          }
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

/** Convenience: a "Final Decisions" stage is just a stage named that way
 *  with terminal steps. We don't model it as a separate kind. */
function isFinalDecisionsStage(stage: WorkflowStage): boolean {
  return stage.name.toLowerCase().includes("final");
}

/* ============================================================
 * Stage card — vertical column on the canvas
 * ============================================================ */

const STEP_DND_MIME = "application/x-art-mockup-workflow-step";
const STAGE_DND_MIME = "application/x-art-mockup-workflow-stage";

/* ============================================================
 * Stage row — horizontal pipeline of stages with insert / drop
 * connectors between them.
 * ============================================================ */

function StageRow({
  stages,
  readOnly,
  isFinalDecisions,
  selected,
  onPatchStage,
  onDeleteStage,
  onAddStep,
  onPatchStep,
  onDeleteStep,
  onSelectStep,
  onMoveStep,
  onMoveStage,
  onInsertStageAt,
  onAppendStage,
}: {
  stages: WorkflowStage[];
  readOnly: boolean;
  isFinalDecisions: (s: WorkflowStage) => boolean;
  selected: { stageId: string; stepId: string } | null;
  onPatchStage: (id: string, patch: Partial<WorkflowStage>) => void;
  onDeleteStage: (id: string) => void;
  onAddStep: (stageId: string) => void;
  onPatchStep: (
    stageId: string,
    stepId: string,
    patch: Partial<WorkflowStep>
  ) => void;
  onDeleteStep: (stageId: string, stepId: string) => void;
  onSelectStep: (stageId: string, stepId: string) => void;
  onMoveStep: (
    fromStageId: string,
    stepId: string,
    toStageId: string,
    insertAt: number
  ) => void;
  onMoveStage: (fromIdx: number, toIdx: number) => void;
  onInsertStageAt: (idx: number) => void;
  onAppendStage: () => void;
}) {
  const [dragSourceIdx, setDragSourceIdx] = useState<number | null>(null);
  const [dropAt, setDropAt] = useState<number | null>(null);
  const isDraggingStage = dragSourceIdx !== null;

  function readStagePayload(e: React.DragEvent) {
    try {
      const raw = e.dataTransfer.getData(STAGE_DND_MIME);
      if (!raw) return null;
      return JSON.parse(raw) as { fromIdx: number };
    } catch {
      return null;
    }
  }

  function isStageDrag(e: React.DragEvent) {
    return Array.from(e.dataTransfer.types).includes(STAGE_DND_MIME);
  }

  function handleStageDragStart(idx: number) {
    return (e: React.DragEvent) => {
      e.dataTransfer.setData(
        STAGE_DND_MIME,
        JSON.stringify({ fromIdx: idx })
      );
      // text/plain is required by Firefox to actually start the drag
      // when the only data is a custom MIME type.
      e.dataTransfer.setData("text/plain", `stage-${idx}`);
      e.dataTransfer.effectAllowed = "move";
      // Defer the state update to the next tick. Some browsers cancel
      // the drag if the drag source's CSS changes (opacity etc.) before
      // the drag image has been captured.
      setTimeout(() => setDragSourceIdx(idx), 0);
    };
  }

  function handleStageDragEnd() {
    setDragSourceIdx(null);
    setDropAt(null);
  }

  function handleConnectorDragOver(at: number) {
    return (e: React.DragEvent) => {
      if (!isStageDrag(e)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      // dragOver fires continuously while the cursor is over the
      // connector — it always wins, so we don't need an onDragLeave
      // to clear stale state. Skipping leave also avoids the classic
      // child-element flicker bug where moving between an inner span
      // and the parent div fires dragleave repeatedly.
      setDropAt((prev) => (prev === at ? prev : at));
    };
  }

  function handleConnectorDrop(at: number) {
    return (e: React.DragEvent) => {
      if (!isStageDrag(e)) return;
      e.preventDefault();
      const payload = readStagePayload(e);
      setDropAt(null);
      setDragSourceIdx(null);
      if (!payload) return;
      onMoveStage(payload.fromIdx, at);
    };
  }

  return (
    <div className="flex items-stretch gap-2">
      {/* Leading drop zone — only renders during a stage drag. Lets the
       *  user drop a stage at index 0 (move to start). */}
      {!readOnly && (
        <StageDropZone
          dragActive={isDraggingStage}
          dropActive={dropAt === 0}
          onDragOver={handleConnectorDragOver(0)}
          onDrop={handleConnectorDrop(0)}
        />
      )}

      {stages.map((stage, idx) => (
        <Fragment key={stage.id}>
          <StageCard
            stage={stage}
            stageIndex={idx}
            isFinal={isFinalDecisions(stage)}
            selectedStepId={
              selected?.stageId === stage.id ? selected.stepId : null
            }
            readOnly={readOnly}
            isDraggingThisStage={dragSourceIdx === idx}
            onStageDragStart={handleStageDragStart(idx)}
            onStageDragEnd={handleStageDragEnd}
            onPatch={(patch) => onPatchStage(stage.id, patch)}
            onDelete={() => onDeleteStage(stage.id)}
            onAddStep={() => onAddStep(stage.id)}
            onPatchStep={(stepId, patch) =>
              onPatchStep(stage.id, stepId, patch)
            }
            onDeleteStep={(stepId) => onDeleteStep(stage.id, stepId)}
            onSelectStep={(stepId) => onSelectStep(stage.id, stepId)}
            onMoveStep={onMoveStep}
          />
          {idx < stages.length - 1 ? (
            <StageConnector
              readOnly={readOnly}
              dragActive={isDraggingStage}
              dropActive={dropAt === idx + 1}
              onInsert={() => onInsertStageAt(idx + 1)}
              onDragOver={handleConnectorDragOver(idx + 1)}
              onDrop={handleConnectorDrop(idx + 1)}
            />
          ) : (
            <TrailingAddStage
              readOnly={readOnly}
              dragActive={isDraggingStage}
              dropActive={dropAt === stages.length}
              onAppend={onAppendStage}
              onDragOver={handleConnectorDragOver(stages.length)}
              onDrop={handleConnectorDrop(stages.length)}
            />
          )}
        </Fragment>
      ))}
    </div>
  );
}

/** Connector rendered between two stages. Shows the arrow link, and on
 *  hover surfaces a "+" pill to insert a fresh stage at that position.
 *  When a stage drag is in flight, the "+" hides and the connector
 *  becomes a drop target with a vertical indicator bar. */
function StageConnector({
  readOnly,
  dragActive,
  dropActive,
  onInsert,
  onDragOver,
  onDrop,
}: {
  readOnly: boolean;
  dragActive: boolean;
  dropActive: boolean;
  onInsert: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  return (
    <div
      onDragOver={readOnly ? undefined : onDragOver}
      onDrop={readOnly ? undefined : onDrop}
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 self-stretch px-1",
        dragActive && "min-w-[56px]"
      )}
    >
      {dropActive && (
        <span
          aria-hidden
          className="absolute inset-y-3 left-1/2 w-1 -translate-x-1/2 rounded-full bg-violet-500"
        />
      )}
      {dragActive && !dropActive && (
        <span
          aria-hidden
          className="absolute inset-y-4 left-1/2 w-0.5 -translate-x-1/2 rounded-full bg-violet-200"
        />
      )}
      <div
        className={cn(
          "flex items-center text-gray-400",
          dragActive && "opacity-30"
        )}
      >
        <ArrowRight size={20} />
      </div>
      {!readOnly && !dragActive && (
        <button
          type="button"
          onClick={onInsert}
          aria-label="Insert stage here"
          title="Insert stage here"
          className={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-full",
            "bg-gray-900 text-white shadow-md ring-2 ring-white transition-transform",
            "hover:scale-110"
          )}
        >
          <Plus size={14} />
        </button>
      )}
    </div>
  );
}

/** Slim drop zone shown only during a stage drag, used as the leading
 *  insertion point (drop at idx 0). */
function StageDropZone({
  dragActive,
  dropActive,
  onDragOver,
  onDrop,
}: {
  dragActive: boolean;
  dropActive: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  if (!dragActive) return null;
  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        "relative flex w-10 shrink-0 items-center justify-center self-stretch rounded-md border-2 border-dashed transition-colors",
        dropActive
          ? "border-violet-500 bg-violet-100"
          : "border-violet-200 bg-violet-50/40"
      )}
      title="Drop here to move to start"
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-3 left-1/2 w-1 -translate-x-1/2 rounded-full",
          dropActive ? "bg-violet-500" : "bg-violet-300"
        )}
      />
    </div>
  );
}

/** Trailing "Add stage" button — also functions as the drop target for
 *  moving a stage to the very end. */
function TrailingAddStage({
  readOnly,
  dragActive,
  dropActive,
  onAppend,
  onDragOver,
  onDrop,
}: {
  readOnly: boolean;
  dragActive: boolean;
  dropActive: boolean;
  onAppend: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  return (
    <button
      onClick={readOnly ? undefined : onAppend}
      onDragOver={readOnly ? undefined : onDragOver}
      onDrop={readOnly ? undefined : onDrop}
      disabled={readOnly}
      className={cn(
        "flex w-12 shrink-0 items-center justify-center rounded-lg border-2 border-dashed transition-colors",
        dropActive
          ? "border-violet-500 bg-violet-100 text-violet-700"
          : dragActive
            ? "border-violet-300 bg-violet-50 text-violet-500"
            : "border-violet-300 bg-white text-violet-500 hover:bg-violet-50",
        readOnly && "cursor-not-allowed opacity-40 hover:bg-white"
      )}
      title={readOnly ? "Read-only" : "Add stage"}
    >
      <Plus size={20} />
    </button>
  );
}

function StageCard({
  stage,
  stageIndex: _stageIndex,
  isFinal,
  selectedStepId,
  readOnly,
  isDraggingThisStage,
  onStageDragStart,
  onStageDragEnd,
  onPatch,
  onDelete,
  onAddStep,
  onPatchStep,
  onDeleteStep,
  onSelectStep,
  onMoveStep,
}: {
  stage: WorkflowStage;
  stageIndex: number;
  isFinal: boolean;
  selectedStepId: string | null;
  readOnly: boolean;
  isDraggingThisStage: boolean;
  onStageDragStart: (e: React.DragEvent) => void;
  onStageDragEnd: () => void;
  onPatch: (patch: Partial<WorkflowStage>) => void;
  onDelete: () => void;
  onAddStep: () => void;
  onPatchStep: (stepId: string, patch: Partial<WorkflowStep>) => void;
  onDeleteStep: (stepId: string) => void;
  onSelectStep: (stepId: string) => void;
  onMoveStep: (
    fromStageId: string,
    stepId: string,
    toStageId: string,
    insertAt: number
  ) => void;
}) {
  const [editingName, setEditingName] = useState(false);
  const [dropAt, setDropAt] = useState<number | null>(null);

  function readPayload(e: React.DragEvent) {
    try {
      const raw = e.dataTransfer.getData(STEP_DND_MIME);
      if (!raw) return null;
      return JSON.parse(raw) as { fromStageId: string; stepId: string };
    } catch {
      return null;
    }
  }

  function isStepDrag(e: React.DragEvent) {
    return Array.from(e.dataTransfer.types).includes(STEP_DND_MIME);
  }

  function onAreaDragOver(e: React.DragEvent) {
    if (!isStepDrag(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropAt(stage.steps.length);
  }

  function onAreaDrop(e: React.DragEvent) {
    if (!isStepDrag(e)) return;
    e.preventDefault();
    const payload = readPayload(e);
    setDropAt(null);
    if (!payload) return;
    onMoveStep(payload.fromStageId, payload.stepId, stage.id, stage.steps.length);
  }
  // Final Decisions is a system-default terminal stage — its name,
  // delete, drag handle, and step contents are immutable. Edits are
  // suppressed regardless of the global readOnly flag.
  const isLockedStage = isFinal;
  return (
    <div
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-xl border bg-white shadow-sm transition-opacity",
        isFinal ? "border-violet-200" : "border-gray-200",
        isDraggingThisStage && "opacity-40"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2.5">
        {!readOnly && !isLockedStage && (
          <span
            draggable
            onDragStart={(e) => {
              e.stopPropagation();
              onStageDragStart(e);
            }}
            onDragEnd={onStageDragEnd}
            onClick={(e) => e.stopPropagation()}
            className="-ml-1 inline-flex cursor-grab items-center rounded px-1 py-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 active:cursor-grabbing"
            title="Drag to reorder this stage"
            aria-label="Drag stage"
          >
            <GripVertical size={15} />
          </span>
        )}
        {editingName && !readOnly && !isLockedStage ? (
          <input
            autoFocus
            value={stage.name}
            onChange={(e) => onPatch({ name: e.target.value })}
            onBlur={() => setEditingName(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Escape") setEditingName(false);
            }}
            className="flex-1 rounded border border-violet-300 bg-white px-2 py-1 text-sm font-semibold text-gray-900 focus:border-violet-500 focus:outline-none"
          />
        ) : readOnly || isLockedStage ? (
          <span className="flex-1 truncate text-left text-sm font-semibold text-gray-900">
            {stage.name}
          </span>
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="flex-1 text-left text-sm font-semibold text-gray-900"
          >
            {stage.name}
          </button>
        )}
        {isLockedStage && (
          <span
            title="System Default. This final stage and its steps are locked to ensure data integrity."
            className="inline-flex shrink-0 items-center text-violet-600"
          >
            <Lock size={12} />
          </span>
        )}
        {/* Wireframe shows a small "NEW" badge on stages the user just
         *  added but hasn't saved yet. The starter "New Stage" auto-
         *  seeded into an empty workflow qualifies — surface the badge
         *  whenever the stage's name is still the default. */}
        {!isLockedStage && stage.name === "New Stage" && (
          <span className="inline-flex shrink-0 items-center rounded bg-sky-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-sky-700">
            New
          </span>
        )}
        {!readOnly && !isLockedStage && (
          <button
            onClick={onDelete}
            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
            aria-label="Delete stage"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {/* Steps */}
      <div
        className="flex-1 space-y-2 p-3"
        onDragOver={readOnly || isLockedStage ? undefined : onAreaDragOver}
        onDragLeave={readOnly || isLockedStage ? undefined : () => setDropAt(null)}
        onDrop={readOnly || isLockedStage ? undefined : onAreaDrop}
      >
        {stage.steps.length === 0 ? (
          <div
            className={cn(
              "rounded-md border-2 border-dashed px-3 py-4 text-center text-xs transition-colors",
              dropAt !== null
                ? "border-violet-400 bg-violet-50 text-violet-700"
                : "border-gray-200 bg-gray-50 text-gray-400"
            )}
          >
            {dropAt !== null ? "Drop step here" : "No steps yet."}
          </div>
        ) : (
          stage.steps.map((step, idx) => (
            <StepCard
              key={step.id}
              step={step}
              stageId={stage.id}
              index={idx}
              selected={selectedStepId === step.id}
              terminal={isFinal}
              readOnly={readOnly}
              dropIndicator={dropAt === idx}
              onSelect={() => onSelectStep(step.id)}
              onDelete={() => onDeleteStep(step.id)}
              onChangeName={(name) => onPatchStep(step.id, { name })}
              onDragOverCard={(e) => {
                if (!isStepDrag(e)) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                setDropAt(idx);
              }}
              onDropOnCard={(e) => {
                if (!isStepDrag(e)) return;
                e.preventDefault();
                const payload = readPayload(e);
                setDropAt(null);
                if (!payload) return;
                onMoveStep(payload.fromStageId, payload.stepId, stage.id, idx);
              }}
            />
          ))
        )}
        {!readOnly && !isLockedStage && (
          <button
            onClick={onAddStep}
            className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-violet-300 px-2 py-1.5 text-xs font-medium text-violet-600 hover:bg-violet-50"
          >
            <Plus size={12} />
            Add step
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================================================
 * Step card — clickable summary card inside a stage
 * ============================================================ */

const STEP_TYPE_BADGE: Record<StepType, string> = {
  default: "bg-gray-100 text-gray-700",
  interview: "bg-violet-100 text-violet-700",
  test: "bg-blue-100 text-blue-700",
};

function StepCard({
  step,
  stageId,
  selected,
  terminal,
  readOnly,
  dropIndicator,
  onSelect,
  onDelete,
  onChangeName,
  onDragOverCard,
  onDropOnCard,
}: {
  step: WorkflowStep;
  stageId: string;
  index: number;
  selected: boolean;
  terminal: boolean;
  readOnly: boolean;
  dropIndicator: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onChangeName: (name: string) => void;
  onDragOverCard: (e: React.DragEvent) => void;
  onDropOnCard: (e: React.DragEvent) => void;
}) {
  const [renaming, setRenaming] = useState(false);

  function onCardDragStart(e: React.DragEvent) {
    e.dataTransfer.setData(
      STEP_DND_MIME,
      JSON.stringify({ fromStageId: stageId, stepId: step.id })
    );
    e.dataTransfer.effectAllowed = "move";
    e.stopPropagation();
  }

  // Terminal steps (Hired / Rejected inside Final Decisions) are
  // system-default and locked — no rename, no drag, no delete, no
  // step-detail panel selection. We render them with a diagonal
  // stripe pattern + "Config: 📧 Email" label per the wireframe.
  const isLocked = terminal;

  if (isLocked) {
    return (
      <div
        className="relative overflow-hidden rounded-md border border-violet-100 bg-white p-2.5"
        // Faint diagonal-stripe overlay to signal "locked / read-only".
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(167,139,250,0.08) 0 6px, transparent 6px 14px)",
        }}
      >
        <div className="flex items-start gap-2">
          <span
            className="mt-0.5 inline-flex shrink-0 items-center text-violet-500"
            title="System Default — locked"
          >
            <Lock size={11} />
          </span>
          <div className="flex-1 min-w-0">
            <span className="block w-full truncate text-xs font-medium text-gray-800">
              {step.name}
            </span>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-gray-500">
              <span>Config:</span>
              <span className="inline-flex items-center gap-0.5">
                <Mail size={9} className="text-gray-400" />
                Email
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      onDragOver={readOnly ? undefined : onDragOverCard}
      onDrop={readOnly ? undefined : onDropOnCard}
      className={cn(
        "relative cursor-pointer rounded-md border bg-white p-2.5 transition-colors hover:border-violet-300",
        selected
          ? "border-violet-500 ring-2 ring-violet-200"
          : "border-gray-200"
      )}
    >
      {dropIndicator && !readOnly && (
        <span
          aria-hidden
          className="absolute -top-1 left-2 right-2 h-0.5 rounded-full bg-violet-500"
        />
      )}
      <div className="flex items-start gap-2">
        {!readOnly && (
          <span
            draggable
            onDragStart={onCardDragStart}
            onClick={(e) => e.stopPropagation()}
            className="mt-0.5 -ml-1 cursor-grab rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 active:cursor-grabbing"
            title="Drag to reorder or move to another stage"
            aria-label="Drag handle"
          >
            <GripVertical size={12} />
          </span>
        )}
        <div className="flex-1 min-w-0">
          {renaming && !readOnly ? (
            <input
              autoFocus
              value={step.name}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onChangeName(e.target.value)}
              onBlur={() => setRenaming(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Escape") setRenaming(false);
              }}
              className="w-full rounded border border-violet-300 bg-white px-1.5 py-0.5 text-xs font-medium text-gray-800 focus:border-violet-500 focus:outline-none"
            />
          ) : readOnly ? (
            <span className="block w-full truncate text-left text-xs font-medium text-gray-800">
              {step.name || "Untitled step"}
            </span>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRenaming(true);
              }}
              className="block w-full truncate text-left text-xs font-medium text-gray-800"
            >
              {step.name || "Untitled step"}
            </button>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase",
                STEP_TYPE_BADGE[step.type]
              )}
            >
              {STEP_TYPE_LABEL[step.type]}
            </span>
            {step.name === "New Step" && (
              <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-sky-700">
                New
              </span>
            )}
            {step.timelineDays > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-500">
                <CalendarClock size={9} />
                {step.timelineDays}d
              </span>
            )}
            {step.emailTemplateId && (
              <Mail size={10} className="text-gray-400" aria-label="Has email" />
            )}
          </div>
        </div>
        {!readOnly && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="rounded p-0.5 text-gray-300 hover:bg-red-50 hover:text-red-600"
            aria-label="Delete step"
          >
            <X size={11} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================================================
 * Side panel — full step editor
 * ============================================================ */

function StepDetailPanel({
  step,
  stageName,
  scorecards,
  criteriaLib,
  tests,
  reviewers,
  defaultStep,
  initialMode,
  onPatch,
  onClose,
}: {
  step: WorkflowStep;
  stageName: string;
  scorecards: ScorecardTemplate[];
  criteriaLib: CriterionTemplate[];
  tests: TestTemplate[];
  reviewers: Reviewer[];
  defaultStep?: import("@/entities/flow-template").FlowStepTemplate;
  onPatch: (patch: Partial<WorkflowStep>) => void;
  onClose: () => void;
  /** When the entire Workflow tab is in edit mode, opening a step
   *  jumps straight to the step's edit mode — no extra "click Edit
   *  to enter edit". Defaults to view-first when omitted. */
  initialMode?: "view" | "edit";
}) {
  const [mode, setMode] = useState<"view" | "edit">(initialMode ?? "view");
  // Snapshot taken on entering edit mode so Cancel can revert.
  const [snapshot, setSnapshot] = useState<WorkflowStep | null>(
    initialMode === "edit" ? { ...step } : null
  );
  // Force back to the requested initial mode whenever the selected
  // step changes.
  useEffect(() => {
    setMode(initialMode ?? "view");
    setSnapshot(initialMode === "edit" ? { ...step } : null);
  }, [step.id, initialMode]);

  const panelRef = useRef<HTMLDivElement>(null);
  // Click-outside-to-close. We listen on mousedown (rather than click) so
  // the close fires before the click target gets hidden by the panel
  // unmounting — feels more responsive. Native <select> dropdowns are
  // safe because their option clicks fire inside the panel.
  useEffect(() => {
    function handler(e: MouseEvent) {
      const target = e.target as Node | null;
      if (!panelRef.current || !target) return;
      if (panelRef.current.contains(target)) return;
      onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const isView = mode === "view";

  function setType(type: StepType) {
    const patch: Partial<WorkflowStep> = { type };
    if (type !== "test") patch.testIds = undefined;
    if (type !== "interview") patch.scorecard = undefined;
    onPatch(patch);
  }

  function enterEdit() {
    setSnapshot({ ...step });
    setMode("edit");
  }

  function cancelEdit() {
    if (snapshot) {
      // Replace every editable field with the snapshot in one patch so the
      // parent flushes once.
      onPatch({ ...snapshot });
    }
    setSnapshot(null);
    setMode("view");
  }

  function saveEdit() {
    setSnapshot(null);
    setMode("view");
  }

  // "Dirty" against the flow-template default — only fields the template
  // covers are compared. If anything differs, the Reset link surfaces.
  const isDirtyVsDefault = (() => {
    if (!defaultStep) return false;
    if (step.name !== defaultStep.name) return true;
    if (step.type !== defaultStep.type) return true;
    if (step.timelineDays !== defaultStep.timelineDays) return true;
    if ((step.instruction ?? "") !== (defaultStep.instruction ?? ""))
      return true;
    const a = (step.reviewerIds ?? []).slice().sort().join(",");
    const b = (defaultStep.reviewerIds ?? []).slice().sort().join(",");
    if (a !== b) return true;
    const ta = (step.testIds ?? []).slice().sort().join(",");
    const tb = (defaultStep.testIds ?? []).slice().sort().join(",");
    if (ta !== tb) return true;
    if (
      (step.scorecard?.templateId ?? "") !==
      (defaultStep.scorecardTemplateId ?? "")
    )
      return true;
    return false;
  })();

  function resetToDefault() {
    if (!defaultStep) return;
    const patch: Partial<WorkflowStep> = {
      name: defaultStep.name,
      type: defaultStep.type,
      timelineDays: defaultStep.timelineDays,
      instruction: defaultStep.instruction ?? "",
      reviewerIds: defaultStep.reviewerIds ? [...defaultStep.reviewerIds] : [],
      autoAllocate: defaultStep.autoAllocate,
      testIds:
        defaultStep.type === "test" && defaultStep.testIds
          ? [...defaultStep.testIds]
          : undefined,
      // Scorecard templateId on the default — but we can't rebuild the
      // criteria array from here without re-fetching the template. Best
      // we can do without a round-trip is reset the linkage and let the
      // parent re-hydrate the criteria when the user opens the picker.
      scorecard:
        defaultStep.type === "interview" && defaultStep.scorecardTemplateId
          ? { templateId: defaultStep.scorecardTemplateId, criteria: [] }
          : undefined,
    };
    onPatch(patch);
  }

  return (
    <div
      ref={panelRef}
      className={cn(
        "fixed inset-y-0 right-0 z-30 flex w-[520px] max-w-[90vw] flex-col border-l border-gray-200 bg-white shadow-xl",
        // Re-enable interaction inside the panel even when the parent
        // SettingsLayout is in read-only mode (which globally disables
        // inputs/selects/textareas via pointer-events-none on its
        // descendants). Step edits are gated by the panel's own view/
        // edit toggle, not by the tab-level Edit button.
        "[&_input]:!pointer-events-auto [&_select]:!pointer-events-auto [&_textarea]:!pointer-events-auto"
      )}
      // Stop drag-related events from propagating to the program-form's
      // outer drag handlers if we ever add them at the page level.
      onClick={(e) => e.stopPropagation()}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between gap-2 border-b border-gray-200 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-400">{stageName}</p>
          <p className="truncate text-sm font-semibold text-gray-900">
            Step: {step.name || "Untitled"}
            <span
              className={cn(
                "ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                isView
                  ? "bg-gray-100 text-gray-600"
                  : "bg-violet-100 text-violet-700"
              )}
            >
              {isView ? "View" : "Edit"}
            </span>
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body — wrapped in a fieldset so view mode disables every input
       *  in one shot without us touching every field. */}
      <fieldset
        disabled={isView}
        className={cn(
          "flex-1 space-y-5 overflow-y-auto p-4",
          isView &&
            "[&_input:not([type='checkbox']):not([type='radio'])]:bg-gray-50 [&_select]:bg-gray-50 [&_textarea]:bg-gray-50"
        )}
      >
        <Field label="Step Name">
          <input
            value={step.name}
            onChange={(e) => onPatch({ name: e.target.value })}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-violet-500 focus:outline-none"
          />
        </Field>

        <Field label="Step Type">
          <select
            value={step.type}
            onChange={(e) => setType(e.target.value as StepType)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-violet-500 focus:outline-none"
          >
            {Object.entries(STEP_TYPE_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Timeline Segment"
          icon={<CalendarClock size={12} />}
          hint="Days the step typically takes."
        >
          <input
            type="number"
            min={0}
            value={step.timelineDays}
            onChange={(e) =>
              onPatch({ timelineDays: Math.max(0, Number(e.target.value) || 0) })
            }
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-violet-500 focus:outline-none"
          />
        </Field>

        <Field label="Step Instruction" icon={<FileText size={12} />}>
          <textarea
            value={step.instruction}
            onChange={(e) => onPatch({ instruction: e.target.value })}
            rows={3}
            placeholder="What the reviewer should do at this step…"
            className="w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
          />
        </Field>

        <ReviewerSection step={step} reviewers={reviewers} onPatch={onPatch} />

        <EmailSection step={step} onPatch={onPatch} />

        {/* Type-specific config */}
        {step.type === "test" && (
          <TestConfig
            step={step}
            tests={tests}
            onChange={(testIds) => onPatch({ testIds })}
          />
        )}
        {step.type === "interview" && (
          <InterviewConfig
            step={step}
            scorecards={scorecards}
            criteriaLib={criteriaLib}
            onChange={onPatch}
          />
        )}
      </fieldset>

      {/* Footer — view-mode shows just Edit; edit-mode shows
       *  Reset / Cancel / Save. */}
      <div className="flex items-center justify-between gap-2 border-t border-gray-200 px-4 py-3">
        <div>
          {!isView && isDirtyVsDefault && (
            <button
              type="button"
              onClick={resetToDefault}
              className="inline-flex items-center gap-1 text-xs font-medium text-violet-700 hover:text-violet-900"
              title="Restore the values this step had when the flow template was applied."
            >
              ↺ Reset to default
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isView ? (
            <button
              onClick={enterEdit}
              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                onClick={cancelEdit}
                className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
              >
                Save
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * Reviewer section — multi-reviewer chips + allocation rules
 * ============================================================ */

function ReviewerSection({
  step,
  reviewers,
  onPatch,
}: {
  step: WorkflowStep;
  reviewers: Reviewer[];
  onPatch: (patch: Partial<WorkflowStep>) => void;
}) {
  // Resolve effective reviewer list (handles legacy single-reviewer field).
  const ids =
    step.reviewerIds ?? (step.reviewerId ? [step.reviewerId] : []);
  const reviewerById = new Map(reviewers.map((r) => [r.id, r]));
  const [pickerOpen, setPickerOpen] = useState(false);

  function setIds(next: string[]) {
    onPatch({ reviewerIds: next, reviewerId: undefined });
  }

  function addReviewer(id: string) {
    if (ids.includes(id)) return;
    setIds([...ids, id]);
    setPickerOpen(false);
  }

  function removeReviewer(id: string) {
    setIds(ids.filter((x) => x !== id));
  }

  function setRequireMin(n: number | undefined) {
    onPatch({ requireMinReviews: n });
  }

  function setMaxPerCandidate(n: number) {
    onPatch({ maxReviewersPerCandidate: Math.max(1, n) });
  }

  const requireOn = (step.requireMinReviews ?? 0) > 0;
  const maxPer = step.maxReviewersPerCandidate ?? Math.max(1, ids.length);

  return (
    <CollapsibleSection title="Reviewer" icon={<User size={14} />}>
      <Field label="Reviewers">
        <div className="flex flex-wrap gap-1.5 rounded-md border border-gray-300 bg-white p-1.5">
          {ids.length === 0 && (
            <span className="px-2 py-1 text-[11px] text-gray-400">
              No reviewers assigned.
            </span>
          )}
          {ids.map((id) => {
            const r = reviewerById.get(id);
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700"
              >
                <span
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[9px] font-semibold uppercase text-white"
                  aria-hidden
                >
                  {(r?.name ?? "?")
                    .split(" ")
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                {r?.name ?? id}
                <button
                  type="button"
                  onClick={() => removeReviewer(id)}
                  className="text-violet-500 hover:text-violet-700"
                  aria-label={`Remove ${r?.name ?? id}`}
                >
                  <X size={10} />
                </button>
              </span>
            );
          })}
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            className="inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-xs font-medium text-violet-600 hover:bg-violet-50"
          >
            <Plus size={11} />
            Add
          </button>
        </div>
        {pickerOpen && (
          <div className="mt-1 max-h-44 overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-sm">
            {reviewers
              .filter((r) => !ids.includes(r.id))
              .map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => addReviewer(r.id)}
                  className="flex w-full items-center justify-between px-3 py-1.5 text-left text-xs hover:bg-violet-50"
                >
                  <span className="font-medium text-gray-800">{r.name}</span>
                  <span className="text-[11px] text-gray-400">{r.role}</span>
                </button>
              ))}
          </div>
        )}
      </Field>

      <ToggleRow
        label="Auto Allocate Tasks"
        hint="Round-robin candidates across the assigned reviewers."
        value={Boolean(step.autoAllocate)}
        onChange={(v) => onPatch({ autoAllocate: v })}
      />

      <div className="flex items-center justify-between gap-3">
        <div className="text-xs">
          <p className="font-medium text-gray-700">Max Reviewers per Candidate</p>
          <p className="text-[11px] text-gray-500">
            Cap how many reviewers see any single candidate.
          </p>
        </div>
        <Stepper
          value={maxPer}
          min={1}
          max={Math.max(ids.length, 1)}
          onChange={setMaxPerCandidate}
        />
      </div>

      <ToggleRow
        label="Required Reviews"
        hint="Require N reviewers to complete before the candidate can advance."
        value={requireOn}
        onChange={(v) => setRequireMin(v ? 1 : undefined)}
      />
      {requireOn && (
        <div className="flex flex-wrap items-center gap-2 rounded-md bg-violet-50/60 px-3 py-2 text-xs text-gray-700">
          <span>Require</span>
          <Stepper
            value={step.requireMinReviews ?? 1}
            min={1}
            max={Math.max(maxPer, 1)}
            onChange={(n) => setRequireMin(n)}
            compact
          />
          <span>out of</span>
          <span className="rounded border border-gray-300 bg-white px-2 py-0.5 font-mono">
            {maxPer}
          </span>
          <span>reviewers to complete before moving step.</span>
        </div>
      )}
    </CollapsibleSection>
  );
}

/* ============================================================
 * Email section — template + auto-send + live preview
 * ============================================================ */

function EmailSection({
  step,
  onPatch,
}: {
  step: WorkflowStep;
  onPatch: (patch: Partial<WorkflowStep>) => void;
}) {
  const template = emailTemplates.find((t) => t.id === step.emailTemplateId);
  const autoSend = step.autoSendEmail ?? Boolean(step.emailTemplateId);
  return (
    <CollapsibleSection title="Email" icon={<Mail size={14} />}>
      <Field label="Email Template">
        <select
          value={step.emailTemplateId ?? ""}
          onChange={(e) =>
            onPatch({ emailTemplateId: e.target.value || undefined })
          }
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-violet-500 focus:outline-none"
        >
          <option value="">— None —</option>
          {emailTemplates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </Field>

      {step.emailTemplateId && (
        <ToggleRow
          label="Auto-send Email"
          hint="Send this email automatically when a candidate enters the step."
          value={autoSend}
          onChange={(v) => onPatch({ autoSendEmail: v })}
        />
      )}

      {template && (
        <div className="overflow-hidden rounded-md border border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between border-b border-gray-200 bg-white px-3 py-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              Preview
            </span>
            <span className="rounded bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-700">
              {template.name}
            </span>
          </div>
          <div className="space-y-2 p-3 text-xs">
            <div>
              <p className="text-[10px] font-semibold uppercase text-gray-400">
                Subject
              </p>
              <p className="text-gray-800">
                {renderEmailVars(template.subject)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase text-gray-400">
                Body
              </p>
              <pre className="whitespace-pre-wrap font-sans text-[11px] leading-relaxed text-gray-700">
                {renderEmailVars(template.body)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </CollapsibleSection>
  );
}

/** Replace `{Variable}` tokens in template text with violet inline chips. */
function renderEmailVars(text: string): React.ReactNode {
  const parts = text.split(/(\{[A-Za-z][\w]*\})/g);
  return parts.map((part, i) => {
    if (/^\{[A-Za-z][\w]*\}$/.test(part)) {
      return (
        <span
          key={i}
          className="mx-0.5 inline-flex items-center gap-0.5 rounded bg-violet-100 px-1 py-0.5 align-middle font-mono text-[10px] font-medium text-violet-700"
        >
          {"{*}"} {part.slice(1, -1)}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

/* ============================================================
 * Small primitives — toggle row + stepper
 * ============================================================ */

function ToggleRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1 text-xs">
        <p className="font-medium text-gray-700">{label}</p>
        {hint && <p className="mt-0.5 text-[11px] text-gray-500">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={cn(
          "mt-0.5 relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition",
          value ? "bg-violet-600" : "bg-gray-300"
        )}
      >
        <span
          className={cn(
            "inline-block h-3 w-3 transform rounded-full bg-white shadow transition",
            value ? "translate-x-3.5" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}

function Stepper({
  value,
  min,
  max,
  onChange,
  compact,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  compact?: boolean;
}) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <div
      className={cn(
        "inline-flex items-center overflow-hidden rounded-md border border-gray-300 bg-white",
        compact ? "h-6" : "h-7"
      )}
    >
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        className="px-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-30"
      >
        −
      </button>
      <span
        className={cn(
          "border-x border-gray-300 px-3 text-center font-mono text-xs text-gray-800",
          compact ? "py-0.5" : "py-1"
        )}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        className="px-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
}

/* ============================================================
 * Type === 'test' panel
 * ============================================================ */

function TestConfig({
  step,
  tests,
  onChange,
}: {
  step: WorkflowStep;
  tests: TestTemplate[];
  onChange: (testIds: string[]) => void;
}) {
  const selectedIds = step.testIds ?? [];
  const selected = selectedIds
    .map((id) => tests.find((t) => t.id === id))
    .filter((t): t is TestTemplate => Boolean(t));

  function add(id: string) {
    if (selectedIds.includes(id)) return;
    onChange([...selectedIds, id]);
  }

  function remove(id: string) {
    onChange(selectedIds.filter((x) => x !== id));
  }

  return (
    <CollapsibleSection
      title="Test pool"
      icon={<ClipboardCheck size={14} className="text-blue-600" />}
      tone="blue"
    >
      <p className="text-xs text-blue-900/80">
        Sessions are created per candidate from the tests selected here.
      </p>

      {selected.length === 0 ? (
        <div className="mt-3 space-y-3 rounded-md border-2 border-dashed border-blue-200 bg-white px-4 py-5">
          <div className="text-center">
            <ClipboardCheck size={20} className="mx-auto mb-2 text-blue-400" />
            <p className="text-sm font-medium text-gray-700">
              No tests linked to this step yet.
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Search the Test Bank to add the assessments candidates should
              take at this step.
            </p>
          </div>
          <AddTestSlot
            tests={tests}
            existingIds={selectedIds}
            onPick={(t) => add(t.id)}
          />
        </div>
      ) : (
        <>
          <div className="mt-3 space-y-1.5">
            {selected.map((t) => (
              <TestRow key={t.id} test={t} onRemove={() => remove(t.id)} />
            ))}
          </div>
          <AddTestSlot
            tests={tests}
            existingIds={selectedIds}
            onPick={(t) => add(t.id)}
          />
        </>
      )}
    </CollapsibleSection>
  );
}

function TestRow({
  test,
  onRemove,
}: {
  test: TestTemplate;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-white px-2 py-1.5">
      <GripVertical size={12} className="text-gray-300" />
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">
        {test.name}
      </span>
      <div className="flex shrink-0 items-center gap-1">
        {test.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700"
          >
            {tag}
          </span>
        ))}
        {test.tags.length > 3 && (
          <span className="text-[10px] text-gray-400">
            +{test.tags.length - 3}
          </span>
        )}
      </div>
      <span className="text-[10px] text-gray-500">
        {test.durationMinutes}m · {test.questionCount}q
      </span>
      <button
        onClick={onRemove}
        className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
        aria-label="Remove test"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

/** Inline "+ Add Test" pill mirroring the AddCriterionSlot pattern.
 *  Default state is a dashed full-width button; clicking it expands
 *  inline into a search field that filters the test bank, hiding tests
 *  already on this step. Unlike criteria, there is no "create new" path
 *  — tests are managed in the Test Bank, not minted inline. */
function AddTestSlot({
  tests,
  existingIds,
  onPick,
}: {
  tests: TestTemplate[];
  existingIds: string[];
  onPick: (t: TestTemplate) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const term = q.trim();
  const lower = term.toLowerCase();
  const taken = new Set(existingIds);
  const filtered = tests
    .filter((t) => !taken.has(t.id))
    .filter((t) => {
      if (lower.length === 0) return true;
      return (
        t.name.toLowerCase().includes(lower) ||
        t.category.toLowerCase().includes(lower) ||
        t.tags.some((tag) => tag.toLowerCase().includes(lower))
      );
    })
    .slice(0, 8);

  function pick(t: TestTemplate) {
    onPick(t);
    setQ("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md border-2 border-dashed border-blue-300 bg-blue-50/40 px-3 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
      >
        <Plus size={14} />
        Add Test
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-md border-2 border-dashed border-blue-300 bg-white p-2">
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search the Test Bank by name, category, or tag…"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setQ("");
            setOpen(false);
          } else if (e.key === "Enter" && filtered.length > 0) {
            e.preventDefault();
            pick(filtered[0]);
          }
        }}
        className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
      />
      <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto">
        {filtered.map((t) => (
          <li key={t.id}>
            <button
              onClick={() => pick(t)}
              className="flex w-full items-center justify-between gap-3 rounded-md border border-gray-200 px-3 py-1.5 text-left text-xs hover:border-blue-300 hover:bg-blue-50"
            >
              <span className="flex flex-1 items-center gap-1.5">
                <span className="font-medium text-gray-800">{t.name}</span>
                {t.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </span>
              <span className="shrink-0 text-[10px] text-gray-500">
                {t.durationMinutes}m · {t.questionCount}q
              </span>
            </button>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="px-3 py-1.5 text-xs text-gray-400">
            {term.length === 0
              ? "All tests are already linked. Manage tests in the Test Bank."
              : "No tests match. Manage tests in the Test Bank."}
          </li>
        )}
      </ul>
      <div className="mt-2 flex justify-end">
        <button
          onClick={() => {
            setQ("");
            setOpen(false);
          }}
          className="rounded-md px-2 py-1 text-[11px] text-gray-500 hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ============================================================
 * Type === 'interview' panel — scorecard + criteria
 * ============================================================ */

function InterviewConfig({
  step,
  scorecards,
  criteriaLib,
  onChange,
}: {
  step: WorkflowStep;
  scorecards: ScorecardTemplate[];
  criteriaLib: CriterionTemplate[];
  onChange: (patch: Partial<WorkflowStep>) => void;
}) {
  const { showToast } = useToast();
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);

  async function applyScorecard(templateId: string) {
    if (!templateId) {
      onChange({ scorecard: undefined });
      return;
    }
    if (step.scorecard && step.scorecard.criteria.length > 0) {
      // Open the custom Replace modal instead of native confirm.
      setPendingTemplateId(templateId);
      return;
    }
    await doApplyScorecard(templateId);
  }

  async function doApplyScorecard(templateId: string) {
    const res = await fetch(`/api/scorecard-templates/${templateId}`);
    if (!res.ok) {
      showToast("error", "Failed to load scorecard template.");
      return;
    }
    const { template } = (await res.json()) as { template: ScorecardTemplate };
    onChange({
      scorecard: {
        templateId: template.id,
        criteria: template.criteria.map<ScorecardCriterion>((c) => ({
          id: `crit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          templateId: c.id,
          name: c.name,
          weight: c.weight,
          description: c.description,
          categories: c.categories,
        })),
      },
    });
  }

  function setCriteria(criteria: ScorecardCriterion[]) {
    if (!step.scorecard) return;
    onChange({ scorecard: { ...step.scorecard, criteria } });
  }

  function addFromLibrary(c: CriterionTemplate) {
    const fresh: ScorecardCriterion = {
      id: `crit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      templateId: c.id,
      name: c.name,
      weight: c.weight,
      description: c.description,
      categories: c.categories,
    };
    if (!step.scorecard) {
      // No scorecard yet — start one with just this criterion.
      onChange({ scorecard: { templateId: "", criteria: [fresh] } });
      return;
    }
    setCriteria([...step.scorecard.criteria, fresh]);
  }

  function updateCriterion(id: string, patch: Partial<ScorecardCriterion>) {
    if (!step.scorecard) return;
    setCriteria(
      step.scorecard.criteria.map((c) => (c.id === id ? { ...c, ...patch } : c))
    );
  }

  function deleteCriterion(id: string) {
    if (!step.scorecard) return;
    setCriteria(step.scorecard.criteria.filter((c) => c.id !== id));
  }

  function moveCriterion(id: string, dir: -1 | 1) {
    if (!step.scorecard) return;
    const all = step.scorecard.criteria;
    const idx = all.findIndex((c) => c.id === id);
    const t = idx + dir;
    if (idx < 0 || t < 0 || t >= all.length) return;
    const next = [...all];
    [next[idx], next[t]] = [next[t], next[idx]];
    setCriteria(next);
  }

  const hasCriteria = (step.scorecard?.criteria.length ?? 0) > 0;

  return (
    <>
      <CollapsibleSection
        title="Interview Settings"
        icon={<ClipboardCheck size={14} className="text-violet-600" />}
        tone="violet"
      >
        <p className="text-xs text-violet-900/80">
          Select the criteria that the judges need to score in this round. These
          criteria will appear on their evaluation form.
        </p>

        <div className="mt-3">
          <Field label="Scorecard template">
            <select
              value={step.scorecard?.templateId ?? ""}
              onChange={(e) => applyScorecard(e.target.value)}
              className="w-full rounded-md border border-violet-200 bg-white px-2.5 py-1.5 text-sm focus:border-violet-500 focus:outline-none"
            >
              <option value="">— No scorecard —</option>
              {scorecards.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          {hasCriteria && (
            <p className="mt-1 flex items-center gap-1 text-[11px] text-amber-700">
              <AlertTriangle size={11} />
              Switching template replaces all criteria below.
            </p>
          )}
        </div>

        {!hasCriteria ? (
          <div className="mt-4 space-y-3 rounded-md border-2 border-dashed border-violet-200 bg-white px-4 py-5">
            <div className="text-center">
              <Sparkles size={20} className="mx-auto mb-2 text-violet-400" />
              <p className="text-sm font-medium text-gray-700">
                This interview settings does not have criteria yet.
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Search the library or create a new criterion to complete the
                evaluation form.
              </p>
            </div>
            <AddCriterionSlot
              criteriaLib={criteriaLib}
              existingTemplateIds={[]}
              onPick={addFromLibrary}
            />
          </div>
        ) : (
          <>
            <div className="mt-3 space-y-1.5">
              {step.scorecard!.criteria.map((c, i) => (
                <CriterionRow
                  key={c.id}
                  criterion={c}
                  index={i}
                  total={step.scorecard!.criteria.length}
                  onChange={(patch) => updateCriterion(c.id, patch)}
                  onDelete={() => deleteCriterion(c.id)}
                  onMove={(d) => moveCriterion(c.id, d)}
                />
              ))}
            </div>

            <AddCriterionSlot
              criteriaLib={criteriaLib}
              existingTemplateIds={step
                .scorecard!.criteria.map((c) => c.templateId)
                .filter((id): id is string => Boolean(id))}
              onPick={addFromLibrary}
            />
          </>
        )}
      </CollapsibleSection>

      {pendingTemplateId && step.scorecard && (
        <ReplaceScorecardModal
          existingCount={step.scorecard.criteria.length}
          onCancel={() => setPendingTemplateId(null)}
          onConfirm={async () => {
            await doApplyScorecard(pendingTemplateId);
            setPendingTemplateId(null);
          }}
        />
      )}
    </>
  );
}

function CriterionRow({
  criterion,
  index,
  total,
  onChange,
  onDelete,
  onMove,
}: {
  criterion: ScorecardCriterion;
  index: number;
  total: number;
  onChange: (patch: Partial<ScorecardCriterion>) => void;
  onDelete: () => void;
  onMove: (d: -1 | 1) => void;
}) {
  const cats = criterion.categories ?? [];
  // Inline-created criteria carry no categories; show a "new" tag so
  // the user can spot which ones they minted vs picked from the library.
  const isNew = cats.length === 0;
  return (
    <div className="flex items-center gap-2 rounded-md border border-violet-200 bg-white px-2 py-1.5">
      <GripVertical size={12} className="text-gray-300" />
      <input
        value={criterion.name}
        onChange={(e) => onChange({ name: e.target.value })}
        className="min-w-0 flex-1 rounded-sm border border-transparent bg-transparent px-1.5 py-0.5 text-sm hover:border-gray-200 focus:border-violet-500 focus:outline-none"
      />
      <div className="flex shrink-0 items-center gap-1">
        {isNew ? (
          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
            new
          </span>
        ) : (
          cats.map((cat) => (
            <span
              key={cat}
              className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600"
            >
              {cat}
            </span>
          ))
        )}
      </div>
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => onMove(-1)}
          disabled={index === 0}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30"
          aria-label="Move up"
        >
          <ChevronUp size={12} />
        </button>
        <button
          onClick={() => onMove(1)}
          disabled={index === total - 1}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30"
          aria-label="Move down"
        >
          <ChevronDown size={12} />
        </button>
        <button
          onClick={onDelete}
          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
          aria-label="Delete"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

/** Inline "+ Add New Criteria" pill rendered as the last slot of the
 *  criteria list. Default state is a dashed full-width button; clicking
 *  it expands inline into a search field that:
 *   - filters the criteria library as you type
 *   - hides items already on this scorecard so the same one isn't
 *     accidentally picked twice
 *   - offers a "Create '<term>'" row when the search has no exact match
 *  Picking either flow calls onPick with a CriterionTemplate (the
 *  parent turns that into a fresh ScorecardCriterion). */
function AddCriterionSlot({
  criteriaLib,
  existingTemplateIds,
  onPick,
}: {
  criteriaLib: CriterionTemplate[];
  existingTemplateIds: string[];
  onPick: (c: CriterionTemplate) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const term = q.trim();
  const lower = term.toLowerCase();
  const taken = new Set(existingTemplateIds);
  const filtered = criteriaLib
    .filter((c) => !taken.has(c.id))
    .filter((c) => c.name.toLowerCase().includes(lower))
    .slice(0, 8);
  const canCreateNew =
    term.length > 0 &&
    !criteriaLib.some((c) => c.name.toLowerCase() === lower);

  function pick(c: CriterionTemplate) {
    onPick(c);
    setQ("");
    setOpen(false);
  }

  function createNew() {
    onPick({
      id: `crit-tpl-custom-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 6)}`,
      name: term,
      categories: [],
      weight: 3,
      description: "",
    });
    setQ("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md border-2 border-dashed border-violet-300 bg-violet-50/40 px-3 py-2.5 text-sm font-medium text-violet-700 hover:bg-violet-100"
      >
        <Plus size={14} />
        Add New Criteria
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-md border-2 border-dashed border-violet-300 bg-white p-2">
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search the library, or type to create a new criterion…"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setQ("");
            setOpen(false);
          } else if (
            e.key === "Enter" &&
            filtered.length === 0 &&
            canCreateNew
          ) {
            e.preventDefault();
            createNew();
          } else if (e.key === "Enter" && filtered.length > 0) {
            e.preventDefault();
            pick(filtered[0]);
          }
        }}
        className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm focus:border-violet-500 focus:outline-none"
      />
      <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto">
        {filtered.map((c) => (
          <li key={c.id}>
            <button
              onClick={() => pick(c)}
              className="flex w-full items-center justify-between gap-3 rounded-md border border-gray-200 px-3 py-1.5 text-left text-xs hover:border-violet-300 hover:bg-violet-50"
            >
              <span className="flex flex-1 items-center gap-1.5">
                <span className="font-medium text-gray-800">{c.name}</span>
                {c.categories.map((cat) => (
                  <span
                    key={cat}
                    className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600"
                  >
                    {cat}
                  </span>
                ))}
              </span>
            </button>
          </li>
        ))}
        {canCreateNew && (
          <li>
            <button
              onClick={createNew}
              className="flex w-full items-center gap-2 rounded-md border border-dashed border-violet-300 bg-violet-50/50 px-3 py-1.5 text-left text-xs text-violet-700 hover:bg-violet-100"
            >
              <Plus size={12} />
              Create &ldquo;<span className="font-semibold">{term}</span>
              &rdquo; as new criterion
            </button>
          </li>
        )}
        {filtered.length === 0 && !canCreateNew && (
          <li className="px-3 py-1.5 text-xs text-gray-400">
            Type to search the library or create a new criterion.
          </li>
        )}
      </ul>
      <div className="mt-2 flex justify-end">
        <button
          onClick={() => {
            setQ("");
            setOpen(false);
          }}
          className="rounded-md px-2 py-1 text-[11px] text-gray-500 hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function ReplaceScorecardModal({
  existingCount,
  onCancel,
  onConfirm,
}: {
  existingCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <AlertTriangle size={18} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900">
              Replace the current criteria?
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              The {existingCount} criteria you have just set will be deleted and
              overwritten by the criteria from the new Scorecard. Are you sure
              you want to proceed?
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Yes, Replace
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * Bits
 * ============================================================ */

function Field({
  label,
  icon,
  hint,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-600">
        {icon}
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

function CollapsibleSection({
  title,
  icon,
  tone,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  tone?: "violet" | "blue";
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div
      className={cn(
        "rounded-lg border bg-white",
        tone === "violet" && "border-violet-200 bg-violet-50/40",
        tone === "blue" && "border-blue-200 bg-blue-50/40",
        !tone && "border-gray-200"
      )}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-gray-800">
          {icon}
          {title}
        </span>
        {open ? <ChevronUp size={14} /> : <ChevronRight size={14} />}
      </button>
      {open && <div className="space-y-3 px-3 pb-3">{children}</div>}
    </div>
  );
}
