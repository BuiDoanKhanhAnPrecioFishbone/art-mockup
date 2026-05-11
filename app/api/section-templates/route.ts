import { NextResponse } from "next/server";
import {
  addSectionTemplate,
  listSectionTemplates,
} from "@/entities/section-template/api/fixtures";
import type { SectionTemplateRecord } from "@/entities/section-template";
import {
  slugifyFieldName,
  validateProfileField,
} from "@/entities/program";

export function GET() {
  return NextResponse.json({ sections: listSectionTemplates() });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<SectionTemplateRecord>;
  if (!body.name?.trim()) {
    return NextResponse.json(
      { error: "name is required" },
      { status: 400 }
    );
  }

  // Doc 08 §8.1 — radio / checkbox / dropdown fields need at least 2
  // options, and every field gets a snake_case immutable `name`
  // derived from its initial label if missing.
  const fields = (body.fields ?? []).map((f) => ({
    ...f,
    name: f.name ?? slugifyFieldName(f.label ?? ""),
  }));
  for (const f of fields) {
    const issues = validateProfileField(f);
    if (issues.length > 0) {
      return NextResponse.json(
        { error: `${f.label ?? f.name}: ${issues[0]}` },
        { status: 400 }
      );
    }
  }

  const id = `sec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const section: SectionTemplateRecord = {
    id,
    name: body.name.trim(),
    description: body.description,
    type: body.type === "system" ? "system" : "custom",
    tags: body.tags ?? [],
    repeatable: body.repeatable ?? false,
    fields,
    layout: body.layout,
    dateModifiedISO: new Date().toISOString(),
  };
  addSectionTemplate(section);
  return NextResponse.json({ section }, { status: 201 });
}
