"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  HelpCircle,
  Info,
  Lock,
  Monitor,
  Shield,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useToast } from "@/shared/ui/toast";
import {
  PROTECTED_FIELD_IDS,
  publicFormEmbedCode,
  publicFormUrl,
  type PublicFormSettings,
  type ProfileField,
} from "@/entities/program";
import type { ProgramDraft } from "../../model/types";

interface PublicFormTabProps {
  draft: ProgramDraft;
  onChange: (updates: Partial<ProgramDraft>) => void;
  /** Used to render the mock public URL. */
  programId?: string;
}

export function PublicFormTab({ draft, onChange, programId }: PublicFormTabProps) {
  const settings = draft.publicForm;
  const [view, setView] = useState<"phone" | "display">("phone");

  function update(patch: Partial<PublicFormSettings>) {
    onChange({ publicForm: { ...settings, ...patch } });
  }

  function toggleFieldVisible(id: string) {
    if (PROTECTED_FIELD_IDS.has(id)) return;
    const next = settings.hiddenFieldIds.includes(id)
      ? settings.hiddenFieldIds.filter((x) => x !== id)
      : [...settings.hiddenFieldIds, id];
    update({ hiddenFieldIds: next });
  }

  return (
    <div className="space-y-4">
      {/* Header — title + help icon */}
      <div className="flex items-center gap-1.5">
        <h2 className="text-xl font-semibold text-gray-900">Public Form</h2>
        <HelpCircle size={14} className="text-gray-400" />
      </div>

      {/* 2-column body */}
      <div className="flex gap-6">
        {/* ========= LEFT: settings ========= */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Status + Duration row */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Status" required>
              <SelectInput
                value={settings.enabled ? "active" : "draft"}
                onChange={(v) => update({ enabled: v === "active" })}
                options={[
                  { value: "draft", label: "Draft" },
                  { value: "active", label: "Active" },
                ]}
              />
            </Field>
            <Field label="Duration (dd/mm/yyyy)" required>
              <DateRangeInput
                from={settings.startDate}
                to={settings.endDate}
                onChange={(from, to) => update({ startDate: from, endDate: to })}
                inheritFrom={
                  draft.startDate && draft.endDate
                    ? `${draft.startDate} → ${draft.endDate}`
                    : undefined
                }
              />
            </Field>
          </div>

          {/* Public URL */}
          <CopyableField
            label="Public URL"
            value={publicFormUrl(programId ?? slugify(draft.title) ?? "your-program", settings)}
            buttonLabel="Copy URL"
          />

          {/* Embed Code */}
          <CopyableField
            label="Embed Code (iframe)"
            value={publicFormEmbedCode(programId ?? slugify(draft.title) ?? "your-program", settings)}
            buttonLabel="Copy HTML"
            multiline
          />

          {/* Security & Data Flow */}
          <div className="rounded-lg border border-violet-100 bg-violet-50/40 p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                <Info size={11} />
              </span>
              <h3 className="text-sm font-semibold text-violet-900">
                Security & Data Flow
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-gray-700">
              Protected by <strong>Google reCAPTCHA v3</strong> to prevent bot
              spam. Uploaded CVs are scanned via <strong>Anti-virus API</strong>{" "}
              before storage. Duplicate applications are automatically rejected
              based on <strong>Email Address</strong>. Candidate data entered in
              the form will <strong>override</strong> data parsed from the CV by
              AI. New applications are routed directly to the{" "}
              <strong>Candidate Inbox</strong> for manual review.
            </p>
          </div>
        </div>

        {/* ========= RIGHT: preview pane ========= */}
        <aside className="shrink-0 self-start">
          <div className="mb-3 flex justify-center">
            <ViewToggle value={view} onChange={setView} />
          </div>
          <FormPreview
            draft={draft}
            view={view}
            settings={settings}
            onToggleFieldVisible={toggleFieldVisible}
          />
        </aside>
      </div>
    </div>
  );
}

/* ============================================================
 * Live preview pane
 * ============================================================ */

function FormPreview({
  draft,
  view,
  settings,
  onToggleFieldVisible,
}: {
  draft: ProgramDraft;
  view: "phone" | "display";
  settings: PublicFormSettings;
  onToggleFieldVisible: (id: string) => void;
}) {
  const isPhone = view === "phone";
  const hiddenSections = new Set(settings.hiddenSectionIds);
  const hiddenFields = new Set(settings.hiddenFieldIds);

  return (
    <div
      className={cn(
        "border-2 border-gray-300 bg-gray-50 transition-all",
        isPhone
          ? "h-[640px] w-[360px] rounded-[40px] p-4"
          : "h-[640px] w-[600px] rounded-2xl p-6"
      )}
    >
      <div className="flex h-full flex-col overflow-y-auto rounded-2xl bg-white p-5">
        {/* Logo */}
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-violet-700">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-600 text-white">
            <Sparkles size={14} />
          </div>
          precio fishbone
        </div>

        {/* Job title (read-only context header) */}
        <div className="mb-1 text-base font-semibold text-gray-900">
          {draft.title || "New Program"}
        </div>
        {draft.position && (
          <div className="mb-4 text-xs text-gray-500">
            {draft.position} · {draft.level}
          </div>
        )}

        {/* Sections */}
        <div className="space-y-4">
          {draft.candidateProfile.sections.map((section, idx) => {
            // Skills section never appears on the public form.
            if (section.kind === "skills") return null;
            const sectionHidden = hiddenSections.has(section.id);
            return (
              <section key={section.id}>
                <h3 className="mb-2 text-sm font-semibold text-violet-700">
                  {idx + 1}. {section.name}
                </h3>
                {sectionHidden ? (
                  <p className="rounded-md bg-gray-50 px-3 py-2 text-[11px] italic text-gray-400">
                    Section hidden from public form.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {section.fields.map((field) => (
                      <PreviewFieldRow
                        key={field.id}
                        field={field}
                        hidden={hiddenFields.has(field.id)}
                        onToggle={() => onToggleFieldVisible(field.id)}
                      />
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>

        {/* Footer — data privacy */}
        <div className="mt-auto pt-5 text-[10px] text-gray-500">
          <label className="flex items-start gap-2">
            <input type="checkbox" className="mt-0.5" disabled />
            <span>
              I acknowledge that I have read and agree to the Data Privacy
              Policy.
            </span>
          </label>
          <button
            type="button"
            disabled
            className="mt-3 w-full rounded-lg bg-violet-600 py-2 text-xs font-medium text-white"
          >
            Submit Application
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewFieldRow({
  field,
  hidden,
  onToggle,
}: {
  field: ProfileField;
  hidden: boolean;
  onToggle: () => void;
}) {
  const isProtected = PROTECTED_FIELD_IDS.has(field.id);
  return (
    <li
      className={cn(
        "rounded-md border px-2.5 py-2 transition-colors",
        hidden
          ? "border-dashed border-gray-200 bg-gray-50"
          : "border-gray-200 bg-white"
      )}
    >
      <div className="flex items-center gap-2">
        {isProtected ? (
          <Lock size={11} className="shrink-0 text-gray-400" />
        ) : (
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              "shrink-0 rounded p-0.5 transition-colors",
              hidden
                ? "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                : "text-violet-600 hover:bg-violet-50"
            )}
            aria-label={hidden ? "Show on form" : "Hide from form"}
            title={hidden ? "Hidden — click to show" : "Visible — click to hide"}
          >
            {hidden ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        )}
        <span
          className={cn(
            "flex-1 text-xs",
            hidden ? "text-gray-400 line-through" : "text-gray-700"
          )}
        >
          {field.label}
          {field.required && !hidden && <span className="ml-0.5 text-red-500">*</span>}
        </span>
      </div>
    </li>
  );
}

/* ============================================================
 * View toggle (Display / Phone)
 * ============================================================ */

function ViewToggle({
  value,
  onChange,
}: {
  value: "phone" | "display";
  onChange: (v: "phone" | "display") => void;
}) {
  return (
    <div className="inline-flex rounded-md border border-gray-300 bg-white p-0.5 shadow-sm">
      <button
        type="button"
        onClick={() => onChange("display")}
        className={cn(
          "flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors",
          value === "display"
            ? "bg-violet-600 text-white"
            : "text-gray-500 hover:text-gray-700"
        )}
        aria-pressed={value === "display"}
      >
        <Monitor size={13} />
        Display
      </button>
      <button
        type="button"
        onClick={() => onChange("phone")}
        className={cn(
          "flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors",
          value === "phone"
            ? "bg-violet-600 text-white"
            : "text-gray-500 hover:text-gray-700"
        )}
        aria-pressed={value === "phone"}
      >
        <Smartphone size={13} />
        Phone
      </button>
    </div>
  );
}

/* ============================================================
 * Settings column primitives
 * ============================================================ */

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
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
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
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function DateRangeInput({
  from,
  to,
  onChange,
  inheritFrom,
}: {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
  inheritFrom?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm">
        <input
          type="date"
          value={from}
          onChange={(e) => onChange(e.target.value, to)}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-violet-500 focus:outline-none"
        />
        <span className="text-gray-400">→</span>
        <input
          type="date"
          value={to}
          onChange={(e) => onChange(from, e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-violet-500 focus:outline-none"
        />
      </div>
      {inheritFrom && !from && !to && (
        <p className="mt-1 text-[11px] text-gray-500">
          Defaults to program period: {inheritFrom}
        </p>
      )}
    </div>
  );
}

function CopyableField({
  label,
  value,
  buttonLabel,
  multiline,
}: {
  label: string;
  value: string;
  buttonLabel: string;
  multiline?: boolean;
}) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      showToast("success", `${label} copied.`);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      showToast("error", "Could not copy — clipboard access denied.");
    }
  }

  return (
    <Field label={label}>
      <div className="flex items-stretch gap-2">
        {multiline ? (
          <textarea
            readOnly
            value={value}
            rows={2}
            className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 font-mono text-[11px] text-gray-700"
          />
        ) : (
          <input
            readOnly
            value={value}
            className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 font-mono text-xs text-gray-700"
          />
        )}
        <button
          type="button"
          onClick={copy}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
            copied
              ? "border-green-300 bg-green-50 text-green-700"
              : "border-violet-300 bg-white text-violet-700 hover:bg-violet-50"
          )}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied!" : buttonLabel}
        </button>
      </div>
    </Field>
  );
}

/* ============================================================
 * Helpers
 * ============================================================ */

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}
