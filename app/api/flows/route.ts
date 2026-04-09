import { NextResponse } from "next/server";
import { FLOWS } from "@/shared/config/flows";

/** GET /api/flows — returns the registered flow list. */
export async function GET() {
  return NextResponse.json(FLOWS);
}
