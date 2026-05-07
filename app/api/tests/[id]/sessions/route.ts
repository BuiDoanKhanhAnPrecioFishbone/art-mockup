import { NextResponse } from "next/server";
import { listSessions, addSession } from "@/entities/test/api/fixtures";
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
  const sessionId = `sess-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
  const session: TestSession = {
    id: sessionId,
    testId: id,
    name: body.name?.trim() || "New Session",
    type: body.type ?? "Public",
    status: body.status ?? "Active",
    accessCode:
      body.accessCode ??
      Math.random().toString(36).slice(2, 8),
    startISO: body.startISO ?? new Date().toISOString(),
    endISO:
      body.endISO ??
      new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
  };
  addSession(session);
  return NextResponse.json({ session }, { status: 201 });
}
