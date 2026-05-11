"use client";

import { useEffect, useState } from "react";
import { GripVertical, Trash2, X } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useToast } from "@/shared/ui/toast";
import { ComboboxSearchCreate } from "@/shared/ui/combobox-search-create";
import {
  STEP_TYPE_LABEL,
  type StepType,
} from "@/entities/program/model/workflow";
import type {
  StageTemplate,
  StageTemplateStep,
} from "@/entities/stage-template";
import type { StepTemplate } from "@/entities/step-template";

const STEP_TYPE_TONE: Record<StepType, string> = {
  default: "bg-gray-100 text-gray-700",
  test: "bg-blue-100 text-blue-700",
  interview: "bg-violet-100 text-violet-700",
};

/** Edit / Add modal for a Stage Template — wireframe `Stage / Edit
 *  Mode`. Includes the search-then-create combobox for picking child
 *  steps from the Step Master Library (or creating new ones inline). */
export function StageTemplateEditModal({
  initial,
  onSaved,
  onClose,
}: {
  initial: StageTemplate | null;
  onSaved: () => void;
  onClose: () => void;
}) {
  const { showToast } = useToast();
  const isNew = !initial;
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [tagsInput, setTagsInput] = useState(
    (initial?.tags ?? []).join(", ")
  );
  const [steps, setSteps] = useState<StageTemplateStep[]>(
    initial?.steps ? [...initial.steps] : []
  );
  const [submitting, setSubmitting] = useState(false);

  // Step master library used by the inline picker.
  const [stepLibrary, setStepLibrary] = useState<StepTemplate[]>([]);
  const [libraryLoaded, setLibraryLoaded] = useState(false);
  useEffect(() => {
    if (libraryLoaded) return;
    fetch("/api/step-templates")
      .then((r) => r.json())
      .then((d) => setStepLibrary(d.templates ?? []))
      .finally(() => setLibraryLoaded(true));
  }, [libraryLoaded]);

  function addFromTemplate(tpl: StepTemplate) {
    setSteps((prev) => [
      ...prev,
      {
        fromStepTemplateId: tpl.id,
        name: tpl.name,
        type: tpl.type,
        timelineDays: tpl.timelineDays,
        instruction: tpl.instruction,
        emailTemplateId: tpl.emailTemplateId,
        scorecardTemplateId: tpl.scorecardTemplateId,
        testIds: tpl.testIds ? [...tpl.testIds] : undefined,
        reviewerIds: tpl.reviewerIds ? [...tpl.reviewerIds] : undefined,
      },
    ]);
  }

  async function createStepInline(typedName: string): Promise<boolean> {
    const res = await fetch("/api/step-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: typedName, type: "default" }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      showToast(
        "error",
        data.error ?? "Failed to create the step template."
      );
      return false;
    }
    const data = await res.json();
    addFromTemplate(data.template as StepTemplate);
    setStepLibrary((prev) => [data.template, ...prev]);
    return true;
  }

  function removeStep(index: number) {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const payload: Partial<StageTemplate> = {
        name: name.trim(),
        description: description.trim() || undefined,
        tags,
        steps,
      };
      const res = isNew
        ? await fetch("/api/stage-templates", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/stage-templates/${initial!.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast("error", data.error ?? "Failed to save stage template.");
        return;
      }
      showToast(
        "success",
        isNew
          ? `✅ Stage "${name.trim()}" added to the library.`
          : `Saved "${name.trim()}".`
      );
      onSaved();
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-violet-600">
              {isNew ? "Add Stage to Library" : "Edit Stage"}
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Stages saved here can be picked from the workflow canvas.
              Each step is snapshot-cloned when the stage is applied.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          <Field label="Stage Name" required>
            <input
              autoFocus
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Onsite — Technical"
              className={inputClass}
            />
          </Field>

          <Field label="Description">
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this stage cover?"
              className={`${inputClass} resize-y`}
            />
          </Field>

          <Field label="Tags">
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="comma-separated"
              className={inputClass}
            />
          </Field>

          {/* Steps list + search-then-create picker */}
          <div>
            <p className="mb-1 text-xs font-medium text-gray-700">
              Steps in this Stage
            </p>
            {steps.length === 0 && (
              <p className="mb-2 rounded-md border border-dashed border-gray-200 px-3 py-3 text-center text-xs text-gray-500">
                No steps yet. Use the picker below to add from the Step
                Master Library.
              </p>
            )}
            {steps.length > 0 && (
              <ul className="mb-2 space-y-1.5">
                {steps.map((s, idx) => (
                  <li
                    key={`${s.fromStepTemplateId ?? "new"}-${idx}`}
                    className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-1.5"
                  >
                    <GripVertical
                      size={12}
                      className="shrink-0 text-gray-300"
                    />
                    <span className="flex-1 truncate text-xs font-medium text-gray-800">
                      {s.name}
                    </span>
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase",
                        STEP_TYPE_TONE[s.type]
                      )}
                    >
                      {STEP_TYPE_LABEL[s.type]}
                    </span>
                    {s.fromStepTemplateId && (
                      <span
                        title="Cloned from Step Master Library"
                        className="rounded bg-violet-50 px-1.5 py-0.5 text-[9px] font-semibold text-violet-700"
                      >
                        From library
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeStep(idx)}
                      className="rounded p-0.5 text-gray-300 hover:bg-red-50 hover:text-red-600"
                      title="Remove step"
                    >
                      <Trash2 size={12} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <ComboboxSearchCreate
              triggerLabel="Add Step"
              placeholder="Search step library or type to create…"
              loading={!libraryLoaded}
              items={stepLibrary.map((tpl) => ({
                id: tpl.id,
                label: tpl.name,
                sublabel: tpl.instruction,
                meta: (
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase",
                      STEP_TYPE_TONE[tpl.type]
                    )}
                  >
                    {STEP_TYPE_LABEL[tpl.type]}
                  </span>
                ),
                value: tpl,
              }))}
              onPickExisting={(item) => addFromTemplate(item.value)}
              onCreateNew={createStepInline}
              emptyHint={
                <span>
                  No matches. Press Enter or click below to create a new
                  step.
                </span>
              }
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim() || submitting}
            className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:bg-violet-300"
          >
            {submitting ? "Saving…" : isNew ? "Add to Library" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputClass =
  "block w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500";

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
      <label className="mb-1 block text-xs font-medium text-gray-700">
        {label} {required && <span className="text-violet-600">*</span>}
      </label>
      {children}
    </div>
  );
}
