import { NextResponse } from "next/server";
import {
  listSessions,
  listSubmissions,
  listTests,
} from "@/entities/test/api/fixtures";

/** Top-level Submissions index — returns one row per session, with the
 *  test it belongs to and a quick aggregate of submissions inside it.
 *  Drives the `/submissions` list. */
export function GET() {
  const sessions = listSessions();
  const tests = listTests();
  const testById = new Map(tests.map((t) => [t.id, t]));
  const rows = sessions.map((s) => {
    const subs = listSubmissions(s.id);
    return {
      session: s,
      test: testById.get(s.testId) ?? null,
      submissionsTotal: subs.length,
      submissionsSubmitted: subs.filter(
        (sub) => sub.status === "submitted" || sub.status === "graded"
      ).length,
      submissionsInProgress: subs.filter((sub) => sub.status === "in-progress")
        .length,
    };
  });
  return NextResponse.json({ rows });
}
