"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  FLOW_TEMPLATE_STATUSES,
  type FlowTemplateStatus,
} from "@/entities/flow-template";

/** "Create New Flow" modal — wireframe text labels: Flow Name, Flow
 *  Description, Status, Tags. On submit, POSTs to /api/flow-templates
 *  and routes the user into the editor for the freshly-created flow. */
export function CreateFlowModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<FlowTemplateStatus>("Active");
  const [tagsInput, setTagsInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      const res = await fetch("/api/flow-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, status, tags }),
      });
      const data = await res.json();
      if (!res.ok || !data.template) return;
      router.push(`/templates/recruitment-flow/${data.template.id}/edit`);
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
              Create New Flow
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Define the metadata. You'll add stages and steps next.
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
          <Field label="Flow Name" required>
            <input
              autoFocus
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter the recruitment flow name (e.g., Standard Tech Flow)…"
              className={inputClass}
            />
          </Field>

          <Field label="Flow Description">
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please Enter…"
              className={`${inputClass} resize-y`}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Status" required>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as FlowTemplateStatus)
                }
                className={inputClass}
              >
                {/* Default is platform-managed — only Active / Archived
                 *  can be picked at creation. */}
                {FLOW_TEMPLATE_STATUSES.filter((s) => s !== "Default").map(
                  (s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  )
                )}
              </select>
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
            {submitting ? "Creating…" : "Create & Edit"}
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
