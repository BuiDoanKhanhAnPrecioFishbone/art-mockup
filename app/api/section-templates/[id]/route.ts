import { NextResponse } from "next/server";
import {
  deleteSectionTemplate,
  getSectionTemplate,
  updateSectionTemplate,
} from "@/entities/section-template/api/fixtures";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const section = getSectionTemplate(id);
  if (!section)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ section });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const patch = await req.json();
  const updated = updateSectionTemplate(id, patch);
  if (!updated)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ section: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const res = deleteSectionTemplate(id);
  if (!res.ok)
    return NextResponse.json(
      { error: res.error ?? "Could not delete." },
      { status: 400 }
    );
  return NextResponse.json({ ok: true });
}
