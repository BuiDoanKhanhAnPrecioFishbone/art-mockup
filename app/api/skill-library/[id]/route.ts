import { NextResponse } from "next/server";
import { masterSkills } from "@/shared/fixtures/skills";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const skill = masterSkills.find((s) => s.id === id);
  if (!skill) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(skill);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const skill = masterSkills.find((s) => s.id === id);
  if (!skill) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const updated = { ...skill, ...body, updatedAt: new Date().toISOString() };
  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const skill = masterSkills.find((s) => s.id === id);
  if (!skill) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
