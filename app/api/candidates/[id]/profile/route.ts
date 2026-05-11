import { NextResponse } from "next/server";
import { getCandidate } from "@/entities/candidate/api/fixtures";
import {
  defaultProfileFor,
  getCandidateProfile,
  upsertCandidateProfile,
} from "@/entities/candidate/api/profile-fixtures";

/** GET → resolve the candidate's full profile (synthesising a minimal
 *  one when the seed didn't include rich content for that candidate). */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const candidate = getCandidate(id);
  if (!candidate)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const profile =
    getCandidateProfile(id) ??
    defaultProfileFor(id, candidate.name, candidate.email);
  return NextResponse.json({ profile });
}

/** PATCH → partial-merge of the candidate's profile sections. The
 *  client posts whichever subset of fields it wants to mutate (e.g.
 *  just the education array after editing one entry). */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const candidate = getCandidate(id);
  if (!candidate)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const patch = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const current =
    getCandidateProfile(id) ??
    defaultProfileFor(id, candidate.name, candidate.email);
  const next = {
    ...current,
    ...patch,
    candidateId: id,
    general: { ...current.general, ...((patch.general ?? {}) as object) },
  };
  upsertCandidateProfile(next as typeof current);
  return NextResponse.json({ profile: next });
}
