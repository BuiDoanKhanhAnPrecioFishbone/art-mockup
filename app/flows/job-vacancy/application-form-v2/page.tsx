"use client";

/**
 * APPLICATION FORM BUILDER — V2 (Final)
 *
 * Layout: builder (left) + live preview (right) — always split, always in sync.
 *
 * Kept from the previous rebuild:
 *   - No wizard. Status/dates/fields all on one page.
 *   - Share popover — one click from the top bar, never buried.
 *   - Auto-save indicator — no Save button anxiety.
 *   - Inline editing for simple fields; slide-in drawer for Dropdown/Checkbox.
 *   - Required toggle (* badge) on every card without opening anything.
 *
 * Added back (and done better):
 *   - Live preview panel — always visible on the right, updates in real time.
 *   - Mobile / Desktop toggle on the preview panel (like the original wireframe).
 *   - Field type palette compact-integrated into the builder column (horizontal
 *     strip), so the right column is free for the full-height preview.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Lock,
  ExternalLink,
  Copy,
  Check,
  GripVertical,
  Trash2,
  Plus,
  X,
  ChevronDown,
  Link2,
  Code2,
  Cloud,
  AlertCircle,
  Smartphone,
  Monitor,
  Lightbulb,
  ChevronUp,
} from "lucide-react";
import {
  SYSTEM_CORE_FIELDS,
  FIELD_TYPE_META,
} from "@/shared/fixtures/application-form";
import type { CustomField, FieldType } from "@/shared/fixtures/application-form";

// ─── constants ────────────────────────────────────────────────────────────────
const FIELD_TYPES: FieldType[] = [
  "short-text",
  "paragraph",
  "number",
  "dropdown",
  "checkbox",
  "file-upload",
];

const FIELD_COLORS: Record<FieldType, { bg: string; text: string; border: string }> = {
  "short-text":  { bg: "bg-blue-50",    text: "text-blue-600",    border: "border-blue-200" },
  paragraph:     { bg: "bg-indigo-50",  text: "text-indigo-600",  border: "border-indigo-200" },
  number:        { bg: "bg-cyan-50",    text: "text-cyan-600",    border: "border-cyan-200" },
  dropdown:      { bg: "bg-violet-50",  text: "text-violet-600",  border: "border-violet-200" },
  checkbox:      { bg: "bg-fuchsia-50", text: "text-fuchsia-600", border: "border-fuchsia-200" },
  "file-upload": { bg: "bg-orange-50",  text: "text-orange-600",  border: "border-orange-200" },
};

const PUBLIC_URL  = "https://careers.preciofishbone.com/jobs/req-12345/apply";
const EMBED_CODE  = `<iframe src="${PUBLIC_URL}?embed=true" width="100%" height="800px" frameborder="0"></iframe>`;

// ─── design annotations ────────────────────────────────────────────────────────
interface DesignNote {
  id: number;
  area: string;
  title: string;
  original: string;
  v2: string;
  principle: string;
  color: string;
}

const DESIGN_NOTES: DesignNote[] = [
  {
    id: 1,
    area: "Top bar",
    title: "Configuration always visible — no wizard",
    original: "Status and dates are buried inside a wizard step. Changing the end date forces you to navigate away from the field builder.",
    v2: "Status dropdown and date range sit in the persistent top bar. HR can adjust them at any point without losing their place.",
    principle: "Don't make users navigate to a different context to change a setting. Configuration that affects the whole form belongs in a persistent header, not a sequential step.",
    color: "bg-blue-500",
  },
  {
    id: 2,
    area: "Share button",
    title: "Share link is always one click away",
    original: "The public URL and embed code are shown at the bottom of view mode only, or locked behind Step 3 of the wizard. HR must leave the builder to copy the link.",
    v2: "A 'Share' button in the top bar opens a popover with URL and embed code. Always accessible — zero navigation required.",
    principle: "The most frequently needed action (copying the link to paste into LinkedIn) should never be more than one click away. Burying it in a step or below the fold creates unnecessary friction.",
    color: "bg-violet-500",
  },
  {
    id: 3,
    area: "Auto-save",
    title: "Auto-save removes Save button anxiety",
    original: "A Save button means users must remember to click it. If they close the tab or navigate away before saving, changes are silently lost.",
    v2: "Every change triggers a 'Saving… → Saved' indicator. No button to forget. No lost work.",
    principle: "Save buttons are a legacy pattern from file-based software. Web apps should auto-persist and confirm with a subtle indicator. The cost of an accidental save is near zero; the cost of lost work is high.",
    color: "bg-green-500",
  },
  {
    id: 4,
    area: "System fields",
    title: "Clear visual language for locked vs configurable fields",
    original: "All system fields show lock icons but their interaction model is inconsistent — some are truly locked, others have hidden toggles.",
    v2: "Lock icon = truly immutable (grey, no interaction). Toggle = configurable (visible control with clear label: Required / Optional / Visible / Hidden).",
    principle: "Affordance must match action. If a user can interact with something, show the control. If they cannot, show a lock and explain why — not a lock that does nothing when clicked.",
    color: "bg-amber-500",
  },
  {
    id: 5,
    area: "Field palette",
    title: "Field type palette is always visible",
    original: "The type picker appears as a plain text table below the custom field area. It looks like a data table, not a tool palette.",
    v2: "A compact 3×2 grid of icon cards is always visible below the field list. Each card has an icon, name, and one-line description. Visual scanning is faster than reading a list.",
    principle: "Toolpalettes should be persistent and scannable. Using icons + labels (not just text) lets users identify options at a glance. A hidden or collapsible picker adds an extra click for every new field.",
    color: "bg-orange-500",
  },
  {
    id: 6,
    area: "Field cards",
    title: "Inline editing for simple fields; drawer only for complex",
    original: "All field types open the same modal editor — even a Short Text field that only needs a label typed in.",
    v2: "Simple fields (Short Text, Number, Paragraph, File Upload): click the label area and type directly. Dropdown and Checkbox open a focused slide-in drawer only because they need options management.",
    principle: "Match the editing surface to the complexity of the task. A modal for a one-field edit is over-engineering. Reserve focused overlays for tasks with multiple related inputs (label + options + required).",
    color: "bg-rose-500",
  },
  {
    id: 7,
    area: "Required badge",
    title: "Required toggle is a one-click badge on the card",
    original: "Changing a field from optional to required requires opening the field editor modal, finding the toggle, and saving.",
    v2: "Every field card has a small '*' badge. Click it to toggle required/optional instantly — no editor needed.",
    principle: "High-frequency micro-actions should be directly accessible on the item itself. Opening an editor to flip a single boolean is three steps too many.",
    color: "bg-pink-500",
  },
  {
    id: 8,
    area: "Live preview",
    title: "Live preview is always split — updates in real time",
    original: "Preview is only visible after entering Edit mode, and only as a small phone thumbnail. Switching to desktop view requires a separate action.",
    v2: "The right panel shows the candidate form at all times, updating instantly as fields are added/removed/configured. Mobile/desktop toggle is always present at the top of the panel.",
    principle: "WYSIWYG feedback is essential in form builders. If the user has to click 'Preview' to see what they built, they will make more mistakes and feel less confident in their changes.",
    color: "bg-teal-500",
  },
];

// ─── annotation badge ──────────────────────────────────────────────────────────
function AnnotationBadge({ note, active }: { note: DesignNote; active: boolean }) {
  if (!active) return null;
  return (
    <span
      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-bold flex-shrink-0 ${note.color} ring-2 ring-white shadow-md`}
    >
      {note.id}
    </span>
  );
}

// ─── notes panel ──────────────────────────────────────────────────────────────
function NotesPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="border-b border-amber-200 bg-amber-50">
      {/* panel header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-amber-200">
        <div className="flex items-center gap-2">
          <Lightbulb size={15} className="text-amber-500" />
          <span className="text-sm font-semibold text-amber-800">Design Notes — why this is better than the original wireframe</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-amber-400 hover:text-amber-600 transition-colors flex items-center gap-1 text-xs"
        >
          <ChevronUp size={14} />
          Hide
        </button>
      </div>

      {/* notes grid */}
      <div className="grid grid-cols-4 gap-0 divide-x divide-amber-200 max-h-72 overflow-y-auto">
        {DESIGN_NOTES.map((note) => (
          <div key={note.id} className="p-4 space-y-2.5">
            {/* note header */}
            <div className="flex items-start gap-2">
              <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-bold flex-shrink-0 mt-0.5 ${note.color}`}>
                {note.id}
              </span>
              <div>
                <p className="text-xs font-semibold text-gray-800 leading-snug">{note.title}</p>
                <p className="text-[10px] text-amber-600 font-medium mt-0.5">{note.area}</p>
              </div>
            </div>

            {/* original vs v2 */}
            <div className="space-y-1.5">
              <div className="rounded-lg bg-red-50 border border-red-100 p-2">
                <p className="text-[9px] font-bold text-red-500 uppercase tracking-wider mb-0.5">Original</p>
                <p className="text-[10px] text-red-700 leading-snug">{note.original}</p>
              </div>
              <div className="rounded-lg bg-green-50 border border-green-100 p-2">
                <p className="text-[9px] font-bold text-green-600 uppercase tracking-wider mb-0.5">V2</p>
                <p className="text-[10px] text-green-700 leading-snug">{note.v2}</p>
              </div>
            </div>

            {/* principle */}
            <div className="rounded-lg bg-white border border-amber-100 p-2">
              <p className="text-[9px] font-bold text-amber-600 uppercase tracking-wider mb-0.5">Design Principle</p>
              <p className="text-[10px] text-gray-600 leading-snug">{note.principle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type PreviewDevice = "mobile" | "desktop";

// ─── share popover ─────────────────────────────────────────────────────────────
function SharePopover({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState<"url" | "embed" | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const copy = (type: "url" | "embed") => {
    navigator.clipboard.writeText(type === "url" ? PUBLIC_URL : EMBED_CODE).catch(() => {});
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div
      ref={ref}
      className="absolute top-full right-0 mt-2 w-[26rem] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-800">Share this form</p>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X size={16} />
        </button>
      </div>
      <div className="p-5 space-y-4">
        {/* URL */}
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Link2 size={12} className="text-gray-400" />
            <p className="text-xs font-semibold text-gray-600">Public URL</p>
          </div>
          <p className="text-[11px] text-gray-400 mb-2">Share in job posts, emails, or LinkedIn.</p>
          <div className="flex gap-2">
            <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-[11px] font-mono text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap">
              {PUBLIC_URL}
            </div>
            <button
              type="button"
              onClick={() => copy("url")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors flex-shrink-0 ${
                copied === "url" ? "bg-green-500 text-white" : "bg-gray-900 text-white hover:bg-gray-700"
              }`}
            >
              {copied === "url" ? <Check size={12} /> : <Copy size={12} />}
              {copied === "url" ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
        {/* embed */}
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Code2 size={12} className="text-gray-400" />
            <p className="text-xs font-semibold text-gray-600">Embed Code</p>
          </div>
          <p className="text-[11px] text-gray-400 mb-2">Paste into your careers page HTML.</p>
          <div className="bg-gray-900 rounded-xl p-3 text-[10px] text-green-300 font-mono mb-2 overflow-x-auto whitespace-nowrap">
            {EMBED_CODE}
          </div>
          <button
            type="button"
            onClick={() => copy("embed")}
            className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition-colors ${
              copied === "embed"
                ? "bg-green-50 border-green-300 text-green-700"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {copied === "embed" ? <Check size={12} /> : <Copy size={12} />}
            {copied === "embed" ? "Copied!" : "Copy HTML"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── field drawer (dropdown / checkbox options) ────────────────────────────────
function FieldDrawer({
  field,
  onUpdate,
  onClose,
}: {
  field: CustomField;
  onUpdate: (f: CustomField) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<CustomField>({ ...field });
  const meta   = FIELD_TYPE_META[draft.type];
  const colors = FIELD_COLORS[draft.type];

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/20" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-40 flex flex-col border-l border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <span className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-base ${colors.bg} ${colors.text} ${colors.border}`}>
              {meta.icon}
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">{meta.label} field</p>
              <p className="text-[11px] text-gray-400">{meta.description}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Question label <span className="text-red-400">*</span>
            </label>
            <input
              autoFocus
              type="text"
              value={draft.label}
              onChange={(e) => setDraft({ ...draft, label: e.target.value })}
              placeholder="e.g. What is your preferred work type?"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition"
            />
          </div>

          {(draft.type === "dropdown" || draft.type === "checkbox") && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Options</label>
              <div className="space-y-1.5">
                {(draft.options ?? []).map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-3.5 h-3.5 flex-shrink-0 border border-gray-300 ${draft.type === "checkbox" ? "rounded-sm" : "rounded-full"}`} />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const opts = [...(draft.options ?? [])];
                        opts[i] = e.target.value;
                        setDraft({ ...draft, options: opts });
                      }}
                      className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-300"
                    />
                    <button
                      type="button"
                      onClick={() => setDraft({ ...draft, options: (draft.options ?? []).filter((_, j) => j !== i) })}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, options: [...(draft.options ?? []), `Option ${(draft.options?.length ?? 0) + 1}`] })}
                  className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-800 transition-colors"
                >
                  <Plus size={12} /> Add option
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-700">Required</p>
              <p className="text-xs text-gray-400 mt-0.5">Candidate must answer to submit</p>
            </div>
            <button
              type="button"
              onClick={() => setDraft({ ...draft, required: !draft.required })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${draft.required ? "bg-purple-600" : "bg-gray-300"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${draft.required ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => { onUpdate(draft); onClose(); }}
            disabled={!draft.label.trim()}
            className="flex-1 py-2.5 rounded-xl bg-purple-700 text-sm font-medium text-white hover:bg-purple-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
}

// ─── field card ────────────────────────────────────────────────────────────────
function FieldCard({
  field,
  onUpdate,
  onDelete,
  onOpenDrawer,
}: {
  field: CustomField;
  onUpdate: (f: CustomField) => void;
  onDelete: (id: string) => void;
  onOpenDrawer: (f: CustomField) => void;
}) {
  const meta      = FIELD_TYPE_META[field.type];
  const colors    = FIELD_COLORS[field.type];
  const isComplex = field.type === "dropdown" || field.type === "checkbox";

  return (
    <div className="flex items-start gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl group hover:border-purple-200 hover:shadow-sm transition-all">
      <GripVertical size={15} className="text-gray-200 group-hover:text-gray-400 cursor-grab mt-0.5 flex-shrink-0" />
      <span className={`w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5 ${colors.bg} ${colors.text} ${colors.border}`}>
        {meta.icon}
      </span>
      <div className="flex-1 min-w-0">
        <input
          type="text"
          value={field.label}
          placeholder={`New ${meta.label.toLowerCase()} question…`}
          onChange={(e) => onUpdate({ ...field, label: e.target.value })}
          readOnly={isComplex}
          onFocus={() => isComplex && onOpenDrawer(field)}
          className="w-full text-sm text-gray-800 bg-transparent border-0 border-b border-transparent focus:border-purple-300 focus:outline-none pb-0.5 placeholder:text-gray-300 transition-colors cursor-text"
        />
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] text-gray-400">{meta.label}</span>
          {field.required && (
            <span className="text-[10px] text-red-500 border border-red-200 bg-red-50 px-1.5 py-0.5 rounded-md font-medium">
              Required
            </span>
          )}
          {isComplex && (field.options?.length ?? 0) > 0 && (
            <span className="text-[10px] text-gray-400">· {field.options!.length} options</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
        <button
          type="button"
          title={field.required ? "Mark optional" : "Mark required"}
          onClick={() => onUpdate({ ...field, required: !field.required })}
          className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold border transition-colors ${
            field.required
              ? "bg-red-50 border-red-200 text-red-500"
              : "border-gray-100 text-gray-300 hover:border-gray-300 hover:text-gray-400"
          }`}
        >
          *
        </button>
        {isComplex && (
          <button
            type="button"
            title="Edit options"
            onClick={() => onOpenDrawer(field)}
            className="w-6 h-6 rounded-md border border-gray-100 flex items-center justify-center text-gray-300 hover:border-purple-300 hover:text-purple-500 transition-colors"
          >
            <ChevronDown size={12} />
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(field.id)}
          className="w-6 h-6 rounded-md border border-gray-100 flex items-center justify-center text-gray-300 hover:border-red-200 hover:text-red-400 transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

// ─── auto-save indicator ───────────────────────────────────────────────────────
function AutoSave({ dirty }: { dirty: boolean }) {
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  useEffect(() => {
    if (!dirty) return;
    setState("saving");
    const t = setTimeout(() => setState("saved"), 800);
    return () => clearTimeout(t);
  }, [dirty]);
  if (state === "idle") return null;
  return (
    <div className={`flex items-center gap-1.5 text-xs ${state === "saving" ? "text-gray-400" : "text-green-600"}`}>
      {state === "saving" ? <><Cloud size={13} className="animate-pulse" />Saving…</> : <><Check size={13} />Saved</>}
    </div>
  );
}

// ─── live preview ──────────────────────────────────────────────────────────────
function LivePreview({
  device,
  customFields,
  phoneRequired,
  sourceVisible,
}: {
  device: PreviewDevice;
  customFields: CustomField[];
  phoneRequired: boolean;
  sourceVisible: boolean;
}) {
  const coreRows = [
    { label: "Full Name", required: true },
    { label: "Email Address", required: true },
    ...(phoneRequired ? [{ label: "Phone Number", required: false }] : []),
    ...(sourceVisible ? [{ label: "Source", required: false, select: true }] : []),
  ];

  if (device === "mobile") {
    return (
      /* phone shell */
      <div className="w-64 border-[4px] border-gray-800 rounded-[36px] overflow-hidden shadow-2xl bg-white mx-auto">
        <div className="bg-gray-800 h-6 flex items-center justify-center">
          <div className="w-14 h-2 bg-gray-600 rounded-full" />
        </div>
        <div className="bg-gray-50 overflow-y-auto" style={{ maxHeight: 520 }}>
          {/* header */}
          <div className="bg-purple-700 px-4 py-3">
            <div className="font-bold text-white text-[11px] mb-0.5">PrecioFishbone</div>
            <div className="font-semibold text-white text-sm leading-tight">Q1 Marketing Hiring</div>
            <div className="text-purple-200 text-[10px] mt-0.5">Marketing · Remote</div>
          </div>
          {/* form body */}
          <div className="p-3.5 space-y-2.5">
            {coreRows.map((r) => (
              <PvField key={r.label} label={r.label} required={r.required} select={"select" in r} lg={false} />
            ))}
            <div className="border-2 border-dashed border-gray-200 rounded-lg py-2 text-center text-[10px] text-gray-400">
              ↑ Resume / CV
            </div>
            {customFields.map((f) => (
              <PvField
                key={f.id}
                label={f.label || FIELD_TYPE_META[f.type].label}
                required={f.required}
                select={f.type === "dropdown"}
                multiline={f.type === "paragraph"}
                lg={false}
              />
            ))}
            <div className="flex items-start gap-2 pt-1">
              <div className="w-3.5 h-3.5 border border-gray-400 rounded-sm flex-shrink-0 mt-0.5" />
              <span className="text-[10px] text-gray-500 leading-tight">I agree to the Data Privacy Policy</span>
            </div>
            <button className="w-full bg-purple-700 text-white text-xs py-2 rounded-lg font-medium mt-1">
              Submit Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  // desktop shell
  return (
    <div className="w-full border border-gray-300 rounded-xl overflow-hidden shadow-md bg-white">
      {/* browser chrome */}
      <div className="bg-gray-100 border-b border-gray-200 px-4 py-2.5 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded-lg px-3 py-1 text-[11px] text-gray-400 font-mono border border-gray-200 truncate">
          careers.preciofishbone.com/jobs/req-12345/apply
        </div>
      </div>
      {/* page */}
      <div className="bg-gray-50 overflow-y-auto" style={{ maxHeight: 520 }}>
        <div className="bg-purple-700 px-5 py-3 flex items-center gap-3">
          <span className="font-bold text-white text-sm">PrecioFishbone</span>
          <span className="text-purple-300 text-xs">· Careers</span>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <p className="font-semibold text-gray-900 text-base">Q1 Marketing Hiring</p>
            <p className="text-gray-400 text-xs mt-0.5">Marketing · Remote</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {coreRows.map((r) => (
                <PvField key={r.label} label={r.label} required={r.required} select={"select" in r} lg />
              ))}
            </div>
            <div className="border-2 border-dashed border-gray-200 rounded-lg py-3 text-center text-xs text-gray-400">
              ↑ Resume / CV upload
            </div>
            {customFields.length > 0 && (
              <div className="border-t border-dashed border-gray-100 pt-3 grid grid-cols-2 gap-3">
                {customFields.map((f) => (
                  <PvField
                    key={f.id}
                    label={f.label || FIELD_TYPE_META[f.type].label}
                    required={f.required}
                    select={f.type === "dropdown"}
                    multiline={f.type === "paragraph"}
                    lg
                  />
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border border-gray-400 rounded-sm flex-shrink-0" />
              <span className="text-xs text-gray-500">I agree to the Data Privacy Policy</span>
            </div>
            <button className="w-full bg-purple-700 text-white text-sm py-2.5 rounded-lg font-medium">
              Submit Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PvField({
  label, required, select, multiline, lg,
}: {
  label: string; required?: boolean; select?: boolean; multiline?: boolean; lg: boolean;
}) {
  return (
    <div>
      <div className={`text-gray-500 mb-1 font-medium ${lg ? "text-xs" : "text-[10px]"}`}>
        {label}{required && <span className="text-red-400"> *</span>}
      </div>
      {multiline ? (
        <div className={`bg-gray-50 border border-gray-200 rounded-lg ${lg ? "h-16" : "h-10"}`} />
      ) : (
        <div className={`bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between ${lg ? "px-3 py-2" : "px-2 py-1.5"}`}>
          <span className={`text-gray-300 ${lg ? "text-xs" : "text-[10px]"}`}>—</span>
          {select && <ChevronDown size={lg ? 12 : 9} className="text-gray-300" />}
        </div>
      )}
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────
export default function ApplicationFormV2Page() {
  const [shareOpen,     setShareOpen]     = useState(false);
  const [drawerField,   setDrawerField]   = useState<CustomField | null>(null);
  const [device,        setDevice]        = useState<PreviewDevice>("mobile");
  const [status,        setStatus]        = useState<"active" | "inactive">("active");
  const [startDate,     setStartDate]     = useState("2026-03-24");
  const [endDate,       setEndDate]       = useState("2026-04-30");
  const [phoneRequired, setPhoneRequired] = useState(false);
  const [sourceVisible, setSourceVisible] = useState(true);
  const [customFields,  setCustomFields]  = useState<CustomField[]>([]);
  const [dirty,         setDirty]         = useState(false);
  const [showNotes,     setShowNotes]     = useState(true);

  const bump = () => setDirty((v) => !v);

  const addField = useCallback((type: FieldType) => {
    const isComplex = type === "dropdown" || type === "checkbox";
    const f: CustomField = {
      id: `field-${Date.now()}`,
      type,
      label: "",
      required: false,
      options: isComplex ? ["Option 1", "Option 2"] : undefined,
    };
    setCustomFields((prev) => [...prev, f]);
    bump();
    if (isComplex) setTimeout(() => setDrawerField(f), 50);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateField = useCallback((updated: CustomField) => {
    setCustomFields((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    bump();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteField = useCallback((id: string) => {
    setCustomFields((prev) => prev.filter((f) => f.id !== id));
    bump();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">

      {/* ── top bar ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
        <p className="text-xs text-gray-400 mb-2">
          <Link href="/" className="hover:text-purple-600 transition-colors">Home</Link>
          {" / "}Jobs{" / "}
          <span className="text-gray-600">Q1 Marketing Hiring</span>
          {" / "}
          <span className="text-purple-600 font-medium">Application Form</span>
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          {/* status — note 1 */}
          <AnnotationBadge note={DESIGN_NOTES[0]} active={showNotes} />
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value as "active" | "inactive"); bump(); }}
            className={`text-sm font-medium border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-colors ${
              status === "active"
                ? "border-green-300 bg-green-50 text-green-700"
                : "border-gray-300 bg-gray-50 text-gray-600"
            }`}
          >
            <option value="active">● Active</option>
            <option value="inactive">○ Inactive</option>
          </select>

          {/* dates */}
          <div className="flex items-center gap-2 text-sm">
            <input type="date" value={startDate}
              onChange={(e) => { setStartDate(e.target.value); bump(); }}
              className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition"
            />
            <span className="text-gray-300">→</span>
            <input type="date" value={endDate}
              onChange={(e) => { setEndDate(e.target.value); bump(); }}
              className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition"
            />
          </div>

          <div className="flex-1" />

          {/* auto-save — note 3 */}
          <AnnotationBadge note={DESIGN_NOTES[2]} active={showNotes} />
          <AutoSave dirty={dirty} />

          {/* share — note 2 */}
          <AnnotationBadge note={DESIGN_NOTES[1]} active={showNotes} />
          <div className="relative">
            <button
              type="button"
              onClick={() => setShareOpen((v) => !v)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                shareOpen ? "bg-gray-100 border-gray-300 text-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Link2 size={14} />
              Share
              <ChevronDown size={12} className={`transition-transform ${shareOpen ? "rotate-180" : ""}`} />
            </button>
            {shareOpen && <SharePopover onClose={() => setShareOpen(false)} />}
          </div>

          {/* open real form in new tab */}
          <Link
            href="/apply/q1-marketing-hiring"
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ExternalLink size={14} />
            Open form
          </Link>

          {/* design notes toggle */}
          <button
            type="button"
            onClick={() => setShowNotes((v) => !v)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
              showNotes
                ? "bg-amber-400 border-amber-400 text-white"
                : "border-amber-300 text-amber-600 hover:bg-amber-50"
            }`}
          >
            <Lightbulb size={14} />
            Design Notes
          </button>
        </div>
      </div>

      {/* ── design notes panel ── */}
      {showNotes && <NotesPanel onClose={() => setShowNotes(false)} />}

      {/* ── body: builder (left) + preview (right) ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT: builder ── */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 min-w-0">

          {/* system core fields */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold text-gray-800">System Core Fields</h2>
              <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                Required by ATS · cannot be removed
              </span>
              <AnnotationBadge note={DESIGN_NOTES[3]} active={showNotes} />
            </div>
            <div className="space-y-2">
              {SYSTEM_CORE_FIELDS.map((field) => (
                <div key={field.id} className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-xl">
                  <Lock size={13} className={field.locked ? "text-gray-300 flex-shrink-0" : "text-transparent flex-shrink-0"} />
                  <span className={`flex-1 text-sm ${field.locked ? "text-gray-400" : "text-gray-700"}`}>
                    {field.label}
                  </span>
                  {"toggleKey" in field ? (
                    <div className="flex items-center gap-2 ml-auto">
                      <span className="text-xs text-gray-400">
                        {field.toggleKey === "phoneRequired"
                          ? phoneRequired ? "Required" : "Optional"
                          : sourceVisible ? "Visible" : "Hidden"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (field.toggleKey === "phoneRequired") setPhoneRequired((v) => !v);
                          else setSourceVisible((v) => !v);
                          bump();
                        }}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          (field.toggleKey === "phoneRequired" ? phoneRequired : sourceVisible)
                            ? "bg-purple-600" : "bg-gray-300"
                        }`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                          (field.toggleKey === "phoneRequired" ? phoneRequired : sourceVisible)
                            ? "translate-x-4" : "translate-x-1"
                        }`} />
                      </button>
                    </div>
                  ) : field.locked ? (
                    <span className="text-[10px] text-gray-300 border border-gray-100 px-1.5 py-0.5 rounded font-medium">locked</span>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          {/* custom fields */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold text-gray-800">
                Custom Fields
                {customFields.length > 0 && (
                  <span className="ml-1.5 text-xs font-normal text-gray-400">{customFields.length} added</span>
                )}
              </h2>
              {/* notes 6 & 7 — field cards */}
              <AnnotationBadge note={DESIGN_NOTES[5]} active={showNotes} />
              <AnnotationBadge note={DESIGN_NOTES[6]} active={showNotes} />
            </div>

            {customFields.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 rounded-2xl py-10 text-center mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Plus size={18} className="text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-500 mb-1">No custom fields yet</p>
                <p className="text-xs text-gray-400">Pick a field type below to add a screening question.</p>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                {customFields.map((f) => (
                  <FieldCard
                    key={f.id}
                    field={f}
                    onUpdate={updateField}
                    onDelete={deleteField}
                    onOpenDrawer={setDrawerField}
                  />
                ))}
              </div>
            )}

            {/* ── compact field palette (horizontal strip) ── */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Add a field</p>
                {/* note 5 — palette */}
                <AnnotationBadge note={DESIGN_NOTES[4]} active={showNotes} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {FIELD_TYPES.map((type) => {
                  const meta   = FIELD_TYPE_META[type];
                  const colors = FIELD_COLORS[type];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => addField(type)}
                      className="flex items-center gap-2.5 p-2.5 bg-white border border-gray-100 rounded-xl hover:border-purple-200 hover:shadow-sm transition-all group text-left"
                    >
                      <span className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-sm flex-shrink-0 ${colors.bg} ${colors.text} ${colors.border}`}>
                        {meta.icon}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-700 group-hover:text-purple-700 leading-tight truncate">{meta.label}</p>
                        <p className="text-[9px] text-gray-400 leading-tight truncate">{meta.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* security note */}
          <div className="flex gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 leading-relaxed">
            <AlertCircle size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <span>
              Submissions protected by reCAPTCHA v3. CVs virus-scanned before storage.
              Duplicate applications (same email) automatically rejected.
            </span>
          </div>
        </div>

        {/* ── RIGHT: live preview panel ── */}
        <div className="w-[420px] flex-shrink-0 border-l border-gray-200 bg-gray-100 flex flex-col overflow-hidden">

          {/* panel header with device toggle */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Live Preview</p>
              {/* note 8 — live preview */}
              <AnnotationBadge note={DESIGN_NOTES[7]} active={showNotes} />
            </div>
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setDevice("desktop")}
                title="Desktop"
                className={`p-1.5 rounded-md transition-colors ${device === "desktop" ? "bg-white shadow-sm text-purple-600" : "text-gray-400 hover:text-gray-600"}`}
              >
                <Monitor size={15} />
              </button>
              <button
                type="button"
                onClick={() => setDevice("mobile")}
                title="Mobile"
                className={`p-1.5 rounded-md transition-colors ${device === "mobile" ? "bg-white shadow-sm text-purple-600" : "text-gray-400 hover:text-gray-600"}`}
              >
                <Smartphone size={15} />
              </button>
            </div>
          </div>

          {/* preview canvas */}
          <div className="flex-1 overflow-y-auto p-6 flex items-start justify-center">
            <LivePreview
              device={device}
              customFields={customFields}
              phoneRequired={phoneRequired}
              sourceVisible={sourceVisible}
            />
          </div>

          {/* footer hint */}
          <div className="bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0">
            <p className="text-[10px] text-gray-400 text-center leading-relaxed">
              Updates in real time as you configure fields.{" "}
              <Link href="/apply/q1-marketing-hiring" target="_blank" className="text-purple-600 hover:underline">
                Open full form →
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* slide-in drawer */}
      {drawerField && (
        <FieldDrawer
          field={drawerField}
          onUpdate={(updated) => { updateField(updated); setDrawerField(null); }}
          onClose={() => setDrawerField(null)}
        />
      )}
    </div>
  );
}
