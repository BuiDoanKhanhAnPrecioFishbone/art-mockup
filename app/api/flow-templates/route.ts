import { NextResponse } from "next/server";
import {
  addFlowTemplate,
  emptyFlowTemplate,
  listFlowTemplates,
} from "@/entities/flow-template/api/fixtures";
import { listPrograms } from "@/entities/program/api/fixtures";
import type { FlowTemplate } from "@/entities/flow-template";

/** GET — list flow templates. Each row also carries a derived
 *  `usedInCount` so the master library can show the wireframe's
 *  "Used in N programs" column without a second round-trip. */
export function GET() {
  const programs = listPrograms();
  const usage = new Map<string, number>();
  for (const p of programs) {
    const id = p.workflow?.flowTemplateId;
    if (!id) continue;
    usage.set(id, (usage.get(id) ?? 0) + 1);
  }
  const rows = listFlowTemplates().map((t) => ({
    ...t,
    stageCount: t.stages.length,
    stepCount: t.stages.reduce((s, st) => s + st.steps.length, 0),
    usedInCount: usage.get(t.id) ?? 0,
  }));
  return NextResponse.json({ templates: rows });
}

/** POST — create a new flow template. Body: { name, description?,
 *  status?, tags? }. Returns the created template. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Partial<FlowTemplate>;
  const tpl = emptyFlowTemplate(body.name?.trim() || "Untitled Flow");
  if (body.description) tpl.description = body.description;
  if (body.tags) tpl.tags = [...body.tags];
  if (body.status && body.status !== "Default") tpl.status = body.status;
  addFlowTemplate(tpl);
  return NextResponse.json({ template: tpl }, { status: 201 });
}
