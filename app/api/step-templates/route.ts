import { NextResponse } from "next/server";
import {
  addStepTemplate,
  listStepTemplates,
} from "@/entities/step-template/api/fixtures";
import { listFlowTemplates } from "@/entities/flow-template/api/fixtures";
import { listStageTemplates } from "@/entities/stage-template/api/fixtures";
import type { StepTemplate } from "@/entities/step-template";
import type { StepType } from "@/entities/program/model/workflow";

export function GET() {
  // Pre-compute usage counts so the library page renders the
  // "Used in N templates" column in a single round-trip.
  const flows = listFlowTemplates();
  const stages = listStageTemplates();
  const rows = listStepTemplates().map((t) => {
    const flowMatches = flows.filter((flow) =>
      flow.stages.some((stage) =>
        stage.steps.some((s) => s.name === t.name)
      )
    );
    const stageMatches = stages.filter((stage) =>
      stage.steps.some(
        (s) => s.fromStepTemplateId === t.id || s.name === t.name
      )
    );
    return {
      ...t,
      usage: {
        flowTemplateCount: flowMatches.length,
        stageTemplateCount: stageMatches.length,
      },
    };
  });
  return NextResponse.json({ templates: rows });
}

/** Create a new step template — used by the inline "Create new step:
 *  <typed name>" branch of the search-then-create combobox AND by
 *  the per-step `Save Step to Library` action on the workflow canvas. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Partial<StepTemplate>;
  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json(
      { error: "Name is required." },
      { status: 400 }
    );
  }
  // Wireframe error toast: "A step with this name already exists in
  // the library. Please choose a different name."
  const existing = listStepTemplates().find(
    (t) => t.name.toLowerCase() === name.toLowerCase()
  );
  if (existing) {
    return NextResponse.json(
      {
        error:
          "A step with this name already exists in the library. Please choose a different name.",
      },
      { status: 409 }
    );
  }
  const tpl: StepTemplate = {
    id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    type: (body.type ?? "default") as StepType,
    timelineDays: body.timelineDays ?? 3,
    instruction: body.instruction,
    reviewerIds: body.reviewerIds,
    emailTemplateId: body.emailTemplateId,
    scorecardTemplateId: body.scorecardTemplateId,
    testIds: body.testIds,
    tags: body.tags ?? [],
    createdAtISO: new Date().toISOString(),
    updatedAtISO: new Date().toISOString(),
  };
  addStepTemplate(tpl);
  return NextResponse.json({ template: tpl }, { status: 201 });
}
