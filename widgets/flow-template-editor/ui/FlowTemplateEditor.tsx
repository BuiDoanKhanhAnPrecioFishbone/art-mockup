"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, Pencil } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useToast } from "@/shared/ui/toast";
import { WorkflowTab } from "@/widgets/program-form/ui/tabs/WorkflowTab";
import { DEFAULT_DRAFT, type ProgramDraft } from "@/widgets/program-form/model/types";
import {
  FLOW_TEMPLATE_STATUSES,
  type FlowStageTemplate,
  type FlowStepTemplate,
  type FlowTemplate,
  type FlowTemplateStatus,
} from "@/entities/flow-template";
import type {
  ProgramWorkflow,
  WorkflowStage,
  WorkflowStep,
} from "@/entities/program";

type Mode = "view" | "edit";

/** Flow template editor — wireframes `Edit New Flow (drag & drop +
 *  click)` and `View Flow`. Renders the same workflow canvas the
 *  program form uses, plus a top metadata strip (Flow Name /
 *  Description / Status / Tags). */
export function FlowTemplateEditor({
  template,
  mode: initialMode,
}: {
  template: FlowTemplate;
  mode: Mode;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const isDefault = template.status === "Default";
  const [mode, setMode] = useState<Mode>(
    isDefault ? "view" : initialMode
  );
  const [name, setName] = useState(template.name);
  const [description, setDescription] = useState(template.description);
  const [status, setStatus] = useState<FlowTemplateStatus>(template.status);
  const [tagsInput, setTagsInput] = useState(template.tags.join(", "));
  const [stages, setStages] = useState<WorkflowStage[]>(() =>
    flowStagesToWorkflow(template.stages)
  );
  const [saving, setSaving] = useState(false);

  // Synthesise a ProgramDraft just so we can hand it to the existing
  // WorkflowTab — the only field the canvas reads is `workflow`.
  const draft: ProgramDraft = useMemo(
    () => ({
      ...DEFAULT_DRAFT,
      workflow: {
        flowTemplateId: undefined,
        stages,
      } as ProgramWorkflow,
    }),
    [stages]
  );

  function patchDraft(patch: Partial<ProgramDraft>) {
    if (patch.workflow) {
      setStages(patch.workflow.stages ?? []);
    }
  }

  async function save() {
    setSaving(true);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const res = await fetch(`/api/flow-templates/${template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          status,
          tags,
          stages: workflowStagesToFlow(stages),
        }),
      });
      if (res.ok) {
        showToast("success", `Saved "${name}"`);
        router.push(`/templates/recruitment-flow/${template.id}`);
      } else {
        const data = await res.json();
        showToast("error", data.error ?? "Failed to save flow.");
      }
    } finally {
      setSaving(false);
    }
  }

  const readOnly = mode === "view";

  return (
    <div className="space-y-4 px-8 py-6">
      {/* Breadcrumb + actions */}
      <div className="flex items-center justify-between gap-3">
        <nav className="text-xs text-gray-500">
          <Link
            href="/templates/recruitment-flow"
            className="inline-flex items-center gap-1 underline hover:text-gray-700"
          >
            <ArrowLeft size={11} /> Recruitment Flow
          </Link>
          <span className="px-1.5 text-gray-300">/</span>
          <span className="font-medium text-gray-900">{template.name}</span>
        </nav>

        <div className="flex items-center gap-2">
          {readOnly ? (
            <>
              {!isDefault && (
                <button
                  type="button"
                  onClick={() => setMode("edit")}
                  className="inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
                >
                  <Pencil size={13} /> Edit
                </button>
              )}
              {isDefault && (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700">
                  <Lock size={11} /> System Default — read-only
                </span>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() =>
                  router.push(`/templates/recruitment-flow/${template.id}`)
                }
                disabled={saving}
                className="rounded-md border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving || !name.trim()}
                className="rounded-md bg-violet-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:bg-violet-300"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Title + status */}
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold text-gray-900">
          {readOnly ? template.name : "Editing flow"}
        </h1>
        <span
          className={cn(
            "inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            status === "Default"
              ? "bg-violet-100 text-violet-700"
              : status === "Active"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-gray-200 text-gray-600"
          )}
        >
          {status}
        </span>
      </div>

      {/* Metadata card */}
      <section className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-5 md:grid-cols-2">
        <Field label="Flow Name" required>
          {readOnly ? (
            <p className="text-sm text-gray-900">{name}</p>
          ) : (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          )}
        </Field>
        <Field label="Status">
          {readOnly ? (
            <p className="text-sm text-gray-900">{status}</p>
          ) : (
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as FlowTemplateStatus)
              }
              disabled={isDefault}
              className={inputClass}
            >
              {FLOW_TEMPLATE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}
        </Field>
        <div className="md:col-span-2">
          <Field label="Flow Description">
            {readOnly ? (
              <p className="whitespace-pre-line text-sm text-gray-700">
                {description || "—"}
              </p>
            ) : (
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please Enter…"
                className={`${inputClass} resize-y`}
              />
            )}
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Tags">
            {readOnly ? (
              <div className="flex flex-wrap gap-1">
                {template.tags.length === 0 ? (
                  <span className="text-xs text-gray-400">—</span>
                ) : (
                  template.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700"
                    >
                      {t}
                    </span>
                  ))
                )}
              </div>
            ) : (
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="comma-separated"
                className={inputClass}
              />
            )}
          </Field>
        </div>
      </section>

      {/* Workflow canvas — reuses the program WorkflowTab. */}
      <section>
        <h2 className="mb-2 text-sm font-semibold text-violet-600">
          Stages &amp; Steps
        </h2>
        <WorkflowTab
          draft={draft}
          onChange={patchDraft}
          readOnly={readOnly}
          hideFlowPicker
          skipAutoSeed
        />
      </section>
    </div>
  );
}

const inputClass =
  "block w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:cursor-not-allowed disabled:bg-gray-50";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-500">
        {label} {required && <span className="text-violet-600">*</span>}
      </label>
      {children}
    </div>
  );
}

/* ---------- FlowTemplate ↔ ProgramWorkflow shape adapters ---------- */

function flowStagesToWorkflow(
  stages: FlowStageTemplate[]
): WorkflowStage[] {
  let i = 0;
  return stages.map((s) => ({
    id: `seed-stage-${i++}`,
    name: s.name,
    steps: s.steps.map((st) => ({
      id: `seed-step-${i++}`,
      name: st.name,
      type: st.type,
      timelineDays: st.timelineDays,
      instruction: st.instruction ?? "",
      reviewerIds: st.reviewerIds ? [...st.reviewerIds] : [],
      autoAllocate: st.autoAllocate,
      emailTemplateId: st.emailTemplateId,
      testIds: st.testIds ? [...st.testIds] : undefined,
    })),
  }));
}

function workflowStagesToFlow(
  stages: WorkflowStage[]
): FlowStageTemplate[] {
  return stages.map((s) => ({
    name: s.name,
    steps: s.steps.map<FlowStepTemplate>((st) => stripStep(st)),
  }));
}

function stripStep(st: WorkflowStep): FlowStepTemplate {
  return {
    name: st.name,
    type: st.type,
    timelineDays: st.timelineDays,
    instruction: st.instruction || undefined,
    reviewerIds:
      st.reviewerIds && st.reviewerIds.length > 0
        ? [...st.reviewerIds]
        : undefined,
    autoAllocate: st.autoAllocate,
    emailTemplateId: st.emailTemplateId,
    testIds:
      st.testIds && st.testIds.length > 0 ? [...st.testIds] : undefined,
    scorecardTemplateId: st.scorecard?.templateId,
  };
}
