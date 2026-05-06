import { NextResponse } from "next/server";
import { addCandidate, listCandidates } from "@/entities/candidate/api/fixtures";
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
    currentStageId: body.currentStageId ?? "",
    currentStepId: body.currentStepId ?? "",
    reviewerIds: body.reviewerIds ?? [],
    pendingEmailCount: body.pendingEmailCount ?? 0,
    hasNote: body.hasNote ?? false,
  };
  addCandidate(candidate);
  return NextResponse.json({ candidate }, { status: 201 });
}
