"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronRight,
  HelpCircle,
  Edit2,
  MoreVertical,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { SkillsLabelsSection } from "@/widgets/job-vacancy";
import { jobPrograms, jobTemplates } from "@/shared/fixtures/jobs";
import type { Skill } from "@/shared/fixtures/jobs";
import { PipelinesTab } from "./PipelinesTab";
import {
  Button,
  Badge,
  Input,
  Textarea,
  Select,
  Modal,
  ToastProvider,
  useToast,
} from "@/shared/ui";

// ── Three-dot menu ─────────────────────────────────────────────────────────
function ThreeDotsMenu({
  onEdit,
  onDuplicate,
  onSaveAsTemplate,
  onMarkClosed,
  onDelete,
}: {
  onEdit: () => void;
  onDuplicate: () => void;
  onSaveAsTemplate: () => void;
  onMarkClosed: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const items = [
    { label: "Edit Program", action: onEdit },
    { label: "Duplicate", action: onDuplicate },
    { label: "Save as Template", action: onSaveAsTemplate },
    { label: "Mark as Closed", action: onMarkClosed, danger: false },
    { label: "Delete", action: onDelete, danger: true },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition-colors"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-20 w-48 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setOpen(false);
                item.action();
              }}
              className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                item.danger ? "text-red-600" : "text-gray-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Status badge helper ────────────────────────────────────────────────────
function statusVariant(status: string): "success" | "warning" | "default" {
  if (status === "open") return "success";
  if (status === "draft") return "warning";
  return "default";
}

// ── Inner page (needs toast context) ──────────────────────────────────────
function ProgramDetailInner() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const program = jobPrograms.find((p) => p.id === id);
  const { showToast } = useToast();

  // Tabs
  const [activeTab, setActiveTab] = useState<"pipelines" | "settings" | "report">("settings");

  // Edit mode
  const [editMode, setEditMode] = useState(false);

  // Advanced settings expand
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Form fields (edit state)
  const [fields, setFields] = useState({
    name: program?.name ?? "",
    jobTitle: program?.jobTitle ?? "",
    jobLevel: program?.jobLevel ?? "",
    status: program?.status ?? "draft",
    headcount: program?.headcount?.toString() ?? "",
    startDate: program?.startDate ?? "",
    endDate: program?.endDate ?? "",
    department: program?.department ?? "",
    employmentType: program?.employmentType ?? "",
    location: program?.location ?? "",
    cvTemplate: program?.cvTemplate ?? "",
    description: program?.description ?? "",
    programUrl: program?.programUrl ?? "",
  });

  // Skills state
  const [skills, setSkills] = useState<Skill[]>(program?.skills ?? []);

  // Template modal state
  const [templateModal, setTemplateModal] = useState<
    null | "new" | "overwrite"
  >(null);

  if (!program) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
        <p className="text-lg font-semibold text-gray-700">Program not found</p>
        <Link
          href="/flows/create-manage-jobs"
          className="text-sm text-blue-600 underline hover:text-blue-800"
        >
          ← Back to Jobs Management
        </Link>
      </div>
    );
  }

  // Skills helpers
  function addSkill(category: Skill["category"], name: string) {
    setSkills((prev) => [
      ...prev,
      { id: `sk-${Date.now()}`, name, category },
    ]);
  }

  function removeSkill(id: string) {
    setSkills((prev) => prev.filter((s) => s.id !== id));
  }

  function skillsFor(cat: Skill["category"]) {
    return skills.filter((s) => s.category === cat);
  }

  // Save / cancel
  function handleSave() {
    setEditMode(false);
    showToast("success", "Program saved successfully.");
  }

  function handleCancel() {
    if (!program) return;
    // Reset local state
    setFields({
      name: program.name,
      jobTitle: program.jobTitle,
      jobLevel: program.jobLevel,
      status: program.status,
      headcount: program.headcount.toString(),
      startDate: program.startDate,
      endDate: program.endDate,
      department: program.department ?? "",
      employmentType: program.employmentType ?? "",
      location: program.location ?? "",
      cvTemplate: program.cvTemplate ?? "",
      description: program.description,
      programUrl: program.programUrl ?? "",
    });
    setSkills(program.skills);
    setEditMode(false);
  }

  // Save as Template
  function handleSaveAsTemplate() {
    const exists = jobTemplates.some(
      (t) =>
        t.jobTitle.toLowerCase() === fields.jobTitle.toLowerCase() &&
        t.level.toLowerCase() === fields.jobLevel.toLowerCase()
    );
    setTemplateModal(exists ? "overwrite" : "new");
  }

  function handleConfirmTemplate() {
    setTemplateModal(null);
    showToast("success", "Template saved successfully.");
  }

  const f = fields;

  const readonlyField = (value: string, label: string) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 min-h-[38px]">
        {value || <span className="text-gray-400 italic">—</span>}
      </div>
    </div>
  );

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
          <Link href="/flows/create-manage-jobs" className="hover:text-gray-700">
            Jobs Management
          </Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium truncate max-w-[260px]">
            {program.name}
          </span>
        </nav>

        {/* Title row */}
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 truncate">
            {program.name}
          </h1>
          <HelpCircle size={16} className="text-gray-400 shrink-0" />
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="border-b border-gray-200 bg-white px-6">
        <div className="flex gap-0">
          {(["pipelines", "settings", "report"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-5 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="px-6 py-8">
        {/* Pipelines tab */}
        {activeTab === "pipelines" && (
          <PipelinesTab programId={id ?? ""} />
        )}

        {/* Coming soon tabs */}
        {activeTab === "report" && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center">
            <span className="text-3xl">🚧</span>
            <p className="text-lg font-semibold text-gray-700">Coming soon</p>
            <p className="text-sm text-gray-400">
              This tab is not yet available in this prototype.
            </p>
          </div>
        )}

        {/* Settings tab */}
        {activeTab === "settings" && (
          <div className="flex flex-col gap-8">
            {/* ── Section 1: General Information ── */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">
                  1. General Information
                </h2>
                <div className="flex items-center gap-2">
                  {editMode ? (
                    <>
                      <Button variant="secondary" size="sm" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSave}>
                        Save
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="secondary" size="sm" onClick={() => setEditMode(true)}>
                        <Edit2 size={14} />
                        Edit
                      </Button>
                      <ThreeDotsMenu
                        onEdit={() => setEditMode(true)}
                        onDuplicate={() => showToast("success", "Program duplicated.")}
                        onSaveAsTemplate={handleSaveAsTemplate}
                        onMarkClosed={() => showToast("success", "Program marked as closed.")}
                        onDelete={() => showToast("error", "Delete is not available in this prototype.")}
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-5">
                {/* Program Name */}
                {editMode ? (
                  <Input
                    label="Program Name"
                    value={f.name}
                    onChange={(e) => setFields({ ...f, name: e.target.value })}
                  />
                ) : (
                  readonlyField(f.name, "Program Name")
                )}

                {/* Job Title + Job Level */}
                <div className="grid grid-cols-2 gap-4">
                  {editMode ? (
                    <Input
                      label="Job Title"
                      value={f.jobTitle}
                      onChange={(e) => setFields({ ...f, jobTitle: e.target.value })}
                    />
                  ) : (
                    readonlyField(f.jobTitle, "Job Title")
                  )}
                  {editMode ? (
                    <Input
                      label="Job Level"
                      value={f.jobLevel}
                      onChange={(e) => setFields({ ...f, jobLevel: e.target.value })}
                    />
                  ) : (
                    readonlyField(f.jobLevel, "Job Level")
                  )}
                </div>

                {/* Status + Headcount + Hiring Period */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    {editMode ? (
                      <Select
                        value={f.status}
                        onChange={(e) =>
                          setFields({ ...f, status: e.target.value as "open" | "draft" })
                        }
                        options={[
                          { value: "open", label: "Open" },
                          { value: "draft", label: "Draft" },
                          { value: "closed", label: "Closed" },
                        ]}
                      />
                    ) : (
                      <div className="flex items-center pt-1">
                        <Badge variant={statusVariant(f.status)}>
                          {f.status.charAt(0).toUpperCase() + f.status.slice(1)}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {editMode ? (
                    <Input
                      label="Headcount"
                      type="number"
                      value={f.headcount}
                      onChange={(e) => setFields({ ...f, headcount: e.target.value })}
                    />
                  ) : (
                    readonlyField(f.headcount, "Headcount")
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Hiring Period</label>
                    {editMode ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          value={f.startDate}
                          onChange={(e) => setFields({ ...f, startDate: e.target.value })}
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                        <span className="text-gray-400 text-sm">–</span>
                        <input
                          type="date"
                          value={f.endDate}
                          onChange={(e) => setFields({ ...f, endDate: e.target.value })}
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    ) : (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                        {f.startDate} – {f.endDate}
                      </div>
                    )}
                  </div>
                </div>

                {/* Advanced Settings collapsible */}
                <div className="rounded-xl border border-gray-200">
                  <button
                    onClick={() => setAdvancedOpen((v) => !v)}
                    className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-blue-600 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <span>Advanced Settings</span>
                    {advancedOpen ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRightIcon size={16} />
                    )}
                  </button>

                  {advancedOpen && (
                    <div className="border-t border-gray-200 px-4 pb-4 pt-4 flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        {editMode ? (
                          <Input
                            label="Department"
                            value={f.department}
                            onChange={(e) => setFields({ ...f, department: e.target.value })}
                          />
                        ) : (
                          readonlyField(f.department, "Department")
                        )}
                        {editMode ? (
                          <Select
                            label="Employment Type"
                            value={f.employmentType}
                            onChange={(e) => setFields({ ...f, employmentType: e.target.value })}
                            options={[
                              { value: "Full-time", label: "Full-time" },
                              { value: "Part-time", label: "Part-time" },
                              { value: "Internship", label: "Internship" },
                              { value: "Contract", label: "Contract" },
                            ]}
                          />
                        ) : (
                          readonlyField(f.employmentType, "Employment Type")
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {editMode ? (
                          <Input
                            label="Location"
                            value={f.location}
                            onChange={(e) => setFields({ ...f, location: e.target.value })}
                          />
                        ) : (
                          readonlyField(f.location, "Location")
                        )}
                        {editMode ? (
                          <Input
                            label="CV Templates"
                            value={f.cvTemplate}
                            onChange={(e) => setFields({ ...f, cvTemplate: e.target.value })}
                          />
                        ) : (
                          readonlyField(f.cvTemplate || "—", "CV Templates")
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                {editMode ? (
                  <Textarea
                    label="Description"
                    value={f.description}
                    rows={6}
                    onChange={(e) => setFields({ ...f, description: e.target.value })}
                  />
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 whitespace-pre-line min-h-[100px]">
                      {f.description || <span className="text-gray-400 italic">—</span>}
                    </div>
                  </div>
                )}

                {/* Program URL */}
                {editMode ? (
                  <Input
                    label="Program URL / Link (optional)"
                    value={f.programUrl}
                    placeholder="https://…"
                    onChange={(e) => setFields({ ...f, programUrl: e.target.value })}
                  />
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Program URL / Link (optional)
                    </label>
                    {f.programUrl ? (
                      <a
                        href={f.programUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-blue-600 underline hover:text-blue-800 block truncate"
                      >
                        {f.programUrl}
                      </a>
                    ) : (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400 italic">
                        —
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ── Section 2: Skills & Labels ── */}
            {editMode ? (
              /* Full interactive widget in edit mode */
              <SkillsLabelsSection />
            ) : (
              /* Read-only skill chips in view mode */
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-2">
                  <h2 className="text-base font-semibold text-gray-900">2. Skills &amp; Labels</h2>
                  <HelpCircle size={15} className="text-gray-400" />
                </div>
                <div className="grid grid-cols-3 gap-6 divide-x divide-gray-100">
                  {(["must-have", "nice-to-have", "bonus"] as const).map((cat, i) => {
                    const colorMap = { "must-have": "text-red-600", "nice-to-have": "text-amber-600", bonus: "text-green-600" };
                    const labelMap = { "must-have": "Must-have", "nice-to-have": "Nice-to-have", bonus: "Bonus" };
                    const catSkills = skillsFor(cat);
                    return (
                      <div key={cat} className={i > 0 ? "pl-6" : ""}>
                        <p className={`text-sm font-semibold mb-2 ${colorMap[cat]}`}>{labelMap[cat]}</p>
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
          </div>
        )}
      </div>

      {/* ── Save as Template modals ── */}
      <Modal
        open={templateModal === "new"}
        onClose={() => setTemplateModal(null)}
        title="Save New Template"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setTemplateModal(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirmTemplate}>
              Save Template
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          The position{" "}
          <strong>
            {fields.jobTitle} - {fields.jobLevel}
          </strong>{" "}
          does not currently exist in the Master Library. Save this configuration as a new
          standard template?
        </p>
      </Modal>

      <Modal
        open={templateModal === "overwrite"}
        onClose={() => setTemplateModal(null)}
        title="Overwrite Existing Template"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setTemplateModal(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700 border-transparent text-white"
              onClick={handleConfirmTemplate}
            >
              Overwrite Template
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          A standard template for{" "}
          <strong>
            {fields.jobTitle} - {fields.jobLevel}
          </strong>{" "}
          already exists in the library. Continuing will overwrite the current master template.{" "}
          <strong>This action cannot be undone.</strong>
        </p>
      </Modal>
    </div>
  );
}

// ── Default export (wraps with toast provider) ──────────────────────────────
export default function ProgramDetailPage() {
  return (
    <ToastProvider>
      <ProgramDetailInner />
    </ToastProvider>
  );
}
