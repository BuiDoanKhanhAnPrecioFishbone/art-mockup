import { NextResponse } from "next/server";
import {
  addCandidate,
  listCandidates,
} from "@/entities/candidate/api/fixtures";
import { autoAssignNewEntry } from "@/entities/candidate/api/auto-assign";
import { getProgram } from "@/entities/program/api/fixtures";
import type { Candidate } from "@/entities/candidate";

export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const programId = searchParams.get("programId");
  if (!programId) {
    return NextResponse.json(
      { error: "programId query param is required" },
      { status: 400 }
    );
  }
  return NextResponse.json({ candidates: listCandidates(programId) });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<Candidate>;
  if (!body.name?.trim() || !body.email?.trim() || !body.programId) {
    return NextResponse.json(
      { error: "name, email and programId are required." },
      { status: 400 }
    );
  }

  // Server-enforced invariant (Doc 02 §2.3): every entry — manual,
  // SharePoint, public form — lands at the first step of the first
  // stage AND gets an auto-assigned reviewer based on current
  // workload. Client-provided `currentStageId/currentStepId/reviewerIds`
  // are ignored to keep this rule consistent across entry routes.
  const program = getProgram(body.programId);
  if (!program) {
    return NextResponse.json(
      { error: "Program not found." },
      { status: 404 }
    );
  }
  const existing = listCandidates(body.programId);
  const placement = autoAssignNewEntry(program, existing);
  if (!placement.stageId || !placement.stepId) {
    return NextResponse.json(
      {
        error:
          "Program has no workflow stages or steps configured — cannot accept new candidates.",
      },
      { status: 409 }
    );
  }
  if (placement.reviewerIds.length === 0) {
    return NextResponse.json(
      {
        error:
          "First step has no reviewers assigned. Configure a reviewer before accepting candidates.",
      },
      { status: 409 }
    );
  }

  const id = `cnd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const candidate: Candidate = {
    id,
    programId: body.programId,
    name: body.name.trim(),
    email: body.email.trim(),
    status: body.status ?? "on-going",
    skillsMatchPercent: body.skillsMatchPercent ?? 0,
    groupLabel: body.groupLabel,
    bookedDateISO: body.bookedDateISO,
    bookedTime: body.bookedTime,
    stepResult: body.stepResult,
    currentStageId: placement.stageId,
    currentStepId: placement.stepId,
    reviewerIds: placement.reviewerIds,
    pendingEmailCount: body.pendingEmailCount ?? 0,
    hasNote: body.hasNote ?? false,
    addedAtISO: body.addedAtISO,
  };
  addCandidate(candidate);
  return NextResponse.json({ candidate }, { status: 201 });
}
