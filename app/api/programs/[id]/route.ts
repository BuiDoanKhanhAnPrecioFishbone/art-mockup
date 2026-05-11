import { NextResponse } from "next/server";
import {
  deleteProgram,
  getProgram,
  updateProgram,
} from "@/entities/program/api/fixtures";
import { listCandidates } from "@/entities/candidate/api/fixtures";
import type { Program, WorkflowStep } from "@/entities/program";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const program = getProgram(id);
  if (!program) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ program });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const existing = getProgram(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const patch = (await req.json()) as Partial<Program>;

  // Doc 02 §2.2: step type is immutable once any candidate has entered
  // or passed through that step. Diff the workflow against the saved
  // copy and reject the patch if any step's type would change while a
  // candidate references that step. Stage / step deletes are not
  // checked here — they're handled separately by the soft-delete rule.
  if (patch.workflow?.stages) {
    const candidates = listCandidates(id);
    const oldSteps = new Map<string, WorkflowStep>();
    for (const stage of existing.workflow?.stages ?? []) {
      for (const step of stage.steps) oldSteps.set(step.id, step);
    }
    for (const stage of patch.workflow.stages) {
      for (const step of stage.steps) {
        const prev = oldSteps.get(step.id);
        if (!prev) continue;
        if (prev.type === step.type) continue;
        const occupied = candidates.some(
          (c) => c.currentStepId === step.id
        );
        if (occupied) {
          return NextResponse.json(
            {
              error: `Step "${step.name}" type cannot be changed — at least one candidate is currently in that step.`,
            },
            { status: 409 }
          );
        }
      }
    }
  }

  const updated = updateProgram(id, patch);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ program: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const program = getProgram(id);
  if (!program) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  // Business rule: cannot delete a program currently open for recruitment.
  if (program.status === "active") {
    return NextResponse.json(
      {
        error:
          "Cannot delete because it is currently open for recruitment.",
      },
      { status: 409 }
    );
  }
  deleteProgram(id);
  return NextResponse.json({ ok: true });
}
