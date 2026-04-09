"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { EmailTemplate } from "@/shared/types/email";
import { templateVariables } from "@/shared/fixtures/email-variables";
import {
  ChevronRight, Eye, Edit3, Copy, Trash2, Save, X, AlertTriangle, CheckCircle2,
  Sparkles, Info
} from "lucide-react";
import AIMagicDraftModal from "./AIMagicDraftModal";

// ── Preview renderer ──────────────────────────────────────────────────────────
const SAMPLE: Record<string, string> = {};
templateVariables.forEach((v) => { SAMPLE[v.key] = v.example; });

const VAR_REGEX = /(\{[A-Za-z]+\})/g;

function PreviewText({ text, inline = false }: { text: string; inline?: boolean }) {
  const parts = text.split(VAR_REGEX);
  const nodes = parts.map((part, i) => {
    if (!part.match(/^\{[A-Za-z]+\}$/)) {
      // Preserve newlines as <br> when not inline
      if (!inline && part.includes("\n")) {
        return part.split("\n").map((line, j, arr) => (
          <span key={`${i}-${j}`}>{line}{j < arr.length - 1 && <br />}</span>
        ));
      }
      return <span key={i}>{part}</span>;
    }
    const sample = SAMPLE[part];
    if (sample) {
      // Recognized variable → green chip with sample value
      return (
        <span
          key={i}
          title={part}
          className="inline-flex items-center rounded-md bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-800 mx-0.5 cursor-default"
        >
          {sample}
        </span>
      );
    }
    // Unrecognized variable → amber chip + tooltip
    return (
      <span key={i} className="relative group inline-flex items-center">
        <span className="inline-flex items-center rounded-md bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800 mx-0.5 cursor-help ring-1 ring-amber-300">
          {part}
        </span>
        {/* Tooltip */}
        <span className="pointer-events-none absolute bottom-full left-0 mb-2 z-20 hidden group-hover:flex w-72 flex-col">
          <span className="rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-xl leading-relaxed">
            ⚠️ Unrecognized variable. Please select a valid option from the dictionary, or delete this text.
          </span>
          <span className="ml-3 h-0 w-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900" />
        </span>
      </span>
    );
  });
  return <>{nodes.flat()}</>;
}

// ── Modals ────────────────────────────────────────────────────────────────────
function UnsavedChangesModal({ onLeave, onStay }: { onLeave: () => void; onStay: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-2xl bg-white shadow-2xl">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <AlertTriangle size={18} className="text-amber-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Unsaved Changes</h3>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            You have unsaved changes in this template. If you leave now, your recent edits will be lost.
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 pb-6">
          <button onClick={onStay} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Stay & Continue Editing
          </button>
          <button onClick={onLeave} className="px-4 py-2 rounded-lg bg-amber-500 text-sm font-medium text-white hover:bg-amber-600 transition-colors">
            Leave Anyway
          </button>
        </div>
      </div>
    </div>
  );
}

function CannotDeleteModal({ workflowName, onClose }: { workflowName: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-2xl bg-white shadow-2xl">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 size={18} className="text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Cannot Delete Template</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            This template is currently active in the{" "}
            <span className="font-medium text-gray-900">{workflowName}</span>{" "}
            workflow. To protect your automated communications, you must replace or
            remove it from that workflow before deleting.
          </p>
        </div>
        <div className="flex justify-end px-6 pb-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-900 text-sm font-medium text-white hover:bg-gray-800 transition-colors">
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Variables Dictionary ──────────────────────────────────────────────────────
const CATEGORIES = ["candidate", "job", "interview", "company", "sender"] as const;

function VariablesDictionary({ onCopy }: { onCopy: (key: string) => void }) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  function copy(key: string) {
    navigator.clipboard?.writeText(key).catch(() => {});
    setCopiedKey(key);
    onCopy(key);
    setTimeout(() => setCopiedKey(null), 1500);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 shrink-0">
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Variables Dictionary</h3>
        <p className="text-[11px] text-gray-400 mt-0.5">Click to copy. Variables are replaced with real data when sending.</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {CATEGORIES.map((cat) => {
          const vars = templateVariables.filter((v) => v.category === cat);
          return (
            <div key={cat}>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1 px-1">
                {cat}
              </p>
              <div className="space-y-0.5">
                {vars.map((v) => (
                  <button
                    key={v.key}
                    onClick={() => copy(v.key)}
                    className="w-full flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50 text-left group transition-colors"
                  >
                    <code className="text-[11px] font-mono text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded shrink-0">
                      {copiedKey === v.key ? "Copied!" : v.key}
                    </code>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">{v.label}</p>
                      <p className="text-[10px] text-gray-400 truncate">{v.example}</p>
                    </div>
                    <Copy size={11} className="ml-auto text-gray-300 group-hover:text-gray-500 shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function TemplateEditor({
  template: initialTemplate,
  isNew = false,
}: {
  template: EmailTemplate;
  isNew?: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialTemplate.name);
  const [subject, setSubject] = useState(initialTemplate.subject);
  const [body, setBody] = useState(initialTemplate.body);
  const [tab, setTab] = useState<"editor" | "preview">("editor");
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsaved, setShowUnsaved] = useState(false);
  const [showCannotDelete, setShowCannotDelete] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pendingLeave, setPendingLeave] = useState(false);
  const [showAIDraft, setShowAIDraft] = useState(false);

  const markDirty = useCallback(() => { setIsDirty(true); setSaved(false); }, []);

  function handleSave() {
    setIsDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function tryLeave() {
    if (isDirty) { setShowUnsaved(true); setPendingLeave(true); }
    else router.push("/flows/email-management");
  }

  function handleDelete() {
    if (initialTemplate.usedInWorkflow) setShowCannotDelete(true);
    // if not in workflow, would navigate away
  }

  const hasUnrecognizedVars = body.match(/\{[A-Za-z]+\}/g)?.some(
    (m) => !templateVariables.find((v) => v.key === m)
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-8 py-3 shrink-0">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <Link href="/flows/email-management" className="hover:text-gray-600 transition-colors">Email Management</Link>
          <ChevronRight size={12} />
          <span className="text-gray-600">{isNew ? "Create Email Template" : name || "Edit Template"}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isNew ? (
              <input
                value={name}
                onChange={(e) => { setName(e.target.value); markDirty(); }}
                placeholder="Email Template Name"
                className="text-base font-semibold text-gray-900 border-b-2 border-transparent focus:border-purple-400 outline-none bg-transparent placeholder-gray-300 w-64"
              />
            ) : (
              <h1 className="text-base font-semibold text-gray-900">{name}</h1>
            )}
            {isDirty && (
              <span className="text-xs text-amber-600 flex items-center gap-1">
                <AlertTriangle size={12} /> Unsaved changes
              </span>
            )}
            {saved && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle2 size={12} /> Saved
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isNew && (
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Trash2 size={13} />
                Delete
              </button>
            )}
            <button
              onClick={tryLeave}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <X size={13} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
            >
              <Save size={13} />
              Save Template
            </button>
          </div>
        </div>
      </header>

      {/* Tab bar */}
      <div className="border-b border-gray-200 bg-white px-8 shrink-0">
        <div className="flex gap-1">
          {(["editor", "preview"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${
                tab === t
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "editor" ? <><Edit3 size={13} className="inline mr-1.5" />Editor</> : <><Eye size={13} className="inline mr-1.5" />Preview</>}
            </button>
          ))}
          <button
            onClick={() => setShowAIDraft(true)}
            className="ml-auto self-center inline-flex items-center gap-1.5 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium px-3 py-1.5 hover:bg-purple-100 transition-colors"
          >
            <Sparkles size={13} />
            AI Magic Draft
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden flex">
        {tab === "editor" ? (
          <>
            {/* Editor panel */}
            <div className="flex-1 overflow-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Email Subject
                </label>
                <input
                  value={subject}
                  onChange={(e) => { setSubject(e.target.value); markDirty(); }}
                  placeholder="EMAIL SUBJECT"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Email Body
                </label>
                <textarea
                  value={body}
                  onChange={(e) => { setBody(e.target.value); markDirty(); }}
                  placeholder="EMAIL BODY — use {VariableName} to insert dynamic content"
                  rows={18}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none leading-relaxed"
                />
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-gray-400">{body.length} characters</span>
                  {hasUnrecognizedVars && (
                    <span className="text-xs text-amber-600 flex items-center gap-1">
                      <Info size={11} /> Unrecognized variable detected
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Variables sidebar */}
            <aside className="w-64 shrink-0 border-l border-gray-200 bg-white overflow-hidden flex flex-col">
              <VariablesDictionary onCopy={() => {}} />
            </aside>
          </>
        ) : (
          /* Preview panel */
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-2xl mx-auto">
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="text-xs text-gray-400 ml-2">Email Preview</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    <span className="font-medium text-gray-600">From:</span> Tran Thi B &lt;hr@preciofishbone.com&gt;
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    <span className="font-medium text-gray-600">To:</span> Nguyen Van A &lt;candidate@email.com&gt;
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-2 leading-relaxed">
                    {subject ? <PreviewText text={subject} inline /> : <span className="text-gray-400 font-normal">(No subject)</span>}
                  </p>
                </div>
                <div className="p-6">
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {body ? <PreviewText text={body} /> : <span className="text-gray-400">(No content)</span>}
                  </div>
                  {/* Signature */}
                  <div className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-500">
                    <p className="font-medium text-gray-700">Best regards,</p>
                    <p>@ Precio Fishbone VN</p>
                    <p className="text-gray-400 mt-1">Finding the best talent for tomorrow&apos;s challenges</p>
                    <p className="text-gray-400">www.preciofishbone.com | LinkedIn Profile</p>
                  </div>
                </div>
              </div>
              {/* Legend */}
              <div className="flex items-center gap-4 mt-3 justify-center">
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="inline-block w-3 h-3 rounded bg-green-100 ring-1 ring-green-300" />
                  Recognized variable (sample value shown)
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="inline-block w-3 h-3 rounded bg-amber-100 ring-1 ring-amber-300" />
                  Unrecognized variable — hover for details
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showUnsaved && (
        <UnsavedChangesModal
          onLeave={() => {
            setShowUnsaved(false);
            if (pendingLeave) router.push("/flows/email-management");
          }}
          onStay={() => { setShowUnsaved(false); setPendingLeave(false); }}
        />
      )}
      {showCannotDelete && initialTemplate.usedInWorkflow && (
        <CannotDeleteModal
          workflowName={initialTemplate.usedInWorkflow}
          onClose={() => setShowCannotDelete(false)}
        />
      )}
      {showAIDraft && (
        <AIMagicDraftModal
          onClose={() => setShowAIDraft(false)}
          onApply={(s, b) => {
            setSubject(s);
            setBody(b);
            markDirty();
            setTab("editor");
          }}
        />
      )}
    </div>
  );
}
