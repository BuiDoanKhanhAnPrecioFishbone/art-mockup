"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  HelpCircle,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  X,
  BookOpen,
  Sparkles,
  Bold,
  Italic,
  Paperclip,
} from "lucide-react";
import {
  Button,
  Badge,
  Input,
  Select,
  Textarea,
  ToastProvider,
  useToast,
} from "@/shared/ui";
import type { Skill } from "@/shared/fixtures/jobs";

// ── Skill chip ──────────────────────────────────────────────────────────────
function SkillChip({ name, onRemove }: { name: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700">
      {name}
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X size={12} />
      </button>
    </span>
  );
}

// ── Skill column ────────────────────────────────────────────────────────────
function SkillColumn({
  label,
  labelColor,
  skills,
  onAdd,
  onRemove,
}: {
  label: string;
  labelColor: string;
  skills: Skill[];
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
}) {
  const [inputVal, setInputVal] = useState("");

  function commit() {
    const trimmed = inputVal.replace(/,/g, "").trim();
    if (trimmed) {
      onAdd(trimmed);
      setInputVal("");
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Column header */}
      <div className="flex items-center gap-2">
        <span className={`text-sm font-semibold ${labelColor}`}>{label}</span>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
          {skills.length} skill{skills.length !== 1 ? "s" : ""}
        </span>
        <HelpCircle size={13} className="text-gray-400" />
      </div>

      {/* Tag area */}
      <div
        className="min-h-[80px] rounded-xl border border-dashed border-gray-300 bg-gray-50 p-3 flex flex-wrap gap-1.5 cursor-text"
        onClick={() => document.getElementById(`skill-input-${label}`)?.focus()}
      >
        {skills.map((s) => (
          <SkillChip key={s.id} name={s.name} onRemove={() => onRemove(s.id)} />
        ))}
        {skills.length === 0 && (
          <span className="text-xs text-gray-400 italic self-center">
            Click to add skills…
          </span>
        )}
      </div>

      {/* Input */}
      <input
        id={`skill-input-${label}`}
        type="text"
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onKeyDown={handleKey}
        onBlur={commit}
        placeholder="Type and press Enter or comma…"
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30"
      />
    </div>
  );
}

// ── Rich text toolbar (visual only) ────────────────────────────────────────
function RichTextToolbar() {
  return (
    <div className="flex items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5 rounded-t-lg">
      {[
        { icon: <Bold size={14} />, label: "Bold" },
        { icon: <Italic size={14} />, label: "Italic" },
        { icon: <Paperclip size={14} />, label: "Attach" },
      ].map(({ icon, label }) => (
        <button
          key={label}
          type="button"
          title={label}
          className="flex h-7 w-7 items-center justify-center rounded text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
        >
          {icon}
        </button>
      ))}
    </div>
  );
}

// ── Inner form (needs toast context) ────────────────────────────────────────
function CreateTemplateInner() {
  const router = useRouter();
  const { showToast } = useToast();

  // Form fields
  const [jobTitle, setJobTitle] = useState("");
  const [jobLevel, setJobLevel] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [location, setLocation] = useState("");
  const [cvTemplate, setCvTemplate] = useState("");

  // Validation errors
  const [errors, setErrors] = useState<{ jobTitle?: string; jobLevel?: string }>({});

  // Advanced settings
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Skills
  const [mustHave, setMustHave] = useState<Skill[]>([]);
  const [niceToHave, setNiceToHave] = useState<Skill[]>([]);
  const [bonus, setBonus] = useState<Skill[]>([]);

  function makeSkill(name: string, category: Skill["category"]): Skill {
    return { id: `new-${Date.now()}-${Math.random()}`, name, category };
  }

  function addToColumn(
    setter: React.Dispatch<React.SetStateAction<Skill[]>>,
    category: Skill["category"],
    name: string
  ) {
    setter((prev) => [...prev, makeSkill(name, category)]);
  }

  function removeFromColumn(
    setter: React.Dispatch<React.SetStateAction<Skill[]>>,
    id: string
  ) {
    setter((prev) => prev.filter((s) => s.id !== id));
  }

  function validate() {
    const errs: typeof errors = {};
    if (!jobTitle.trim()) errs.jobTitle = "Job title is required.";
    if (!jobLevel) errs.jobLevel = "Job level is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    showToast("success", "Template created successfully.");
    setTimeout(() => {
      router.push("/flows/create-manage-jobs?tab=templates");
    }, 1500);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Page header ── */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        {/* Breadcrumb */}
        <nav className="mb-2 flex items-center gap-1.5 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-700">
            Home
          </Link>
          <ChevronRight size={14} />
          <Link
            href="/flows/create-manage-jobs"
            className="hover:text-gray-700"
          >
            Jobs Management
          </Link>
          <ChevronRight size={14} />
          <Link
            href="/flows/create-manage-jobs?tab=templates"
            className="hover:text-gray-700"
          >
            Job Templates
          </Link>
          <ChevronRight size={14} />
          <span className="font-medium text-gray-900">New</span>
        </nav>

        {/* Title row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">
              Create Job Template
            </h1>
            <HelpCircle size={16} className="text-gray-400" />
          </div>

          <div className="flex items-center gap-2">
            <Link href="/flows/create-manage-jobs?tab=templates">
              <Button variant="secondary" size="sm">
                Cancel
              </Button>
            </Link>
            <Button size="sm" onClick={handleSave}>
              Save Template
            </Button>
          </div>
        </div>
      </div>

      {/* ── Form content ── */}
      <div className="mx-auto max-w-4xl px-6 py-8 flex flex-col gap-8">
        {/* ── Section 1: General Information ── */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-base font-semibold text-gray-900">
            1. General Information
          </h2>

          <div className="flex flex-col gap-5">
            {/* Job Title */}
            <div>
              <Input
                id="job-title"
                label="Job Title *"
                placeholder="e.g. Frontend Developer"
                value={jobTitle}
                onChange={(e) => {
                  setJobTitle(e.target.value);
                  if (e.target.value.trim()) setErrors((p) => ({ ...p, jobTitle: undefined }));
                }}
                error={errors.jobTitle}
              />
            </div>

            {/* Job Level */}
            <div>
              <Select
                id="job-level"
                label="Job Level *"
                placeholder="Select a level…"
                value={jobLevel}
                onChange={(e) => {
                  setJobLevel(e.target.value);
                  if (e.target.value) setErrors((p) => ({ ...p, jobLevel: undefined }));
                }}
                error={errors.jobLevel}
                options={[
                  { value: "Fresher", label: "Fresher" },
                  { value: "Junior", label: "Junior" },
                  { value: "Middle", label: "Middle" },
                  { value: "Senior", label: "Senior" },
                  { value: "Lead", label: "Lead" },
                ]}
              />
            </div>

            {/* Description with mini toolbar */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="description"
                className="text-sm font-medium text-gray-700"
              >
                Description *
              </label>
              <div className="overflow-hidden rounded-lg border border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <RichTextToolbar />
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the role, responsibilities, and requirements…"
                  rows={6}
                  className="w-full resize-none bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Advanced Settings collapsible */}
            <div className="rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => setAdvancedOpen((v) => !v)}
                className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-blue-600 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <span>Advanced Setting</span>
                {advancedOpen ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRightIcon size={16} />
                )}
              </button>

              {advancedOpen && (
                <div className="border-t border-gray-200 px-4 pb-4 pt-4 flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Select department…"
                      options={[
                        { value: "Engineering", label: "Engineering" },
                        { value: "Marketing", label: "Marketing" },
                        { value: "Finance", label: "Finance" },
                        { value: "HR", label: "HR" },
                        { value: "Sales", label: "Sales" },
                        { value: "Design", label: "Design" },
                      ]}
                    />
                    <Select
                      label="Employment Type"
                      value={employmentType}
                      onChange={(e) => setEmploymentType(e.target.value)}
                      placeholder="Select type…"
                      options={[
                        { value: "Full-time", label: "Full-time" },
                        { value: "Part-time", label: "Part-time" },
                        { value: "Internship", label: "Internship" },
                        { value: "Contract", label: "Contract" },
                      ]}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Location"
                      placeholder="e.g. Remote, Ho Chi Minh City…"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                    <Input
                      label="CV Templates"
                      placeholder="Template name or URL…"
                      value={cvTemplate}
                      onChange={(e) => setCvTemplate(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Section 2: Skills ── */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-gray-900">2. Skills</h2>
              <HelpCircle size={15} className="text-gray-400" />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" type="button">
                <BookOpen size={14} />
                Browse Library
              </Button>
              <Button
                variant="secondary"
                size="sm"
                type="button"
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Sparkles size={14} />
                AI Auto-Extract
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 divide-x divide-gray-100">
            <SkillColumn
              label="Must-have"
              labelColor="text-red-600"
              skills={mustHave}
              onAdd={(n) => addToColumn(setMustHave, "must-have", n)}
              onRemove={(id) => removeFromColumn(setMustHave, id)}
            />
            <div className="pl-6">
              <SkillColumn
                label="Nice-to-have"
                labelColor="text-amber-600"
                skills={niceToHave}
                onAdd={(n) => addToColumn(setNiceToHave, "nice-to-have", n)}
                onRemove={(id) => removeFromColumn(setNiceToHave, id)}
              />
            </div>
            <div className="pl-6">
              <SkillColumn
                label="Bonus"
                labelColor="text-green-600"
                skills={bonus}
                onAdd={(n) => addToColumn(setBonus, "bonus", n)}
                onRemove={(id) => removeFromColumn(setBonus, id)}
              />
            </div>
          </div>
        </div>

        {/* ── Footer save bar ── */}
        <div className="flex justify-end gap-3 pb-4">
          <Link href="/flows/create-manage-jobs?tab=templates">
            <Button variant="secondary">Cancel</Button>
          </Link>
          <Button onClick={handleSave}>Save Template</Button>
        </div>
      </div>
    </div>
  );
}

// ── Default export ──────────────────────────────────────────────────────────
export default function CreateTemplatePage() {
  return (
    <ToastProvider>
      <CreateTemplateInner />
    </ToastProvider>
  );
}
