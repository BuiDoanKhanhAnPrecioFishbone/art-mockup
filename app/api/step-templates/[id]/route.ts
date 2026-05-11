import { NextResponse } from "next/server";
import {
  deleteStepTemplate,
  getStepTemplate,
  updateStepTemplate,
} from "@/entities/step-template/api/fixtures";
import { listFlowTemplates } from "@/entities/flow-template/api/fixtures";
import { listStageTemplates } from "@/entities/stage-template/api/fixtures";

/** Where this step is currently used. We can't track "used by
 *  programs" precisely because programs snapshot steps at creation
 *  (Doc 08.4) — so this looks at flow + stage templates that
 *  reference the step by name. Coarse-but-honest approximation. */
function usageOf(stepId: string) {
  const step = getStepTemplate(stepId);
  if (!step) return { flowTemplateIds: [] as string[], stageTemplateIds: [] as string[] };
  const flowMatches = listFlowTemplates().filter((flow) =>
    flow.stages.some((stage) =>
      stage.steps.some((s) => s.name === step.name)
    )
  );
  const stageMatches = listStageTemplates().filter((stage) =>
    stage.steps.some(
      (s) => s.fromStepTemplateId === stepId || s.name === step.name
    )
  );
  return {
    flowTemplateIds: flowMatches.map((f) => f.id),
    stageTemplateIds: stageMatches.map((s) => s.id),
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const template = getStepTemplate(id);
  if (!template)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ template, usage: usageOf(id) });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const existing = getStepTemplate(id);
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const patch = await req.json();
  return NextResponse.json({
    template: updateStepTemplate(id, patch),
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const existing = getStepTemplate(id);
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const usage = usageOf(id);
  const totalRefs = usage.flowTemplateIds.length + usage.stageTemplateIds.length;
  if (totalRefs > 0) {
    return NextResponse.json(
      {
        error: `This step is currently used by ${totalRefs} template${totalRefs === 1 ? "" : "s"}. Detach it first.`,
        usage,
      },
      { status: 409 }
    );
  }

  deleteStepTemplate(id);
  return NextResponse.json({ ok: true });
}
