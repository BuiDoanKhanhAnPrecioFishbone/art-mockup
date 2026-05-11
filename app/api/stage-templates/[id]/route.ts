import { NextResponse } from "next/server";
import {
  deleteStageTemplate,
  getStageTemplate,
  updateStageTemplate,
} from "@/entities/stage-template/api/fixtures";
import { listFlowTemplates } from "@/entities/flow-template/api/fixtures";

/** Where this stage is currently used. Stage templates aren't
 *  directly referenced by flow templates (we snapshot on apply), so
 *  the "currently used" check looks at flows whose stages mention
 *  the same stage name. Coarse but matches the wireframe's intent
 *  for the demo. */
function usageOf(stageId: string): { flowTemplateIds: string[] } {
  const stage = getStageTemplate(stageId);
  if (!stage) return { flowTemplateIds: [] };
  const matching = listFlowTemplates().filter((flow) =>
    flow.stages.some((s) => s.name === stage.name)
  );
  return { flowTemplateIds: matching.map((f) => f.id) };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const template = getStageTemplate(id);
  if (!template)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ template, usage: usageOf(id) });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const existing = getStageTemplate(id);
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const patch = await req.json();
  return NextResponse.json({
    template: updateStageTemplate(id, patch),
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const existing = getStageTemplate(id);
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Soft check — refuse hard delete when this stage is referenced by
  // any flow template. The caller is expected to surface the
  // wireframe's "Currently used in: …" callout.
  const usage = usageOf(id);
  if (usage.flowTemplateIds.length > 0) {
    return NextResponse.json(
      {
        error: `This stage is currently used by ${usage.flowTemplateIds.length} flow template${usage.flowTemplateIds.length === 1 ? "" : "s"}.`,
        usage,
      },
      { status: 409 }
    );
  }

  deleteStageTemplate(id);
  return NextResponse.json({ ok: true });
}
