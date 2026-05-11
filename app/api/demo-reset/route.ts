import { NextResponse } from "next/server";
import { resetProgramsStore } from "@/entities/program/api/fixtures";
import { resetCandidatesStore } from "@/entities/candidate/api/fixtures";
import { resetCriterionTemplatesStore } from "@/entities/criterion-template/api/fixtures";
import { resetScorecardTemplatesStore } from "@/entities/scorecard-template/api/fixtures";
import { resetSystemUsersStore } from "@/entities/system-user/api/fixtures";
import { resetSystemRolesStore } from "@/entities/system-role/api/fixtures";
import { resetJobTemplatesStore } from "@/entities/job-template/api/fixtures";

/** Wipe every in-memory entity store and re-seed it from the canonical
 *  fixtures. Wired to the "Reset demo data" button on the Programs page
 *  so fixture-level changes (criterion categories, candidate note
 *  content, email replies, scorecard tweaks, etc.) take effect without
 *  restarting the dev server.
 *
 *  Mock-only — there is no real backend; this is just for the demo. */
export function POST() {
  const programs = resetProgramsStore();
  const candidates = resetCandidatesStore();
  const criteria = resetCriterionTemplatesStore();
  const scorecards = resetScorecardTemplatesStore();
  const users = resetSystemUsersStore();
  const roles = resetSystemRolesStore();
  const jobTemplates = resetJobTemplatesStore();
  return NextResponse.json({
    ok: true,
    programs: programs.length,
    candidates: candidates.length,
    criteria: criteria.length,
    scorecards: scorecards.length,
    users: users.length,
    roles: roles.length,
    jobTemplates: jobTemplates.length,
  });
}
