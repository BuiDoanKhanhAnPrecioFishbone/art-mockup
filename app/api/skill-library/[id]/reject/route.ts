import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await params;
  const body = await request.json();
  return NextResponse.json({ success: true, reason: body.reason });
}
