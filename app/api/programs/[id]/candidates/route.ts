import { NextResponse } from "next/server";
import { getProgram } from "@/entities/program/api/fixtures";
import { listCandidates } from "@/entities/candidate/api/fixtures";

/** All candidates currently attached to a program. Used by the
 *  Comparison Hub on the Pipeline & Review tab to enumerate
 *  comparable candidates. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const program = getProgram(id);
  if (!program)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ candidates: listCandidates(id) });
}
