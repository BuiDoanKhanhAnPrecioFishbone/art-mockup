import { NextResponse } from "next/server";
import { listSessions } from "@/entities/test/api/fixtures";

/** Candidate access lookup. Matches the access code typed on the
 *  Test Entry screen against the fixture session list and returns the
 *  resolved session id so the front-end can route into the overview. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    code?: string;
    email?: string;
    name?: string;
  };
  const code = (body.code ?? "").trim();
  const email = (body.email ?? "").trim();
  if (!code || !email) {
    return NextResponse.json(
      { error: "Email and access code are required." },
      { status: 400 }
    );
  }
  const session = listSessions().find(
    (s) => s.accessCode.toLowerCase() === code.toLowerCase()
  );
  if (!session) {
    return NextResponse.json(
      { error: "Access code not found. Double-check the code in your invite." },
      { status: 404 }
    );
  }
  return NextResponse.json({
    sessionId: session.id,
    sessionType: session.type,
    sessionStatus: session.status,
  });
}
