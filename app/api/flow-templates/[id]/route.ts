import { NextResponse } from "next/server";
import {
  deleteFlowTemplate,
  getFlowTemplate,
  updateFlowTemplate,
} from "@/entities/flow-template/api/fixtures";
import { listPrograms } from "@/entities/program/api/fixtures";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const template = getFlowTemplate(id);
  if (!template)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ template });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const existing = getFlowTemplate(id);
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Default flows are platform-managed — name + status + structure
  // are immutable. Only metadata (description, tags) can be edited.
  if (existing.status === "Default") {
    const patch = (await req.json().catch(() => ({}))) as Partial<
      typeof existing
    >;
    const safe: Partial<typeof existing> = {};
    if (patch.description !== undefined) safe.description = patch.description;
    if (patch.tags !== undefined) safe.tags = patch.tags;
    return NextResponse.json({
      template: updateFlowTemplate(id, safe),
    });
  }
  const patch = await req.json();
  return NextResponse.json({ template: updateFlowTemplate(id, patch) });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const existing = getFlowTemplate(id);
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (existing.status === "Default") {
    return NextResponse.json(
      { error: "Default flows cannot be deleted." },
      { status: 409 }
    );
  }

  // Doc 10 soft-delete: refuse hard delete when any program still
  // references this flow template. The caller should warn first and
  // archive instead.
  const usedIn = listPrograms().filter(
    (p) => p.workflow?.flowTemplateId === id
  );
  if (usedIn.length > 0) {
    return NextResponse.json(
      {
        error: `This flow is currently used by ${usedIn.length} program${usedIn.length === 1 ? "" : "s"}. Archive it instead.`,
        usedIn: usedIn.map((p) => ({ id: p.id, title: p.title })),
      },
      { status: 409 }
    );
  }

  deleteFlowTemplate(id);
  return NextResponse.json({ ok: true });
}
