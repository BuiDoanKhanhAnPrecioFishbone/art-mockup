import { NextResponse } from "next/server";
import {
  deleteTest,
  getTest,
  listSessions,
  updateTest,
} from "@/entities/test/api/fixtures";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const test = getTest(id);
  if (!test)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ test });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const existing = getTest(id);
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const patch = await req.json();

  // Doc 06 §6.1: Composition Mode is "set once; immutable once any
  // session has been created". Reject the patch if it would change
  // the mode and at least one session exists.
  if (
    typeof patch.compositionMode === "string" &&
    patch.compositionMode !== existing.compositionMode &&
    listSessions(id).length > 0
  ) {
    return NextResponse.json(
      {
        error:
          "Composition mode cannot be changed — at least one session has already been created from this test.",
      },
      { status: 409 }
    );
  }

  const updated = updateTest(id, patch);
  if (!updated)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ test: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ok = deleteTest(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
