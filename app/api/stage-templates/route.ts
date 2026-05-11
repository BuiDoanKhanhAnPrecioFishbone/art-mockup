import { NextResponse } from "next/server";
import {
  addStageTemplate,
  listStageTemplates,
} from "@/entities/stage-template/api/fixtures";
import type { StageTemplate } from "@/entities/stage-template";

export function GET() {
  return NextResponse.json({ templates: listStageTemplates() });
}

/** Create a new stage template — used by the "+ New Stage" button on
 *  the Stage Master Library page AND by the per-stage `Save Stage to
 *  Library` action on a workflow canvas. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Partial<StageTemplate>;
  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json(
      { error: "Name is required." },
      { status: 400 }
    );
  }
  // Wireframe: dup-name on the stage library produces the same toast
  // shape as the step library.
  const existing = listStageTemplates().find(
    (t) => t.name.toLowerCase() === name.toLowerCase()
  );
  if (existing) {
    return NextResponse.json(
      {
        error:
          "A stage with this name already exists in the library. Please choose a different name.",
      },
      { status: 409 }
    );
  }
  const tpl: StageTemplate = {
    id: `stage-tpl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    description: body.description,
    tags: body.tags ?? [],
    steps: body.steps ?? [],
    createdAtISO: new Date().toISOString(),
    updatedAtISO: new Date().toISOString(),
  };
  addStageTemplate(tpl);
  return NextResponse.json({ template: tpl }, { status: 201 });
}
