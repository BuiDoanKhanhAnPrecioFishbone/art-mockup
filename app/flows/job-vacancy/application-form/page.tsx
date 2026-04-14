"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Lock,
  Edit3,
  Save,
  X,
  Copy,
  Check,
  Info,
  GripVertical,
  Trash2,
  Plus,
  ChevronDown,
  Eye,
  Smartphone,
  Monitor,
  AlertCircle,
} from "lucide-react";
import {
  SYSTEM_CORE_FIELDS,
  FIELD_TYPE_META,
  applicationFormFixture,
} from "@/shared/fixtures/application-form";
import type { CustomField, FieldType } from "@/shared/fixtures/application-form";

// ─── types ───────────────────────────────────────────────────────────────────
type Mode = "view" | "edit";
type Copied = "url" | "embed" | null;
type Tab =
  | "general-info"
  | "pipelines"
  | "workflow-setting"
  | "application-form"
  | "email-logs"
  | "reports";

const TABS: { id: Tab; label: string }[] = [
  { id: "general-info", label: "General Info" },
  { id: "pipelines", label: "Pipelines" },
  { id: "workflow-setting", label: "Workflow Setting" },
  { id: "application-form", label: "Application Form" },
  { id: "email-logs", label: "Email Logs" },
  { id: "reports", label: "Reports" },
];

const FIELD_TYPES: FieldType[] = [
  "short-text",
  "paragraph",
  "number",
  "dropdown",
  "checkbox",
  "file-upload",
];

// ─── small reusable pieces ────────────────────────────────────────────────────
function TooltipIcon({ text }: { text: string }) {
  return (
    <span
      title={text}
      className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-[10px] cursor-help"
    >
      ?
    </span>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
        checked ? "bg-blue-600" : "bg-gray-300"
      }`}
      aria-label={label}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// ─── form preview (mobile + desktop) ─────────────────────────────────────────
type PreviewDevice = "mobile" | "desktop";

function FormPreview({
  device,
  onDeviceChange,
  customFields,
  phoneRequired,
  sourceVisible,
}: {
  device: PreviewDevice;
  onDeviceChange: (d: PreviewDevice) => void;
  customFields: CustomField[];
  phoneRequired: boolean;
  sourceVisible: boolean;
}) {
  return (
    /* outer gray canvas — matches the Figma wireframe panel */
    <div className="flex flex-col items-center w-full">
      {/* device toggle bar — centered at top of canvas, like the wireframe */}
      <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm mb-4 p-0.5">
        <button
          type="button"
          onClick={() => onDeviceChange("desktop")}
          title="Desktop view"
          className={`p-1.5 rounded-md transition-colors ${
            device === "desktop"
              ? "bg-gray-100 text-gray-800"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Monitor size={15} />
        </button>
        <button
          type="button"
          onClick={() => onDeviceChange("mobile")}
          title="Mobile view"
          className={`p-1.5 rounded-md transition-colors ${
            device === "mobile"
              ? "bg-gray-100 text-gray-800"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Smartphone size={15} />
        </button>
      </div>

      {device === "mobile" ? (
        /* ── phone shell ── */
        <div className="w-72 border-[4px] border-gray-800 rounded-[36px] overflow-hidden shadow-2xl bg-white">
          {/* notch */}
          <div className="bg-gray-800 h-6 flex items-center justify-center">
            <div className="w-14 h-2 bg-gray-600 rounded-full" />
          </div>
          {/* screen */}
          <div className="bg-gray-50 p-4 space-y-3 min-h-[520px] overflow-y-auto text-xs">
            <div className="bg-purple-700 text-white font-bold text-[11px] px-3 py-1 rounded w-fit">
              PrecioFishbone
            </div>
            <div className="font-semibold text-sm text-gray-800 leading-tight">
              Q1 Marketing Hiring
            </div>
            <div className="text-gray-400 text-[11px]">Marketing · Remote</div>
            <div className="border-t border-gray-200 pt-2.5 space-y-2.5">
              <PreviewField label="Full Name *" />
              <PreviewField label="Email Address *" />
              {phoneRequired && <PreviewField label="Phone Number" />}
              {sourceVisible && <PreviewField label="Source" select />}
              <div className="bg-gray-100 rounded-lg p-2 text-gray-400 text-[11px] text-center">
                ↑ Resume / CV
              </div>
              {customFields.map((f) => (
                <PreviewField
                  key={f.id}
                  label={f.label || FIELD_TYPE_META[f.type].label}
                  required={f.required}
                  select={f.type === "dropdown"}
                />
              ))}
              <div className="flex items-start gap-2 pt-1">
                <div className="w-3.5 h-3.5 border border-gray-400 rounded-sm mt-0.5 flex-shrink-0" />
                <span className="text-gray-500 text-[11px] leading-tight">
                  I agree to the Privacy Policy
                </span>
              </div>
            </div>
            <button className="w-full bg-purple-700 text-white text-xs py-2 rounded-lg font-medium">
              Submit Application
            </button>
          </div>
        </div>
      ) : (
        /* ── desktop browser shell ── */
        <div className="w-full border border-gray-300 rounded-xl overflow-hidden shadow-md bg-white text-sm">
          {/* browser chrome */}
          <div className="bg-gray-100 border-b border-gray-200 px-4 py-2.5 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 bg-white rounded-lg px-3 py-1 text-xs text-gray-400 font-mono border border-gray-200 truncate">
              careers.preciofishbone.com/jobs/req-12345/apply
            </div>
          </div>
          {/* page content */}
          <div className="bg-gray-50 p-4 space-y-3 max-h-[480px] overflow-y-auto">
            {/* header */}
            <div className="bg-purple-700 text-white rounded-lg px-4 py-2.5 flex items-center gap-3">
              <span className="font-bold text-sm">PrecioFishbone</span>
              <span className="text-purple-300 text-xs">· Careers</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-base">Q1 Marketing Hiring</p>
              <p className="text-gray-400 text-xs mt-0.5">Marketing · Remote</p>
            </div>
            {/* form card */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <DesktopPreviewField label="Full Name *" />
                <DesktopPreviewField label="Email Address *" />
                {phoneRequired && <DesktopPreviewField label="Phone Number" />}
                {sourceVisible && <DesktopPreviewField label="Source" select />}
              </div>
              <DesktopPreviewField label="Resume / CV *" upload />
              {customFields.length > 0 && (
                <div className="border-t border-dashed border-gray-100 pt-3 grid grid-cols-2 gap-3">
                  {customFields.map((f) => (
                    <DesktopPreviewField
                      key={f.id}
                      label={f.label || FIELD_TYPE_META[f.type].label}
                      required={f.required}
                      select={f.type === "dropdown"}
                    />
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2 pt-1">
                <div className="w-4 h-4 border border-gray-400 rounded-sm flex-shrink-0" />
                <span className="text-gray-500 text-xs">
                  I agree to the Privacy Policy
                </span>
              </div>
              <button className="w-full bg-purple-700 text-white text-sm py-2 rounded-lg font-medium">
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DesktopPreviewField({
  label,
  required,
  select,
  upload,
}: {
  label: string;
  required?: boolean;
  select?: boolean;
  upload?: boolean;
}) {
  return (
    <div>
      <div className="text-gray-500 text-xs font-medium mb-1">
        {label}
        {required && <span className="text-red-400"> *</span>}
      </div>
      {upload ? (
        <div className="border-2 border-dashed border-gray-200 rounded-lg px-3 py-3 text-gray-300 text-xs text-center">
          ↑ Upload file
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex items-center justify-between">
          <span className="text-gray-300 text-xs">—</span>
          {select && <ChevronDown size={12} className="text-gray-300" />}
        </div>
      )}
    </div>
  );
}

function PreviewField({
  label,
  required,
  select,
}: {
  label: string;
  required?: boolean;
  select?: boolean;
}) {
  return (
    <div>
      <div className="text-gray-500 text-[11px] mb-1">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </div>
      <div className="bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-300 text-[11px] flex items-center justify-between">
        <span>—</span>
        {select && <ChevronDown size={10} />}
      </div>
    </div>
  );
}

// ─── custom field card (in builder) ──────────────────────────────────────────
function FieldCard({
  field,
  onUpdate,
  onDelete,
}: {
  field: CustomField;
  onUpdate: (updated: CustomField) => void;
  onDelete: (id: string) => void;
}) {
  const meta = FIELD_TYPE_META[field.type];
  return (
    <div className="flex items-start gap-2 p-3 bg-white border border-gray-200 rounded-lg group hover:border-blue-300 transition-colors">
      <GripVertical
        size={14}
        className="text-gray-300 mt-0.5 cursor-grab group-hover:text-gray-400 flex-shrink-0"
      />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
            {meta.label}
          </span>
        </div>
        <input
          className="w-full text-sm border-0 border-b border-gray-200 focus:border-blue-400 focus:outline-none bg-transparent pb-0.5"
          value={field.label}
          placeholder={`New ${meta.label.toLowerCase()} question`}
          onChange={(e) => onUpdate({ ...field, label: e.target.value })}
        />
        {field.type === "dropdown" || field.type === "checkbox" ? (
          <div className="space-y-1">
            {(field.options ?? ["Option 1", "Option 2"]).map((opt, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div
                  className={`w-3 h-3 border border-gray-300 flex-shrink-0 ${
                    field.type === "checkbox" ? "rounded-sm" : "rounded-full"
                  }`}
                />
                <input
                  className="text-xs flex-1 border-0 border-b border-gray-100 focus:border-gray-300 focus:outline-none bg-transparent"
                  value={opt}
                  onChange={(e) => {
                    const opts = [...(field.options ?? [])];
                    opts[i] = e.target.value;
                    onUpdate({ ...field, options: opts });
                  }}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                onUpdate({
                  ...field,
                  options: [
                    ...(field.options ?? []),
                    `Option ${(field.options?.length ?? 2) + 1}`,
                  ],
                })
              }
              className="text-[11px] text-blue-500 hover:text-blue-700"
            >
              + Add option
            </button>
          </div>
        ) : null}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-xs text-gray-500">Required</span>
          <Toggle
            checked={field.required}
            onChange={(v) => onUpdate({ ...field, required: v })}
          />
        </div>
      </div>
      <button
        type="button"
        onClick={() => onDelete(field.id)}
        className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────
export default function ApplicationFormPage() {
  const [activeTab, setActiveTab] = useState<Tab>("application-form");
  const [mode, setMode] = useState<Mode>("view");
  const [copied, setCopied] = useState<Copied>(null);
  const [device, setDevice] = useState<PreviewDevice>("mobile");
  const [phoneRequired, setPhoneRequired] = useState(false);
  const [sourceVisible, setSourceVisible] = useState(
    applicationFormFixture.sourceVisible
  );
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [startDate, setStartDate] = useState("2026-03-24");
  const [endDate, setEndDate] = useState("2026-04-30");

  const handleCopy = (type: "url" | "embed") => {
    const text =
      type === "url"
        ? applicationFormFixture.publicUrl
        : applicationFormFixture.embedCode;
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const addField = useCallback((type: FieldType) => {
    const newField: CustomField = {
      id: `field-${Date.now()}`,
      type,
      label: "",
      required: false,
      options:
        type === "dropdown" || type === "checkbox"
          ? ["Option 1", "Option 2"]
          : undefined,
    };
    setCustomFields((prev) => [...prev, newField]);
  }, []);

  const updateField = useCallback((updated: CustomField) => {
    setCustomFields((prev) =>
      prev.map((f) => (f.id === updated.id ? updated : f))
    );
  }, []);

  const deleteField = useCallback((id: string) => {
    setCustomFields((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── page header ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <p className="text-xs text-gray-400 mb-1">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          {" / "}
          <span>Jobs</span>
          {" / "}
          <span className="text-gray-600 font-medium">Q1 Marketing Hiring</span>
        </p>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-gray-900">
            Q1 Marketing Hiring
          </h1>
          <TooltipIcon text="Active job vacancy — click to view full details" />
        </div>
      </div>

      {/* ── tab bar ── */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── non-active tab placeholder ── */}
      {activeTab !== "application-form" && (
        <div className="flex items-center justify-center py-32 text-gray-400">
          <div className="text-center">
            <AlertCircle size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              This tab is not part of the Application Form flow.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab("application-form")}
              className="mt-3 text-sm text-blue-500 hover:underline"
            >
              Go to Application Form tab →
            </button>
          </div>
        </div>
      )}

      {/* ── application form tab ── */}
      {activeTab === "application-form" && (
        <div className="max-w-6xl mx-auto p-6">
          {/* ── section header ── */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">
                Application Form
              </h2>
              <TooltipIcon text="This is the public form candidates fill in when applying for this job." />
            </div>
            {mode === "view" ? (
              <button
                type="button"
                onClick={() => setMode("edit")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Edit3 size={14} />
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode("view")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <X size={14} />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setMode("view")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  <Save size={14} />
                  Save
                </button>
              </div>
            )}
          </div>

          {/* ── status + duration row ── */}
          <div className="flex items-end gap-4 mb-6">
            {/* status */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Status
              </label>
              {mode === "view" ? (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                    status === "active"
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      status === "active" ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                  {status === "active" ? "Active" : "Inactive"}
                </span>
              ) : (
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "active" | "inactive")
                  }
                  className="text-sm border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              )}
            </div>

            {/* duration */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Duration (dd/mm/yyyy)
                <span className="text-red-400 ml-0.5">*</span>
              </label>
              {mode === "view" ? (
                <span className="text-sm text-gray-700">
                  {new Date(startDate).toLocaleDateString("en-GB")} →{" "}
                  {new Date(endDate).toLocaleDateString("en-GB")}
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-400">→</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* ── two-column content ── */}
          <div className="grid grid-cols-5 gap-6">
            {/* ── left column ── */}
            <div className="col-span-2 space-y-5">
              {mode === "view" ? (
                <>
                  {/* Public URL */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1.5">
                      Public URL
                    </p>
                    <div className="flex items-stretch gap-2">
                      <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 font-mono overflow-x-auto whitespace-nowrap">
                        {applicationFormFixture.publicUrl}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy("url")}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                          copied === "url"
                            ? "bg-green-50 border-green-300 text-green-700"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {copied === "url" ? (
                          <Check size={14} />
                        ) : (
                          <Copy size={14} />
                        )}
                        {copied === "url" ? "Copied!" : "Copy URL"}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Share this link in job posts and emails.
                    </p>
                  </div>

                  {/* Embed Code */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1.5">
                      Embed Code (iframe)
                    </p>
                    <div className="flex items-stretch gap-2">
                      <div className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-500 font-mono overflow-x-auto whitespace-nowrap">
                        {applicationFormFixture.embedCode}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy("embed")}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors border flex-shrink-0 ${
                          copied === "embed"
                            ? "bg-green-50 border-green-300 text-green-700"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {copied === "embed" ? (
                          <Check size={14} />
                        ) : (
                          <Copy size={14} />
                        )}
                        {copied === "embed" ? "Copied!" : "Copy HTML"}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Embed this form directly on your careers page.
                    </p>
                  </div>

                  {/* Security info */}
                  <div className="flex gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <Info
                      size={16}
                      className="text-blue-500 flex-shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-medium text-blue-800 mb-1">
                        Security &amp; Data Flow
                      </p>
                      <ul className="text-xs text-blue-700 space-y-0.5 list-disc list-inside leading-relaxed">
                        <li>
                          Protected by Google reCAPTCHA v3 to prevent bot spam.
                        </li>
                        <li>
                          Uploaded CVs are scanned via Anti-virus API before
                          storage.
                        </li>
                        <li>
                          Duplicate applications are automatically rejected
                          based on Email Address.
                        </li>
                        <li>
                          Candidate data entered in the form will override data
                          parsed from the CV by AI.
                        </li>
                        <li>
                          New applications are routed directly to the Candidate
                          Inbox for manual review.
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* preview link */}
                  <div>
                    <Link
                      href="/apply/q1-marketing-hiring"
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                    >
                      <Eye size={14} />
                      Preview candidate form →
                    </Link>
                  </div>
                </>
              ) : (
                /* ── EDIT MODE: form builder ── */
                <div className="space-y-6">
                  {/* 1. System Core Fields */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-sm font-semibold text-gray-800">
                        1. System Core Fields
                      </h3>
                      <TooltipIcon text="Locked fields required for ATS processing and AI parsing. These cannot be removed." />
                    </div>
                    <p className="text-xs text-gray-400 mb-3">
                      Locked fields required for ATS processing and AI parsing.
                    </p>
                    <div className="space-y-2">
                      {SYSTEM_CORE_FIELDS.map((field) => (
                        <div
                          key={field.id}
                          className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg"
                        >
                          {field.locked ? (
                            <Lock
                              size={13}
                              className="text-gray-300 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-[13px]" />
                          )}
                          <span
                            className={`flex-1 text-sm ${
                              field.locked
                                ? "text-gray-400"
                                : "text-gray-700"
                            }`}
                          >
                            {field.label}
                            {field.locked && (
                              <span className="ml-1.5 text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">
                                locked
                              </span>
                            )}
                          </span>
                          {"toggleKey" in field && (
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs text-gray-400">
                                {field.toggleKey === "phoneRequired"
                                  ? phoneRequired
                                    ? "Required"
                                    : "Optional"
                                  : sourceVisible
                                  ? "Visible"
                                  : "Hidden"}
                              </span>
                              <Toggle
                                checked={
                                  field.toggleKey === "phoneRequired"
                                    ? phoneRequired
                                    : sourceVisible
                                }
                                onChange={(v) => {
                                  if (field.toggleKey === "phoneRequired")
                                    setPhoneRequired(v);
                                  else setSourceVisible(v);
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. Custom Fields */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-sm font-semibold text-gray-800">
                        2. Custom Fields
                      </h3>
                      <TooltipIcon text="Add screening questions for applicants." />
                    </div>
                    <p className="text-xs text-gray-400 mb-3">
                      Add screening questions for applicants.
                    </p>

                    {/* existing custom fields */}
                    {customFields.length > 0 ? (
                      <div className="space-y-2 mb-4">
                        {customFields.map((f) => (
                          <FieldCard
                            key={f.id}
                            field={f}
                            onUpdate={updateField}
                            onDelete={deleteField}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center mb-4">
                        <p className="text-sm text-gray-400">
                          No custom fields added yet.
                        </p>
                        <p className="text-xs text-gray-300 mt-0.5">
                          Pick a field type below to get started.
                        </p>
                      </div>
                    )}

                    {/* field type picker */}
                    <div className="grid grid-cols-2 gap-2">
                      {FIELD_TYPES.map((type) => {
                        const meta = FIELD_TYPE_META[type];
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => addField(type)}
                            className="flex items-center gap-2.5 p-2.5 bg-white border border-gray-200 rounded-lg text-left hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                          >
                            <span className="w-7 h-7 rounded-md bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center text-base font-bold text-gray-500 group-hover:text-blue-600 flex-shrink-0">
                              {meta.icon}
                            </span>
                            <div>
                              <p className="text-xs font-medium text-gray-700 group-hover:text-blue-700">
                                {meta.label}
                              </p>
                              <p className="text-[10px] text-gray-400 group-hover:text-blue-500">
                                {meta.description}
                              </p>
                            </div>
                            <Plus
                              size={12}
                              className="ml-auto text-gray-300 group-hover:text-blue-500"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── right column: device preview ── */}
            <div className="col-span-3 bg-gray-100 rounded-2xl p-6 flex flex-col items-center">
              <FormPreview
                device={device}
                onDeviceChange={setDevice}
                customFields={customFields}
                phoneRequired={phoneRequired}
                sourceVisible={sourceVisible}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
