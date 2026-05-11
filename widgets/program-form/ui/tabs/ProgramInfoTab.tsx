"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  FolderOpen,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useToast } from "@/shared/ui/toast";
import { RichTextEditor } from "@/shared/ui/rich-text-editor";
import type { JobTemplate } from "@/entities/job-template";
import type { ProgramLevel, ProgramSkill, ProgramStatus } from "@/entities/program";
import { SkillsLabelsSection } from "@/widgets/job-vacancy";
import type { ProgramDraft } from "../../model/types";

interface ProgramInfoTabProps {
  draft: ProgramDraft;
  onChange: (updates: Partial<ProgramDraft>) => void;
}

const LEVELS: ProgramLevel[] = ["Intern", "Fresher", "Junior", "Mid", "Senior"];
const STATUSES: { value: ProgramStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "closed", label: "Closed" },
];

export function ProgramInfoTab({ draft, onChange }: ProgramInfoTabProps) {
  const [templates, setTemplates] = useState<JobTemplate[]>([]);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetch("/api/job-templates")
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates));
  }, []);

  async function applyTemplate(id: string) {
    if (!id) {
      onChange({ jobTemplateId: undefined });
      return;
    }
    const res = await fetch(`/api/job-templates/${id}`);
    if (!res.ok) {
      showToast("error", "Failed to load job template.");
      return;
    }
    const { template } = (await res.json()) as { template: JobTemplate };
    // Convert flat template skills/labels into ProgramSkill /
    // ProgramLabel. Each template skill carries its own tier per Doc
    // 08 §8.3 — copy that across so the program inherits the
    // recruiter's intent. Default to must-have for legacy templates.
    const skills: ProgramSkill[] = template.skills.map((s, i) => ({
      skillId: s.id,
      name: s.name,
      category: "Uncategorized",
      source: "library",
      priority: s.tier ?? "must-have",
      order: i,
    }));
    const labels = template.labels.map((name, i) => ({
      id: `lbl-tpl-${template.id}-${i}`,
      name,
      order: i + 1,
    }));
    onChange({
      jobTemplateId: template.id,
      position: template.position,
      level: template.level,
      description: template.description,
      skills,
      labels,
    });
    showToast("success", `Template "${template.name}" applied — edit any field.`);
  }

  return (
    <div className="space-y-6">
      {/* Header row: title + Edit button (read-mode placeholder) */}
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-xl font-semibold text-gray-900">
          Program Info
          <HelpCircle size={14} className="text-gray-400" />
        </h2>
      </div>

      {/* ============================================================
       * Section 1 — General Information
       *
       * Width-capped to half so the dense field rows (Job Title /
       * Level, Status / Headcount / Hiring Period, etc.) stay
       * comfortable on wide screens. Skills & Labels and the other
       * sections stay full-width since they use chip grids that
       * benefit from the extra room.
       * ============================================================ */}
      <section className="max-w-3xl rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-base font-semibold text-violet-700">
          1. General Information
        </h3>

        <div className="space-y-4">
          {/* Row: Program Name */}
          <Field label="Program Name" required>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="e.g. Q1 Marketing Hiring"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-violet-500 focus:outline-none"
            />
          </Field>

          {/* Row: Job Template */}
          <Field
            label="Job Template"
            hint="Pre-fills Job Title, Level, Description, Skills and Labels. Optional."
          >
            <div className="relative">
              <Sparkles
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-500"
              />
              <select
                value={draft.jobTemplateId ?? ""}
                onChange={(e) => applyTemplate(e.target.value)}
                className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-9 text-sm text-gray-900 focus:border-violet-500 focus:outline-none"
              >
                <option value="">Don&apos;t use a template</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </Field>

          {/* Row: Job Title (2/3) | Job Level (1/3) */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Field label="Job Title" required>
                <input
                  type="text"
                  value={draft.position}
                  onChange={(e) => onChange({ position: e.target.value })}
                  placeholder="e.g. Backend Developer"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-violet-500 focus:outline-none"
                />
              </Field>
            </div>
            <Field label="Job Level">
              <SelectInput
                value={draft.level}
                onChange={(v) => onChange({ level: v as ProgramLevel })}
                options={LEVELS.map((l) => ({ value: l, label: l }))}
              />
            </Field>
          </div>

          {/* Row: Status (1/4) | Headcount (1/4) | Hiring Period (2/4) */}
          <div className="grid grid-cols-4 gap-4">
            <Field label="Status">
              <SelectInput
                value={draft.status}
                onChange={(v) => onChange({ status: v as ProgramStatus })}
                options={STATUSES}
              />
            </Field>
            <Field label="Headcount" required>
              <input
                type="number"
                min={1}
                value={draft.headcount}
                onChange={(e) =>
                  onChange({ headcount: Math.max(0, Number(e.target.value) || 0) })
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-violet-500 focus:outline-none"
              />
            </Field>
            <div className="col-span-2">
              <Field label="Hiring Period" required>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={draft.startDate}
                    onChange={(e) => onChange({ startDate: e.target.value })}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none"
                  />
                  <span className="text-gray-400">—</span>
                  <input
                    type="date"
                    value={draft.endDate}
                    onChange={(e) => onChange({ endDate: e.target.value })}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none"
                  />
                </div>
              </Field>
            </div>
          </div>

          {/* Row: Sharepoint Folder Link */}
          <Field
            label="Sharepoint Folder Link"
            icon={<HelpCircle size={12} />}
            hint="Where collected resumes will be stored."
          >
            <div className="relative">
              <FolderOpen
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="url"
                value={draft.folderLink}
                onChange={(e) => onChange({ folderLink: e.target.value })}
                placeholder="https://company.sharepoint.com/…"
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 focus:border-violet-500 focus:outline-none"
              />
            </div>
          </Field>

          {/* Advanced Settings (collapsible) */}
          <div className="rounded-lg border border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={() => setAdvancedOpen((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <span className="text-sm font-medium text-gray-700">
                Advanced Settings
              </span>
              {advancedOpen ? (
                <ChevronUp size={14} className="text-gray-500" />
              ) : (
                <ChevronRight size={14} className="text-gray-500" />
              )}
            </button>
            {advancedOpen && (
              <div className="grid grid-cols-2 gap-4 border-t border-gray-200 bg-white p-4">
                <Field label="Department">
                  <input
                    type="text"
                    value={draft.department}
                    onChange={(e) => onChange({ department: e.target.value })}
                    placeholder="e.g. Engineering"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-violet-500 focus:outline-none"
                  />
                </Field>
                <Field label="Employment Type">
                  <SelectInput
                    value={draft.employmentType}
                    onChange={(v) => onChange({ employmentType: v })}
                    options={[
                      { value: "", label: "—" },
                      { value: "full-time", label: "Full-time" },
                      { value: "part-time", label: "Part-time" },
                      { value: "contract", label: "Contract" },
                      { value: "internship", label: "Internship" },
                    ]}
                  />
                </Field>
                <Field label="Location">
                  <SelectInput
                    value={draft.location}
                    onChange={(v) => onChange({ location: v })}
                    options={[
                      { value: "", label: "—" },
                      { value: "remote", label: "Remote" },
                      { value: "onsite", label: "On-site" },
                      { value: "hybrid", label: "Hybrid" },
                    ]}
                  />
                </Field>
                <Field label="CV Templates">
                  <input
                    type="text"
                    value={draft.cvTemplate}
                    onChange={(e) => onChange({ cvTemplate: e.target.value })}
                    placeholder="e.g. Standard CV v2"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-violet-500 focus:outline-none"
                  />
                </Field>
              </div>
            )}
          </div>

          {/* Row: Description — Quill rich-text editor. Stores HTML
           *  on `draft.description`. */}
          <Field label="Description" hint="Public-facing job description.">
            <RichTextEditor
              value={draft.description}
              onChange={(html) => onChange({ description: html })}
              placeholder="What this role is, what the candidate will do, what success looks like…"
              minHeight={160}
            />
          </Field>
        </div>
      </section>

      {/* ============================================================
       * Section 2 — Skills Set & Labels (reuses the master widget)
       * ============================================================ */}
      <section>
        <h3 className="mb-3 flex items-center gap-1.5 text-base font-semibold text-violet-700">
          2. Skills Set & Labels
          <HelpCircle size={14} className="text-gray-400" />
        </h3>
        <SkillsLabelsSection
          tags={draft.skills}
          onTagsChange={(skills) => onChange({ skills })}
          labels={draft.labels}
          onLabelsChange={(labels) => onChange({ labels })}
          hideSaveButton
          hideHeader
        />
      </section>

    </div>
  );
}

/* -------------------------------------------------------------- */
/* Local helpers                                                  */
/* -------------------------------------------------------------- */

function Field({
  label,
  hint,
  required,
  icon,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500">*</span>}
        {icon && <span className="text-gray-400">{icon}</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 pr-9 py-2 text-sm focus:border-violet-500 focus:outline-none"
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
    </div>
  );
}
