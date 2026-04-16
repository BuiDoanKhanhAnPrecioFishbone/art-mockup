"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronRight,
  Edit2,
  Save,
  Trash2,
} from "lucide-react";
import { jobTemplates } from "@/shared/fixtures/jobs";
import type { Skill } from "@/shared/fixtures/jobs";
import { SkillsLabelsSection } from "@/widgets/job-vacancy";
import { ToastProvider } from "@/shared/ui";


// ── Main page ────────────────────────────────────────────────────────────────
export default function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>();

  const initial = jobTemplates.find((t) => t.id === id);

  const [editMode, setEditMode] = useState(false);
  const [saved, setSaved] = useState(false);

  // Editable fields
  const [jobTitle, setJobTitle] = useState(initial?.jobTitle ?? "");
  const [level, setLevel] = useState(initial?.level ?? "Fresher");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [skills, setSkills] = useState<Skill[]>(initial?.skills ?? []);

  if (!initial) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Template not found.</p>
          <Link
            href="/flows/create-manage-jobs"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to Jobs Management
          </Link>
        </div>
      </div>
    );
  }

  function handleSave() {
    setEditMode(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleCancel() {
    // Reset to original values (initial is defined — early return above guards this)
    setJobTitle(initial!.jobTitle);
    setLevel(initial!.level);
    setDescription(initial!.description);
    setSkills(initial!.skills);
    setEditMode(false);
  }

  const lastUpdated = new Date(initial.lastUpdated).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <ToastProvider>
    <div className="min-h-screen bg-gray-50">
      {/* Save toast */}
      {saved && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg">
          Template saved successfully
        </div>
      )}

      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-8 py-4">
        <nav className="mb-1 flex items-center gap-1 text-xs text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition-colors">
            Home
          </Link>
          <ChevronRight size={12} />
          <Link
            href="/flows/create-manage-jobs"
            className="hover:text-gray-600 transition-colors"
          >
            Jobs Management
          </Link>
          <ChevronRight size={12} />
          <span className="text-gray-700">Job Template</span>
          <ChevronRight size={12} />
          <span className="text-gray-700 font-medium">{initial.jobTitle}</span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {editMode ? jobTitle || "Untitled Template" : initial.jobTitle}
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Last updated: {lastUpdated} &nbsp;·&nbsp; {initial.skillsConfigured} skills
            </p>
          </div>
          <div className="flex items-center gap-2">
            {editMode ? (
              <>
                <button
                  onClick={handleCancel}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  <Save size={15} />
                  Save Template
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <Edit2 size={15} />
                Edit Template
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-8 py-8 space-y-6">
        {/* Basic Info */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">Basic Information</h2>
          <div className="grid grid-cols-2 gap-5">
            {/* Job Title */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Job Title
              </label>
              {editMode ? (
                <input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                />
              ) : (
                <p className="text-sm text-gray-900">{initial.jobTitle}</p>
              )}
            </div>

            {/* Level */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Level
              </label>
              {editMode ? (
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                >
                  {["Intern", "Fresher", "Junior", "Mid", "Senior", "Lead", "Manager"].map(
                    (l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    )
                  )}
                </select>
              ) : (
                <span className="inline-block rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                  {initial.level}
                </span>
              )}
            </div>

            {/* Description — full width */}
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Job Description
              </label>
              {editMode ? (
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none resize-none"
                />
              ) : (
                <p className="whitespace-pre-line text-sm text-gray-700 leading-relaxed">
                  {initial.description || (
                    <span className="italic text-gray-400">No description provided.</span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Skills Configuration */}
        {editMode ? (
          <SkillsLabelsSection />
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-700">
              Skills Configuration
              <span className="ml-2 text-xs font-normal text-gray-400">({skills.length} total)</span>
            </h2>
            <div className="flex gap-4">
              {(["must-have", "nice-to-have", "bonus"] as const).map((cat) => {
                const colorMap = { "must-have": "text-red-600", "nice-to-have": "text-amber-600", bonus: "text-green-600" };
                const labelMap = { "must-have": "Must-Have", "nice-to-have": "Nice-to-Have", bonus: "Bonus" };
                const catSkills = skills.filter((s) => s.category === cat);
                return (
                  <div key={cat} className="flex-1 min-w-0 rounded-lg border border-gray-200 bg-white p-4">
                    <div className={`mb-3 text-xs font-semibold uppercase tracking-wide ${colorMap[cat]}`}>
                      {labelMap[cat]}
                    </div>
                    <div className="flex flex-wrap gap-1.5 min-h-[40px]">
                      {catSkills.length === 0 ? (
                        <span className="text-xs text-gray-400 italic">None</span>
                      ) : (
                        catSkills.map((s) => (
                          <span key={s.id} className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700">
                            {s.name}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Danger zone — only in edit mode */}
        {editMode && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <h2 className="mb-1 text-sm font-semibold text-red-700">Danger Zone</h2>
            <p className="mb-3 text-xs text-red-500">
              Deleting this template is permanent and cannot be undone.
            </p>
            <button
              onClick={() => {
                if (confirm("Delete this template? This cannot be undone.")) {
                  window.location.href = "/flows/create-manage-jobs";
                }
              }}
              className="flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={13} />
              Delete Template
            </button>
          </div>
        )}
      </div>
    </div>
    </ToastProvider>
  );
}
