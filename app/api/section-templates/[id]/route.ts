import { NextResponse } from "next/server";
import {
  deleteSectionTemplate,
  getSectionTemplate,
  updateSectionTemplate,
} from "@/entities/section-template/api/fixtures";
import {
  slugifyFieldName,
  validateProfileField,
  type ProfileField,
} from "@/entities/program";

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
  const existing = getSectionTemplate(id);
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const patch = await req.json();

  // Doc 08 §8.1 — radio / checkbox / dropdown fields need at least 2
  // options, and field `name` is immutable after creation. Preserve
  // each existing field's `name` (or auto-derive from label for new
  // ones) and validate options.
  if (Array.isArray(patch.fields)) {
    const oldNames = new Map<string, string>();
    for (const f of existing.fields) {
      if (f.name) oldNames.set(f.id, f.name);
    }
    patch.fields = (patch.fields as ProfileField[]).map((f) => ({
      ...f,
      name: oldNames.get(f.id) ?? f.name ?? slugifyFieldName(f.label ?? ""),
    }));
    for (const f of patch.fields as ProfileField[]) {
      const issues = validateProfileField(f);
      if (issues.length > 0) {
        return NextResponse.json(
          { error: `${f.label ?? f.name}: ${issues[0]}` },
          { status: 400 }
        );
      }
    }
  }

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
