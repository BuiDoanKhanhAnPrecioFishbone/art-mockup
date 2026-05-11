import { NextResponse } from "next/server";
import {
  getCandidate,
  listAllCandidates,
} from "@/entities/candidate/api/fixtures";
import {
  defaultProfileFor,
  getCandidateProfile,
} from "@/entities/candidate/api/profile-fixtures";
import { getProgram } from "@/entities/program/api/fixtures";

/** Demo candidate id — the "logged-in" candidate when the viewer
 *  switches the role to Candidate. Hardcoded to cnd-bao because
 *  that's the most-seeded candidate in the fixtures (full profile,
 *  pipeline, emails, and application history). The header can be
 *  overridden with `x-demo-candidate-id` for future flexibility. */
const DEMO_CANDIDATE_ID = "cnd-bao";

/** Returns everything the candidate-facing surfaces need in one
 *  round-trip: the candidate's own profile + the list of programs
 *  they're currently applied to (each with their current step name,
 *  not reviewer-facing data). Used by /my/applications and
 *  /my/profile. */
export async function GET(req: Request) {
  const overrideId = req.headers.get("x-demo-candidate-id");
  const id = overrideId ?? DEMO_CANDIDATE_ID;
  const candidate = getCandidate(id);
  if (!candidate)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const profile =
    getCandidateProfile(id) ??
    defaultProfileFor(id, candidate.name, candidate.email);

  // The candidate's currently-active applications (one row per
  // program they're a candidate in). Public-facing fields only —
  // we strip workflow internals on the way out.
  const myRows = listAllCandidates().filter(
    (c) => c.email === candidate.email
  );
  const applications = myRows
    .map((row) => {
      const program = getProgram(row.programId);
      if (!program) return null;
      const stage = program.workflow?.stages.find(
        (s) => s.id === row.currentStageId
      );
      const step = stage?.steps.find((s) => s.id === row.currentStepId);
      return {
        candidateId: row.id,
        program: {
          id: program.id,
          title: program.title,
          position: program.position,
          level: program.level,
          startDate: program.startDate,
          endDate: program.endDate,
          status: program.status,
          description: program.description ?? null,
          location: program.location ?? null,
          employmentType: program.employmentType ?? null,
        },
        currentStage: stage ? { id: stage.id, name: stage.name } : null,
        currentStep: step ? { id: step.id, name: step.name, type: step.type } : null,
        status: row.status,
        addedAtISO: row.addedAtISO ?? null,
      };
    })
    .filter((a): a is NonNullable<typeof a> => a !== null);

  return NextResponse.json({
    candidate: {
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
    },
    profile,
    applications,
  });
}
