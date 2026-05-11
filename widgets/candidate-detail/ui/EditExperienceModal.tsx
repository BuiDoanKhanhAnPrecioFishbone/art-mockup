"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { CandidateExperience } from "@/entities/candidate";

/** Edit/Add Experience modal — wireframe `3228:222337` (bottom half).
 *  Project Name, Company / Organization, Role, Location, Headcount,
 *  Duration, Link, Description. */
export function EditExperienceModal({
  initial,
  onSave,
  onClose,
}: {
  initial: CandidateExperience | null;
  onSave: (next: CandidateExperience) => void;
  onClose: () => void;
}) {
  const isNew = !initial;
  const [form, setForm] = useState<CandidateExperience>(
    initial ?? {
      id: `ex-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      projectName: "",
      company: "",
      role: "",
      location: "",
      headcount: undefined,
      startDate: "",
      endDate: "",
      link: "",
      description: "",
    }
  );

  function patch<K extends keyof CandidateExperience>(
    key: K,
    value: CandidateExperience[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-violet-600">
            {isNew ? "Add experience" : "Edit experience"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          <Field label="Project Name">
            <input
              type="text"
              value={form.projectName}
              onChange={(e) => patch("projectName", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Company / Organization">
            <input
              type="text"
              value={form.company ?? ""}
              onChange={(e) => patch("company", e.target.value)}
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Role">
              <input
                type="text"
                value={form.role ?? ""}
                onChange={(e) => patch("role", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Location">
              <input
                type="text"
                value={form.location ?? ""}
                onChange={(e) => patch("location", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Headcount">
              <input
                type="number"
                min={1}
                value={form.headcount ?? ""}
                onChange={(e) =>
                  patch(
                    "headcount",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Duration">
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={form.startDate ?? ""}
                onChange={(e) => patch("startDate", e.target.value)}
                className={inputClass}
              />
              <span className="text-gray-400">→</span>
              <input
                type="date"
                value={form.endDate ?? ""}
                onChange={(e) => patch("endDate", e.target.value)}
                className={inputClass}
              />
            </div>
          </Field>

          <Field label="Link">
            <div className="flex">
              <input
                type="url"
                value={form.link ?? ""}
                onChange={(e) => patch("link", e.target.value)}
                placeholder="Please Enter"
                className={`${inputClass} rounded-r-none`}
              />
              <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-200 bg-gray-50 px-3 text-xs text-gray-500">
                http://
              </span>
            </div>
          </Field>

          <Field label="Description">
            <textarea
              rows={4}
              value={form.description ?? ""}
              onChange={(e) => patch("description", e.target.value)}
              className={`${inputClass} resize-y`}
            />
          </Field>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(form)}
            className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
          >
            {isNew ? "Add" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "block w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );
}
