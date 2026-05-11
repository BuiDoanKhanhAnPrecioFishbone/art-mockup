import { NextResponse } from "next/server";
import { getTest, listSessions } from "@/entities/test/api/fixtures";

/** Demo-only helper that lists every seeded session with its access
 *  code, type, status, and the underlying test title. Powers the
 *  "Demo helper" picker on `/take` so the demo viewer can grab a real
 *  access code without leaving the page.
 *
 *  Not part of the real product — this would be a security hole
 *  there. Safe in the mockup because there's no real candidate data. */
export async function GET() {
  const sessions = listSessions().map((s) => ({
    id: s.id,
    accessCode: s.accessCode,
    type: s.type,
    status: s.status,
    name: s.name,
    testTitle: getTest(s.testId)?.title ?? null,
  }));
  return NextResponse.json({ sessions });
}
