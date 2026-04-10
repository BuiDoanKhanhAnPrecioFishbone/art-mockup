"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Send,
  FileText,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { ToastProvider, useToast } from "@/shared/ui/toast";
import { emailTemplates } from "@/shared/fixtures/group-3033";
import type { EmailTemplate, TemplateVariable, VariableStatus } from "@/shared/types/group-3033";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function deriveStatus(value: string): VariableStatus {
  if (!value.trim()) return "empty";
  return "resolved";
}

function initVariables(tpl: EmailTemplate): TemplateVariable[] {
  return tpl.variables.map((v) => ({ ...v, value: "", status: "empty" as VariableStatus }));
}

// ─── Variable tag ─────────────────────────────────────────────────────────────
// Shows {{key}} wrapped in a coloured pill; yellow = issue, green = resolved.
function VariableTag({ status, label }: { status: VariableStatus; label: string }) {
  const base = "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border transition-colors duration-300";
  if (status === "resolved") {
    return (
      <span className={`${base} bg-green-50 text-green-700 border-green-300`}>
        <CheckCircle2 size={11} />
        {`{{${label}}}`}
      </span>
    );
  }
  return (
    <span className={`${base} bg-yellow-50 text-yellow-700 border-yellow-300`}>
      <AlertCircle size={11} />
      {`{{${label}}}`}
    </span>
  );
}

// ─── Preview body renderer ────────────────────────────────────────────────────
function PreviewBody({
  template,
  variables,
}: {
  template: EmailTemplate;
  variables: TemplateVariable[];
}) {
  const varMap = Object.fromEntries(variables.map((v) => [v.key, v]));

  return (
    <div className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed font-mono">
      {template.bodyParts.map((part) => {
        if (part.type === "text") return <span key={part.id}>{part.content}</span>;
        const v = varMap[part.content];
        if (!v) return null;
        if (v.status === "resolved") {
          return (
            <span
              key={part.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-green-50 text-green-700 border border-green-300 transition-colors duration-300"
            >
              <CheckCircle2 size={11} />
              {v.value}
            </span>
          );
        }
        return (
          <span
            key={part.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-300"
          >
            <AlertCircle size={11} />
            {`{{${v.label}}}`}
          </span>
        );
      })}
    </div>
  );
}

// ─── Variable filler row ─────────────────────────────────────────────────────
function VariableRow({
  variable,
  onChange,
}: {
  variable: TemplateVariable;
  onChange: (key: string, value: string) => void;
}) {
  const isResolved = variable.status === "resolved";

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors duration-300 ${
        isResolved
          ? "bg-green-50 border-green-200"
          : "bg-yellow-50 border-yellow-200"
      }`}
    >
      {/* Tag */}
      <div className="w-40 shrink-0">
        <VariableTag status={variable.status} label={variable.key} />
      </div>

      {/* Label */}
      <span className="w-36 shrink-0 text-xs font-medium text-gray-600">
        {variable.label}
      </span>

      {/* Input */}
      <div className="flex-1 relative">
        <input
          type="text"
          value={variable.value}
          onChange={(e) => onChange(variable.key, e.target.value)}
          placeholder={variable.expectedPattern ?? `Enter ${variable.label}…`}
          className={`w-full px-3 py-1.5 text-sm rounded-md border outline-none transition-colors duration-200 ${
            isResolved
              ? "border-green-300 bg-white text-gray-800 focus:ring-1 focus:ring-green-400"
              : "border-yellow-300 bg-white text-gray-800 focus:ring-1 focus:ring-yellow-400"
          }`}
        />
      </div>

      {/* Status icon */}
      <div className="w-6 shrink-0 flex items-center justify-center">
        {isResolved ? (
          <CheckCircle2 size={18} className="text-green-500" />
        ) : (
          <AlertCircle size={18} className="text-yellow-500" />
        )}
      </div>
    </div>
  );
}

// ─── Main inner component ─────────────────────────────────────────────────────
function Group3033Inner() {
  const { showToast } = useToast();

  const [selectedTemplateId, setSelectedTemplateId] = useState(emailTemplates[0].id);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [screen, setScreen] = useState<"editor" | "preview">("editor");

  const selectedTemplate = emailTemplates.find((t) => t.id === selectedTemplateId)!;

  const [variablesMap, setVariablesMap] = useState<Record<string, TemplateVariable[]>>(
    Object.fromEntries(emailTemplates.map((t) => [t.id, initVariables(t)]))
  );

  const variables = variablesMap[selectedTemplateId];

  const unresolvedCount = variables.filter((v) => v.status !== "resolved").length;
  const allResolved = unresolvedCount === 0;

  const handleVariableChange = useCallback(
    (key: string, value: string) => {
      setVariablesMap((prev) => ({
        ...prev,
        [selectedTemplateId]: prev[selectedTemplateId].map((v) =>
          v.key === key ? { ...v, value, status: deriveStatus(value) } : v
        ),
      }));
    },
    [selectedTemplateId]
  );

  const handleReset = () => {
    setVariablesMap((prev) => ({
      ...prev,
      [selectedTemplateId]: initVariables(selectedTemplate),
    }));
  };

  const handleSend = () => {
    if (!allResolved) {
      showToast("error", `Please fill in all ${unresolvedCount} remaining variable(s) before sending.`);
      return;
    }
    showToast("success", "Email sent successfully!");
    setScreen("editor");
    handleReset();
  };

  const selectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    setShowTemplatePicker(false);
    setScreen("editor");
  };

  // Subject with variable substitution for preview
  const previewSubject = selectedTemplate.subject.replace(
    /{{(\w+)}}/g,
    (_, key) => {
      const v = variables.find((x) => x.key === key);
      return v?.status === "resolved" ? v.value : `{{${key}}}`;
    }
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-base font-semibold text-gray-900">Template Variable Filler</h1>
          <p className="text-xs text-gray-500">Fill in all highlighted variables before sending</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* Screen toggle */}
          <button
            onClick={() => setScreen(screen === "editor" ? "preview" : "editor")}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            {screen === "editor" ? "Preview email" : "Back to editor"}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left panel: variable inputs ──────────────────────────────── */}
        <aside className="w-96 border-r border-gray-200 bg-white flex flex-col overflow-hidden">
          {/* Template selector */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">Template</p>
            <div className="relative">
              <button
                onClick={() => setShowTemplatePicker((p) => !p)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 hover:border-gray-400 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FileText size={14} className="text-gray-400" />
                  {selectedTemplate.name}
                </span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>
              {showTemplatePicker && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                  {emailTemplates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => selectTemplate(t.id)}
                      className={`w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                        t.id === selectedTemplateId ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Status summary */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                allResolved
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-yellow-50 text-yellow-700 border border-yellow-200"
              }`}
            >
              {allResolved ? (
                <>
                  <CheckCircle2 size={16} />
                  All variables resolved — ready to send
                </>
              ) : (
                <>
                  <AlertCircle size={16} />
                  {unresolvedCount} variable{unresolvedCount !== 1 ? "s" : ""} need attention
                </>
              )}
            </div>
          </div>

          {/* Variable list */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Variables</p>
              <button
                onClick={handleReset}
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
              >
                <RotateCcw size={11} />
                Reset
              </button>
            </div>
            {variables.map((v) => (
              <VariableRow key={v.key} variable={v} onChange={handleVariableChange} />
            ))}
          </div>

          {/* Send button */}
          <div className="px-4 py-4 border-t border-gray-100">
            <Button
              onClick={handleSend}
              className={`w-full flex items-center justify-center gap-2 ${
                allResolved
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!allResolved}
            >
              <Send size={15} />
              {allResolved ? "Send Email" : `${unresolvedCount} issue${unresolvedCount !== 1 ? "s" : ""} remaining`}
            </Button>
          </div>
        </aside>

        {/* ── Right panel: email preview ──────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            {/* Email card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Email header area */}
              <div className="px-6 py-4 border-b border-gray-100 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-medium text-gray-400 w-14 pt-0.5 shrink-0">Subject</span>
                  <p className="text-sm text-gray-800 font-medium leading-relaxed">
                    {previewSubject.split(/({{[^}]+}})/g).map((part, i) =>
                      /^{{/.test(part) ? (
                        <span
                          key={i}
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs bg-yellow-100 text-yellow-700 border border-yellow-200"
                        >
                          <AlertCircle size={10} />
                          {part}
                        </span>
                      ) : (
                        <span key={i}>{part}</span>
                      )
                    )}
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-5">
                <PreviewBody template={selectedTemplate} variables={variables} />
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-6 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-yellow-200 border border-yellow-300 inline-block" />
                Unfilled variable (issue)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-green-200 border border-green-300 inline-block" />
                Resolved variable
              </span>
            </div>

            {/* Quick-fill helper when on preview screen */}
            {screen === "preview" && !allResolved && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                <p className="font-medium flex items-center gap-2">
                  <AlertCircle size={15} />
                  {unresolvedCount} variable{unresolvedCount !== 1 ? "s" : ""} still need to be filled.
                </p>
                <p className="mt-1 text-xs text-yellow-700">Switch back to the editor panel on the left to fill them in.</p>
              </div>
            )}
            {allResolved && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                <p className="font-medium flex items-center gap-2">
                  <CheckCircle2 size={15} />
                  All variables resolved! The email is ready to send.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Export wrapped with ToastProvider ───────────────────────────────────────
export function Group3033Client() {
  return (
    <ToastProvider>
      <Group3033Inner />
    </ToastProvider>
  );
}
