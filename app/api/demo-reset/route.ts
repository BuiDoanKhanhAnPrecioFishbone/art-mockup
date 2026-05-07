import { NextResponse } from "next/server";
import { resetProgramsStore } from "@/entities/program/api/fixtures";

/** Wipe the in-memory programs store and re-seed it from the canonical
 *  fixtures. Wired to the "Reset demo data" button on the Programs page
 *  so fixture-level changes (e.g. criterion categories) take effect
 *  without restarting the dev server.
 *
 *  Mock-only — there is no real backend; this is just for the demo. */
export function POST() {
  const programs = resetProgramsStore();
  return NextResponse.json({ ok: true, count: programs.length });
}
