import { NextResponse } from "next/server";
import {
  deleteCVRecord,
  getCVRecord,
} from "@/entities/cv-record/api/fixtures";
import {
  addCandidate,
  listCandidates,
} from "@/entities/candidate/api/fixtures";
import { autoAssignNewEntry } from "@/entities/candidate/api/auto-assign";
import { getProgram } from "@/entities/program/api/fixtures";
import type { Candidate } from "@/entities/candidate";

/**
 * POST /api/cvs/[id]/promote
 *
 * Move a parsed CV out of the staging tab and into the program's
 * pipeline. Per Doc 02 §2.3 the candidate is **always** placed at the
 * first step of the first stage with the auto-assigned reviewer; the
 * client cannot pick a stage / step / reviewer here.
 *
 * Side effects:
 *   - Creates a Candidate
 *   - Deletes the source CV record
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as Partial<Candidate> & {
    overrides?: Partial<Candidate>;
  };

  const cv = getCVRecord(id);
  if (!cv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const overrides = body.overrides ?? body;
  const programId =
    cv.programId === "*" ? overrides.programId ?? "*" : cv.programId;

  if (programId === "*" || !programId) {
    return NextResponse.json(
      { error: "Program id is required when promoting a cross-program CV." },
      { status: 400 }
    );
  }

  const program = getProgram(programId);
  if (!program) {
    return NextResponse.json(
      { error: "Program not found." },
      { status: 404 }
    );
  }
  const existing = listCandidates(programId);
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
          "First step has no reviewers assigned. Configure a reviewer before promoting candidates.",
      },
      { status: 409 }
    );
  }

  const candidate: Candidate = {
    id: `cnd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    programId,
    name: overrides.name?.trim() || cv.parsedName?.trim() || "Unnamed",
    email: overrides.email?.trim() || cv.parsedEmail?.trim() || "",
    status: overrides.status ?? "on-going",
    skillsMatchPercent:
      overrides.skillsMatchPercent ??
      Math.min(
        100,
        Math.round(
          (cv.skills.filter((s) => s.inProgramSkillSet).length /
            Math.max(1, cv.skills.length)) *
            100
        )
      ),
    groupLabel: overrides.groupLabel,
    bookedDateISO: overrides.bookedDateISO,
    bookedTime: overrides.bookedTime,
    stepResult: overrides.stepResult,
    currentStageId: placement.stageId,
    currentStepId: placement.stepId,
    reviewerIds: placement.reviewerIds,
    pendingEmailCount: overrides.pendingEmailCount ?? 0,
    hasNote: overrides.hasNote ?? false,
  };

  addCandidate(candidate);
  deleteCVRecord(id);

  return NextResponse.json({ candidate }, { status: 201 });
}
