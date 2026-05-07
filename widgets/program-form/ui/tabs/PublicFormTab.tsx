"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Copy,
  ExternalLink,
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
  /** Driven by the parent's per-tab Edit toggle. When true, every
   *  control is locked + the eye toggles in the explicit form list
   *  disappear. The right-side live preview is unaffected — it always
   *  renders, in both view and edit modes. */
  readOnly?: boolean;
}

export function PublicFormTab({
  draft,
  onChange,
  programId,
  readOnly,
}: PublicFormTabProps) {
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

  function toggleSectionVisible(id: string) {
    const next = settings.hiddenSectionIds.includes(id)
      ? settings.hiddenSectionIds.filter((x) => x !== id)
      : [...settings.hiddenSectionIds, id];
    update({ hiddenSectionIds: next });
  }

  const previewSlug = programId ?? slugify(draft.title) ?? "your-program";
  const isView = Boolean(readOnly);

  return (
    <div className="space-y-4">
      {/* Header — title + help icon + open-public-preview link. */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <h2 className="text-xl font-semibold text-gray-900">Public Form</h2>
          <HelpCircle size={14} className="text-gray-400" />
        </div>
        {programId && (
          <Link
            href={`/preview/public-form/${programId}`}
            target="_blank"
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            title="Open the applicant view in a new tab"
          >
            <ExternalLink size={12} />
            Open public preview
          </Link>
        )}
      </div>

      {/* Two-column layout: editable settings + explicit form on the
       *  left, always-on Live Preview on the right. */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        {/* ============== LEFT — settings + explicit form ============== */}
        <fieldset
          disabled={isView}
          className={cn(
            "space-y-5 min-w-0",
            isView &&
              "[&_input:not([type='checkbox'])]:bg-gray-50 [&_select]:bg-gray-50"
          )}
        >
          {/* Status + Duration row */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                onChange={(from, to) =>
                  update({ startDate: from, endDate: to })
                }
                inheritFrom={
                  draft.startDate && draft.endDate
                    ? `${draft.startDate} → ${draft.endDate}`
                    : undefined
                }
              />
            </Field>
          </div>

          <CopyableField
            label="Public URL"
            value={publicFormUrl(previewSlug, settings)}
            buttonLabel="Copy URL"
          />

          <CopyableField
            label="Embed Code (iframe)"
            value={publicFormEmbedCode(previewSlug, settings)}
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
              spam. Uploaded CVs are scanned via{" "}
              <strong>Anti-virus API</strong> before storage. Duplicate
              applications are automatically rejected based on{" "}
              <strong>Email Address</strong>. Candidate data entered in the
              form will <strong>override</strong> data parsed from the CV by
              AI. New applications are routed directly to the{" "}
              <strong>Candidate Inbox</strong> for manual review.
            </p>
          </div>

          {/* Explicit form — section + field visibility editor. This is
           *  where the user actually toggles what the applicant sees;
           *  the right-hand preview merely reflects these choices. */}
          <FormVisibilityEditor
            draft={draft}
            settings={settings}
            editable={!isView}
            onToggleSection={toggleSectionVisible}
            onToggleField={toggleFieldVisible}
          />
        </fieldset>

        {/* ============== RIGHT — sticky Live preview ============== */}
        <aside className="xl:sticky xl:top-4 xl:self-start">
          <section className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                <Sparkles size={14} className="text-violet-500" />
                Live preview
              </h3>
              <ViewToggle value={view} onChange={setView} />
            </div>
            <div className="flex justify-center pt-2">
              <FormPreview
                draft={draft}
                view={view}
                settings={settings}
              />
            </div>
            <p className="text-[11px] text-gray-500">
              This is what applicants see. To change which sections or fields
              appear, use the <strong>Form sections &amp; fields</strong>{" "}
              editor on the left.
            </p>
          </section>
        </aside>
      </div>

      <p className="text-[11px] text-gray-400">
        Tip: the applicant-facing form lives at{" "}
        <code className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px]">
          /preview/public-form/{previewSlug}
        </code>
        .
      </p>
    </div>
  );
}

/* ============================================================
 * Explicit form editor — sections + fields with eye toggles.
 * Lives below Security & Data Flow on the left side.
 * ============================================================ */

function FormVisibilityEditor({
  draft,
  settings,
  editable,
  onToggleSection,
  onToggleField,
}: {
  draft: ProgramDraft;
  settings: PublicFormSettings;
  editable: boolean;
  onToggleSection: (id: string) => void;
  onToggleField: (id: string) => void;
}) {
  const hiddenSections = new Set(settings.hiddenSectionIds);
  const hiddenFields = new Set(settings.hiddenFieldIds);

  // Skills section is implicitly excluded from the public form, so
  // filter it out of the editor too — listing it would only confuse.
  const visibleSections = draft.candidateProfile.sections.filter(
    (s) => s.kind !== "skills"
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <Shield size={13} className="text-violet-500" />
            <h3 className="text-sm font-semibold text-gray-900">
              Form sections &amp; fields
            </h3>
          </div>
          <p className="mt-0.5 text-[11px] text-gray-500">
            Toggle the <Eye size={10} className="inline align-text-bottom" />{" "}
            icons to control which sections and fields appear on the public
            form. Protected fields ( <Lock size={10} className="inline align-text-bottom" /> ) cannot be hidden.
          </p>
        </div>
      </div>

      <ol className="space-y-3">
        {visibleSections.map((section, idx) => {
          const sectionHidden = hiddenSections.has(section.id);
          return (
            <li
              key={section.id}
              className={cn(
                "rounded-md border px-3 py-2.5",
                sectionHidden
                  ? "border-dashed border-gray-200 bg-gray-50"
                  : "border-gray-200 bg-white"
              )}
            >
              <div className="flex items-center gap-2">
                {editable ? (
                  <button
                    type="button"
                    onClick={() => onToggleSection(section.id)}
                    className={cn(
                      "shrink-0 rounded p-0.5 transition-colors",
                      sectionHidden
                        ? "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        : "text-violet-600 hover:bg-violet-50"
                    )}
                    aria-label={
                      sectionHidden ? "Show section" : "Hide section"
                    }
                    title={
                      sectionHidden
                        ? "Hidden — click to show"
                        : "Visible — click to hide"
                    }
                  >
                    {sectionHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                ) : (
                  <span className="shrink-0 text-gray-400">
                    {sectionHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                  </span>
                )}
                <span
                  className={cn(
                    "flex-1 text-sm font-semibold",
                    sectionHidden
                      ? "text-gray-400 line-through"
                      : "text-violet-700"
                  )}
                >
                  {idx + 1}. {section.name}
                </span>
                <span className="text-[10px] text-gray-400">
                  {section.fields.length} field
                  {section.fields.length === 1 ? "" : "s"}
                </span>
              </div>

              {!sectionHidden && (
                <ul className="mt-2 space-y-1 pl-7">
                  {section.fields.map((field) => (
                    <FieldToggleRow
                      key={field.id}
                      field={field}
                      hidden={hiddenFields.has(field.id)}
                      editable={editable}
                      onToggle={() => onToggleField(field.id)}
                    />
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function FieldToggleRow({
  field,
  hidden,
  editable,
  onToggle,
}: {
  field: ProfileField;
  hidden: boolean;
  editable: boolean;
  onToggle: () => void;
}) {
  const isProtected = PROTECTED_FIELD_IDS.has(field.id);
  return (
    <li
      className={cn(
        "flex items-center gap-2 rounded px-2 py-1.5",
        hidden ? "bg-gray-50" : "bg-white"
      )}
    >
      {!editable ? (
        isProtected ? (
          <Lock size={12} className="shrink-0 text-gray-400" />
        ) : (
          <span className="shrink-0 text-gray-400">
            {hidden ? <EyeOff size={12} /> : <Eye size={12} />}
          </span>
        )
      ) : isProtected ? (
        <Lock size={12} className="shrink-0 text-gray-400" />
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
          title={
            hidden ? "Hidden — click to show" : "Visible — click to hide"
          }
        >
          {hidden ? <EyeOff size={12} /> : <Eye size={12} />}
        </button>
      )}
      <span
        className={cn(
          "flex-1 text-xs",
          hidden ? "text-gray-400 line-through" : "text-gray-700"
        )}
      >
        {field.label}
        {field.required && !hidden && (
          <span className="ml-0.5 text-red-500">*</span>
        )}
      </span>
      {isProtected && (
        <span className="text-[10px] uppercase tracking-wide text-gray-400">
          Required
        </span>
      )}
    </li>
  );
}

/* ============================================================
 * Live preview pane — pure visual mirror of the public form. No
 * eye toggles inside; visibility is edited via the explicit
 * editor on the left.
 * ============================================================ */

function FormPreview({
  draft,
  view,
  settings,
}: {
  draft: ProgramDraft;
  view: "phone" | "display";
  settings: PublicFormSettings;
}) {
  const isPhone = view === "phone";
  const hiddenSections = new Set(settings.hiddenSectionIds);
  const hiddenFields = new Set(settings.hiddenFieldIds);

  return (
    <div
      className={cn(
        "border-2 border-gray-300 bg-gray-50 transition-all",
        isPhone
          ? "h-[640px] w-[340px] rounded-[40px] p-3"
          : "h-[640px] w-full max-w-[560px] rounded-2xl p-5"
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
            if (hiddenSections.has(section.id)) return null;
            return (
              <section key={section.id}>
                <h3 className="mb-2 text-sm font-semibold text-violet-700">
                  {idx + 1}. {section.name}
                </h3>
                <ul className="space-y-2">
                  {section.fields.map((field) => {
                    if (hiddenFields.has(field.id)) return null;
                    return (
                      <PreviewFieldRow key={field.id} field={field} />
                    );
                  })}
                </ul>
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

function PreviewFieldRow({ field }: { field: ProfileField }) {
  const isProtected = PROTECTED_FIELD_IDS.has(field.id);
  return (
    <li className="rounded-md border border-gray-200 bg-white px-2.5 py-2">
      <div className="flex items-center gap-2">
        {isProtected ? (
          <Lock size={11} className="shrink-0 text-gray-400" />
        ) : (
          <span className="w-[11px] shrink-0" aria-hidden />
        )}
        <span className="flex-1 text-xs text-gray-700">
          {field.label}
          {field.required && <span className="ml-0.5 text-red-500">*</span>}
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
