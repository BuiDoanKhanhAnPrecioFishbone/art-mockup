import { NextResponse } from "next/server";
import {
  deleteCandidate,
  getCandidate,
  listCandidates,
  updateCandidate,
} from "@/entities/candidate/api/fixtures";
import { pickReviewer } from "@/entities/candidate/api/auto-assign";
import { getProgram } from "@/entities/program/api/fixtures";
import { newStatusEvent } from "@/shared/types/audit";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const c = getCandidate(id);
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ candidate: c });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const existing = getCandidate(id);
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const patch = await req.json();

  // If the patch moves the candidate to a different step, re-run the
  // auto-assignment algorithm (Doc 02 §2.4): pick the reviewer with the
  // fewest active candidates in the new step, tie-break on lower id.
  // The client-supplied `reviewerIds` is ignored on a step move so this
  // rule stays consistent regardless of caller (drag-drop, MoveToStep
  // modal, Pass action).
  const movingSteps =
    typeof patch.currentStepId === "string" &&
    patch.currentStepId !== existing.currentStepId;
  const movingStages =
    typeof patch.currentStageId === "string" &&
    patch.currentStageId !== existing.currentStageId;

  if (movingSteps || movingStages) {
    const program = getProgram(existing.programId);
    if (program) {
      const targetStageId = patch.currentStageId ?? existing.currentStageId;
      const targetStepId = patch.currentStepId ?? existing.currentStepId;
      const stage = program.workflow?.stages.find(
        (s) => s.id === targetStageId
      );
      const step = stage?.steps.find((s) => s.id === targetStepId);
      if (stage && step) {
        const otherCandidates = listCandidates(existing.programId).filter(
          (c) => c.id !== existing.id
        );
        const reviewerIds = pickReviewer(step, stage, otherCandidates);
        if (reviewerIds.length === 0) {
          return NextResponse.json(
            {
              error:
                "Target step has no reviewers configured — cannot move candidate.",
            },
            { status: 409 }
          );
        }
        patch.reviewerIds = reviewerIds;
        patch.currentStageId = targetStageId;
        patch.currentStepId = targetStepId;
      }
    }
  }

  // Doc 10 — every status change is logged with actor, timestamp,
  // prev, new, reason. The reason comes from `patch.stepResult` (set
  // by the Change Status modal) when present.
  if (
    typeof patch.status === "string" &&
    patch.status !== existing.status
  ) {
    const event = newStatusEvent(
      existing.status,
      patch.status,
      "hr-current-user",
      patch.stepResult
    );
    patch.statusHistory = [...(existing.statusHistory ?? []), event];
  }

  const updated = updateCandidate(id, patch);
  if (!updated)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ candidate: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ok = deleteCandidate(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
