import { NextResponse } from "next/server";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await params;
  return NextResponse.json({ success: true, message: "Skill approved successfully" });
}
