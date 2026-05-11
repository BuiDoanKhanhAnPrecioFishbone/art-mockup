"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronDown,
  ChevronRight,
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
  // Brand-new programs (no programId yet) can't have a real shareable URL
  // or embed snippet because the program needs to be saved server-side
  // first. Disable + tooltip the inputs until then.
  const isUnsaved = !programId;
  // Section open-state. The two collapsibles flip with view/edit mode:
  //   - View mode → Share & Embed expanded, Form Content collapsed
  //     (recruiter is here to grab the URL / embed code).
  //   - Edit mode → Form Content expanded, Share & Embed collapsed
  //     (recruiter is here to shape the form).
  // Saving the tab toggles readOnly back on, which restores the view
  // layout. Both states are still manually overrideable by the user.
  const [shareOpen, setShareOpen] = useState(isView);
  const [contentOpen, setContentOpen] = useState(!isView);
  const [securityOpen, setSecurityOpen] = useState(false);
  useEffect(() => {
    if (isView) {
      setShareOpen(true);
      setContentOpen(false);
    } else {
      setShareOpen(false);
      setContentOpen(true);
    }
  }, [isView]);

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
          {/* Status + Duration row. Status is derived from Duration —
           *  the form is automatically Active during the date range and
           *  not manually toggleable. */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Status">
              <DerivedStatus
                from={settings.startDate || draft.startDate}
                to={settings.endDate || draft.endDate}
              />
            </Field>
            <Field
              label="Duration (dd/mm/yyyy)"
              required
              tooltip="By default, this form remains open until the program's hiring period ends. You can set an earlier date to close it sooner."
            >
              <DateRangeInput
                // Empty publicForm dates inherit from the program's
                // Hiring Period, mirroring the tooltip contract above.
                // Saving an explicit date overrides the inherited value.
                from={settings.startDate || draft.startDate}
                to={settings.endDate || draft.endDate}
                inheritedFrom={!settings.startDate}
                inheritedTo={!settings.endDate}
                onChange={(from, to) =>
                  update({ startDate: from, endDate: to })
                }
                onResetToProgram={
                  settings.startDate || settings.endDate
                    ? () => update({ startDate: "", endDate: "" })
                    : undefined
                }
              />
            </Field>
          </div>

          {/* Share & Embed — collapsible. Empty for unsaved programs. */}
          <CollapsibleSection
            title="Share & Embed"
            open={shareOpen}
            onToggle={() => setShareOpen((v) => !v)}
          >
            <div className="space-y-4 px-4 pb-4">
              <CopyableField
                label="Public URL"
                value={isUnsaved ? "" : publicFormUrl(previewSlug, settings)}
                buttonLabel="Copy URL"
                helper="Share this link directly with candidates or post it on social media."
                disabled={isUnsaved}
                disabledTooltip="Save this program to generate your public URL and HTML embed code."
              />
              <CopyableField
                label="Embed Code (iframe)"
                value={
                  isUnsaved
                    ? ""
                    : publicFormEmbedCode(previewSlug, settings)
                }
                buttonLabel="Copy HTML"
                helper="Copy and paste this HTML code to embed the form directly onto your company website."
                multiline
                disabled={isUnsaved}
                disabledTooltip="Save this program to generate your public URL and HTML embed code."
              />

              {/* Nested Security & Data Flow collapsible */}
              <button
                type="button"
                onClick={() => setSecurityOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-left transition-colors hover:bg-violet-100"
              >
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-violet-900">
                  <Info size={12} className="text-violet-600" />
                  Security &amp; Data Flow
                </span>
                {securityOpen ? (
                  <ChevronDown size={14} className="text-violet-700" />
                ) : (
                  <ChevronRight size={14} className="text-violet-700" />
                )}
              </button>
              {securityOpen && (
                <p className="rounded-lg border border-violet-100 bg-violet-50/40 px-4 py-3 text-xs leading-relaxed text-gray-700">
                  Protected by <strong>Google reCAPTCHA v3</strong> to prevent
                  bot spam. Uploaded CVs are scanned via{" "}
                  <strong>Anti-virus API</strong> before storage. Duplicate
                  applications are automatically rejected based on{" "}
                  <strong>Email Address</strong>. Candidate data entered in
                  the form will <strong>override</strong> data parsed from the
                  CV by AI. New applications are routed directly to the{" "}
                  <strong>Candidate Inbox</strong> for manual review.
                </p>
              )}
            </div>
          </CollapsibleSection>

          {/* Form Content — collapsible. Houses the section / field
           *  visibility editor where the user toggles what applicants
           *  see. Mandatory General Information section sits at the top
           *  with its three protected fields. */}
          <CollapsibleSection
            title="Form Content"
            open={contentOpen}
            onToggle={() => setContentOpen((v) => !v)}
          >
            <div className="px-4 pb-4">
              <FormVisibilityEditor
                draft={draft}
                settings={settings}
                editable={!isView}
                onToggleSection={toggleSectionVisible}
                onToggleField={toggleFieldVisible}
              />
            </div>
          </CollapsibleSection>
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
            Use the switch on each section to show or hide it on the public
            form. Toggle the <Eye size={10} className="inline align-text-bottom" />{" "}
            icons to hide individual fields. Protected fields ( <Lock size={10} className="inline align-text-bottom" /> ) and the General Information section cannot be hidden.
          </p>
        </div>
      </div>

      <ol className="space-y-3">
        {visibleSections.map((section, idx) => {
          const sectionHidden = hiddenSections.has(section.id);
          // The General Information section is mandatory — it carries the
          // identity fields (full name, email, CV) the recruiter needs on
          // every submission. We render it without a hide-section switch.
          const sectionMandatory = section.kind === "general";
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
                {sectionMandatory ? (
                  <span
                    className="inline-flex items-center gap-1 rounded bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-500"
                    title="General Information is required on every submission and cannot be hidden."
                  >
                    <Lock size={10} />
                    Required
                  </span>
                ) : (
                  <SectionVisibilitySwitch
                    visible={!sectionHidden}
                    disabled={!editable}
                    onChange={() => onToggleSection(section.id)}
                  />
                )}
              </div>

              {!sectionHidden && (
                <ul className="mt-2 space-y-1">
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

/** iOS-style switch reused from the rest of the program form for the
 *  "show this section on the public form?" toggle. */
function SectionVisibilitySwitch({
  visible,
  disabled,
  onChange,
}: {
  visible: boolean;
  disabled: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={visible}
      aria-label={visible ? "Hide section from public form" : "Show section on public form"}
      title={visible ? "Visible — click to hide" : "Hidden — click to show"}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
        visible ? "bg-violet-600" : "bg-gray-300",
        disabled && "cursor-not-allowed opacity-60"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform",
          visible ? "translate-x-5" : "translate-x-1"
        )}
      />
    </button>
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
  tooltip,
  children,
}: {
  label: string;
  required?: boolean;
  tooltip?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500">*</span>}
        {tooltip && (
          <span
            className="group relative inline-flex"
            tabIndex={0}
            aria-label={tooltip}
          >
            <HelpCircle
              size={12}
              className="cursor-help text-gray-400 hover:text-violet-600"
            />
            <span
              role="tooltip"
              className="pointer-events-none absolute left-1/2 top-full z-30 mt-1.5 hidden w-64 -translate-x-1/2 rounded-md bg-gray-900 px-3 py-2 text-[11px] leading-snug text-white shadow-lg group-hover:block group-focus-within:block"
            >
              {tooltip}
            </span>
          </span>
        )}
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

/** Read-only status pill driven entirely by the Duration dates. The
 *  form is automatically Active inside the date range, Scheduled
 *  before the start date, and Closed after the end date. There is no
 *  manual override — recruiters control activation by editing the
 *  Duration. */
function DerivedStatus({ from, to }: { from: string; to: string }) {
  const today = new Date().toISOString().slice(0, 10);
  const status: {
    label: string;
    detail: string;
    tone: "active" | "scheduled" | "closed" | "unset";
  } = (() => {
    if (!from || !to) {
      return {
        label: "Not scheduled",
        detail: "Set a Duration to activate the form.",
        tone: "unset",
      };
    }
    if (today < from) {
      return {
        label: "Scheduled",
        detail: `Opens on ${from}`,
        tone: "scheduled",
      };
    }
    if (today > to) {
      return {
        label: "Closed",
        detail: `Ended on ${to}`,
        tone: "closed",
      };
    }
    return {
      label: "Active",
      detail: `Closes on ${to}`,
      tone: "active",
    };
  })();
  const toneClass =
    status.tone === "active"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : status.tone === "scheduled"
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : status.tone === "closed"
          ? "bg-gray-100 text-gray-600 ring-gray-200"
          : "bg-gray-50 text-gray-500 ring-gray-200";
  return (
    <div
      className="flex items-center justify-between gap-2 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm"
      title="Status is derived from the Duration — change the dates to control activation."
    >
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1",
          toneClass
        )}
      >
        {status.label}
      </span>
      <span className="text-[11px] text-gray-500">{status.detail}</span>
    </div>
  );
}

function DateRangeInput({
  from,
  to,
  onChange,
  inheritedFrom,
  inheritedTo,
  onResetToProgram,
}: {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
  /** When true, the displayed `from` was inherited from the program's
   *  hiring period rather than explicitly set on the public form. */
  inheritedFrom?: boolean;
  inheritedTo?: boolean;
  /** Optional reset callback — surfaces a "Reset to program period"
   *  link below the inputs when the user has overridden either date. */
  onResetToProgram?: () => void;
}) {
  const bothInherited = inheritedFrom && inheritedTo;
  const someInherited = inheritedFrom || inheritedTo;
  return (
    <div>
      <div className="flex items-center gap-2 text-sm">
        <input
          type="date"
          value={from}
          onChange={(e) => onChange(e.target.value, to)}
          className={cn(
            "flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-violet-500 focus:outline-none",
            inheritedFrom && "italic text-gray-500"
          )}
        />
        <span className="text-gray-400">→</span>
        <input
          type="date"
          value={to}
          onChange={(e) => onChange(from, e.target.value)}
          className={cn(
            "flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-violet-500 focus:outline-none",
            inheritedTo && "italic text-gray-500"
          )}
        />
      </div>
      {(someInherited || onResetToProgram) && (
        <p className="mt-1 flex items-center justify-between gap-2 text-[11px] text-gray-500">
          <span>
            {bothInherited
              ? "Inherited from the program's Hiring Period."
              : someInherited
                ? `${inheritedFrom ? "Start" : "End"} date inherited from the program's Hiring Period.`
                : "Custom Public Form duration."}
          </span>
          {onResetToProgram && (
            <button
              type="button"
              onClick={onResetToProgram}
              className="font-medium text-violet-600 hover:text-violet-800"
            >
              Reset to program period
            </button>
          )}
        </p>
      )}
    </div>
  );
}

function CopyableField({
  label,
  value,
  buttonLabel,
  helper,
  multiline,
  disabled,
  disabledTooltip,
}: {
  label: string;
  value: string;
  buttonLabel: string;
  helper?: string;
  multiline?: boolean;
  disabled?: boolean;
  disabledTooltip?: string;
}) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (disabled) return;
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
      <div className="group relative flex items-stretch gap-2">
        {multiline ? (
          <textarea
            readOnly
            disabled={disabled}
            value={value}
            placeholder={disabled ? "Will appear after saving…" : undefined}
            rows={2}
            className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 font-mono text-[11px] text-gray-700 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
          />
        ) : (
          <input
            readOnly
            disabled={disabled}
            value={value}
            placeholder={disabled ? "Will appear after saving…" : undefined}
            className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 font-mono text-xs text-gray-700 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
          />
        )}
        <button
          type="button"
          onClick={copy}
          disabled={disabled}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
            copied
              ? "border-green-300 bg-green-50 text-green-700"
              : "border-violet-300 bg-white text-violet-700 hover:bg-violet-50",
            disabled && "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 hover:bg-gray-50"
          )}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied!" : buttonLabel}
        </button>
        {disabled && disabledTooltip && (
          <span
            role="tooltip"
            className="pointer-events-none absolute -top-9 right-0 z-30 hidden w-64 rounded-md bg-gray-900 px-3 py-2 text-[11px] leading-snug text-white shadow-lg group-hover:block"
          >
            {disabledTooltip}
          </span>
        )}
      </div>
      {helper && !disabled && (
        <p className="mt-1 text-[11px] text-gray-500">{helper}</p>
      )}
    </Field>
  );
}

/** Collapsible section card matching the wireframe's "Share & Embed" /
 *  "Form Content" containers. Header is a click-to-toggle bar; body
 *  collapses cleanly when closed. */
function CollapsibleSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between bg-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-100"
      >
        <span className="text-sm font-semibold text-gray-900">{title}</span>
        {open ? (
          <ChevronDown size={14} className="text-gray-500" />
        ) : (
          <ChevronRight size={14} className="text-gray-500" />
        )}
      </button>
      {open && <div className="pt-3">{children}</div>}
    </section>
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
