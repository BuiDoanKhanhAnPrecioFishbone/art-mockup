import { NextResponse } from "next/server";
import { addSession, listSessions } from "@/entities/test/api/fixtures";
import type { TestSession } from "@/entities/test";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json({ sessions: listSessions(id) });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await req.json()) as Partial<TestSession>;
  if (!body.name?.trim()) {
    return NextResponse.json(
      { error: "Session title is required." },
      { status: 400 }
    );
  }
  const sessionId = `sess-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
  const session: TestSession = {
    id: sessionId,
    testId: id,
    name: body.name.trim(),
    type: body.type ?? "Public",
    // Newly-created sessions always start as Upcoming. Activation
    // happens automatically when start_time arrives (Public/Private)
    // or HR clicks Start (Onsite). Doc 07.
    status: body.status ?? "Upcoming",
    accessCode:
      body.accessCode?.trim() ||
      Math.random().toString(36).slice(2, 8),
    description: body.description ?? "",
    refreshAccessCodeMinutes: body.refreshAccessCodeMinutes ?? 0,
    startISO: body.startISO ?? new Date().toISOString(),
    endISO:
      body.endISO ??
      new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
  };
  addSession(session);
  return NextResponse.json({ session }, { status: 201 });
}
