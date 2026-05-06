import { NextResponse } from "next/server";
import {
  deleteCVRecord,
  getCVRecord,
} from "@/entities/cv-record/api/fixtures";
import { addCandidate } from "@/entities/candidate/api/fixtures";
import type { Candidate } from "@/entities/candidate";

/**
 * POST /api/cvs/[id]/promote
 *
 * Move a parsed CV out of the staging tab and into the program's pipeline.
 * Body may include optional `currentStageId` / `currentStepId` so the
 * client can target a specific column; otherwise the candidate is
 * dropped on whatever the request specifies (or empty strings, which the
 * grid handles gracefully).
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

  const candidate: Candidate = {
    id: `cnd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    programId: cv.programId === "*" ? overrides.programId ?? "*" : cv.programId,
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
    currentStageId: overrides.currentStageId ?? "",
    currentStepId: overrides.currentStepId ?? "",
    reviewerIds: overrides.reviewerIds ?? [],
    pendingEmailCount: overrides.pendingEmailCount ?? 0,
    hasNote: overrides.hasNote ?? false,
  };

  addCandidate(candidate);
  deleteCVRecord(id);

  return NextResponse.json({ candidate }, { status: 201 });
}
