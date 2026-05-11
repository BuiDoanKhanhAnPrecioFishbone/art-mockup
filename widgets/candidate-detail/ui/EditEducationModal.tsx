"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { CandidateEducation } from "@/entities/candidate";

/** Edit/Add Education modal — wireframe `3228:222337` (top half).
 *  Form fields: School/Institution, Degree Level (select), Major,
 *  Duration (start → end date), Link, Description. */
export function EditEducationModal({
  initial,
  onSave,
  onClose,
}: {
  initial: CandidateEducation | null;
  onSave: (next: CandidateEducation) => void;
  onClose: () => void;
}) {
  const isNew = !initial;
  const [form, setForm] = useState<CandidateEducation>(
    initial ?? {
      id: `ed-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      institution: "",
      degreeLevel: "",
      major: "",
      startDate: "",
      endDate: "",
      link: "",
      description: "",
    }
  );

  function patch<K extends keyof CandidateEducation>(
    key: K,
    value: CandidateEducation[K]
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
            {isNew ? "Add education" : "Edit education"}
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
          <Field label="School / Institution">
            <input
              type="text"
              value={form.institution}
              onChange={(e) => patch("institution", e.target.value)}
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Degree / Level">
              <select
                value={form.degreeLevel ?? ""}
                onChange={(e) => patch("degreeLevel", e.target.value)}
                className={inputClass}
              >
                <option value="">Please Select</option>
                <option>Associate</option>
                <option>Bachelor</option>
                <option>Master</option>
                <option>PhD</option>
                <option>Diploma</option>
              </select>
            </Field>

            <Field label="Major">
              <input
                type="text"
                value={form.major ?? ""}
                onChange={(e) => patch("major", e.target.value)}
                className={inputClass}
              />
            </Field>

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
          </div>

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
