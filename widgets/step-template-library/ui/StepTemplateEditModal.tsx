"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useToast } from "@/shared/ui/toast";
import { STEP_TYPE_LABEL, type StepType } from "@/entities/program/model/workflow";
import type { StepTemplate } from "@/entities/step-template";

const STEP_TYPES: StepType[] = ["default", "test", "interview"];

/** Edit / Add modal for a Step Template — wireframe `Step Detail`
 *  (compact form). Mirrors the in-program StepDetailPanel fields the
 *  master library cares about (name, type, instruction, email
 *  template, tags). The full step config (test refs, scorecard ids,
 *  reviewer ids) keeps any incoming values verbatim — this modal
 *  doesn't expose pickers for them yet (follow-up). */
export function StepTemplateEditModal({
  initial,
  onSaved,
  onClose,
}: {
  /** `null` → create flow. */
  initial: StepTemplate | null;
  onSaved: () => void;
  onClose: () => void;
}) {
  const { showToast } = useToast();
  const isNew = !initial;
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<StepType>(initial?.type ?? "default");
  const [timelineDays, setTimelineDays] = useState(
    String(initial?.timelineDays ?? 3)
  );
  const [instruction, setInstruction] = useState(initial?.instruction ?? "");
  const [emailTemplateId, setEmailTemplateId] = useState(
    initial?.emailTemplateId ?? ""
  );
  const [tagsInput, setTagsInput] = useState(
    (initial?.tags ?? []).join(", ")
  );
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const payload: Partial<StepTemplate> = {
        name: name.trim(),
        type,
        timelineDays: Number(timelineDays) || 0,
        instruction: instruction.trim() || undefined,
        emailTemplateId: emailTemplateId.trim() || undefined,
        tags,
      };
      const res = isNew
        ? await fetch("/api/step-templates", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/step-templates/${initial!.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast("error", data.error ?? "Failed to save step template.");
        return;
      }
      showToast(
        "success",
        isNew
          ? `✅ Step "${name.trim()}" added to the library.`
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
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-violet-600">
              {isNew ? "Add Step to Library" : "Edit Step"}
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Steps saved here can be picked from the workflow canvas
              with the search-then-create combobox.
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
          <Field label="Step Name" required>
            <input
              autoFocus
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Coding Test"
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Step Type" required>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as StepType)}
                className={inputClass}
              >
                {STEP_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {STEP_TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Timeline (days)">
              <input
                type="number"
                min={0}
                value={timelineDays}
                onChange={(e) => setTimelineDays(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Step Instruction">
            <textarea
              rows={4}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="What should the reviewer do at this step?"
              className={`${inputClass} resize-y`}
            />
          </Field>

          <Field label="Email Template ID">
            <input
              type="text"
              value={emailTemplateId}
              onChange={(e) => setEmailTemplateId(e.target.value)}
              placeholder="e.g. et-test-invite"
              className={inputClass}
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
