import { NextResponse } from "next/server";
import {
  getSession,
  getTest,
  listSubmissions,
} from "@/entities/test/api/fixtures";

/** Per-session detail: the session itself, its test, and the list of
 *  submissions scoped to that session. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = getSession(sessionId);
  if (!session)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const test = getTest(session.testId);
  const submissions = listSubmissions(sessionId);
  return NextResponse.json({ session, test, submissions });
}
