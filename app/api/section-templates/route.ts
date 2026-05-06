import { NextResponse } from "next/server";
import {
  addSectionTemplate,
  listSectionTemplates,
} from "@/entities/section-template/api/fixtures";
import type { SectionTemplateRecord } from "@/entities/section-template";

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
  const id = `sec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const section: SectionTemplateRecord = {
    id,
    name: body.name.trim(),
    description: body.description,
    type: body.type === "system" ? "system" : "custom",
    tags: body.tags ?? [],
    repeatable: body.repeatable ?? false,
    fields: body.fields ?? [],
    layout: body.layout,
    dateModifiedISO: new Date().toISOString(),
  };
  addSectionTemplate(section);
  return NextResponse.json({ section }, { status: 201 });
}
