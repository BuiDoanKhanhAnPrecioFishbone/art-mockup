"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  AlertCircle,
  CheckCircle2,
  Clock,
  Bold,
  Italic,
  Paperclip,
  PenLine,
  X,
  Send,
  Check,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { ToastProvider, useToast } from "@/shared/ui/toast";
import { candidates, emailTemplates, recentMessages } from "@/shared/fixtures/group-3489";
import type {
  Candidate,
  BulkSendForm,
  BulkSendSettings,
} from "@/shared/types/group-3489";

// ─── Stage badge colours ──────────────────────────────────────────────────────
function stageBadge(stage: string) {
  const map: Record<string, string> = {
    Applied: "bg-blue-100 text-blue-700",
    Screening: "bg-yellow-100 text-yellow-700",
    Interview: "bg-purple-100 text-purple-700",
    Assessment: "bg-orange-100 text-orange-700",
    Offer: "bg-green-100 text-green-700",
    Hired: "bg-emerald-100 text-emerald-700",
    Rejected: "bg-red-100 text-red-700",
  };
  return map[stage] ?? "bg-gray-100 text-gray-600";
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ initials }: { initials: string }) {
  return (
    <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-semibold shrink-0">
      {initials}
    </div>
  );
}

// ─── Issue label ──────────────────────────────────────────────────────────────
function IssueLabel({ issue }: { issue: Candidate["issue"] }) {
  if (issue === "none") return null;
  const labels: Record<string, string> = {
    missing_email: "Missing email",
    invalid_email: "Invalid email",
    unsubscribed: "Unsubscribed",
  };
  return (
    <span className="inline-flex items-center gap-1 text-xs text-red-600">
      <AlertCircle size={12} />
      {labels[issue]}
    </span>
  );
}

// ─── Variable-highlighted text renderer ──────────────────────────────────────
// Renders {{variable_name}} tokens as chips. When a value is provided via
// `values`, the chip turns green and shows the filled value.
function HighlightedText({
  text,
  values = {},
}: {
  text: string;
  values?: Record<string, string>;
}) {
  if (!text) return null;
  const parts = text.split(/({{[^}]+}})/g);
  return (
    <>
      {parts.map((part, i) => {
        if (/^{{[^}]+}}$/.test(part)) {
          const filled = !!values[part]?.trim();
          return (
            <mark
              key={i}
              className={`rounded px-1 py-0.5 font-mono text-xs not-italic border transition-colors ${
                filled
                  ? "bg-green-100 text-green-800 border-green-300"
                  : "bg-amber-100 text-amber-800 border-amber-300"
              }`}
            >
              {filled ? values[part] : part}
            </mark>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// ─── Variable resolver panel ──────────────────────────────────────────────────
// Shows each unique {{variable}} as a chip + adjacent input. Chip turns green
// when the user fills in a value.
function VariableResolver({
  text,
  values,
  onChange,
}: {
  text: string;
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
}) {
  const variables = [...new Set(text.match(/{{[^}]+}}/g) ?? [])];
  if (variables.length === 0) return null;

  return (
    <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 space-y-2">
      <p className="text-xs font-medium text-gray-500">Variables</p>
      {variables.map((v) => {
        const filled = !!values[v]?.trim();
        return (
          <div key={v} className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded border font-mono text-xs font-medium shrink-0 transition-colors ${
                filled
                  ? "bg-green-100 text-green-700 border-green-300"
                  : "bg-amber-100 text-amber-700 border-amber-300"
              }`}
            >
              {v}
            </span>
            <input
              type="text"
              placeholder={v.replace(/{{|}}/g, "").replace(/_/g, " ")}
              value={values[v] ?? ""}
              onChange={(e) => onChange({ ...values, [v]: e.target.value })}
              className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {filled && <CheckCircle2 size={14} className="text-green-500 shrink-0" />}
          </div>
        );
      })}
    </div>
  );
}

// ─── Screen 1: Candidate Table ────────────────────────────────────────────────
interface CandidateTableScreenProps {
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  onBulkEmail: () => void;
}

function CandidateTableScreen({
  selectedIds,
  onToggle,
  onToggleAll,
  onBulkEmail,
}: CandidateTableScreenProps) {
  const allSelected = selectedIds.size === candidates.length;
  const someSelected = selectedIds.size > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <p className="text-xs text-gray-500 mb-1">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          {" / "}
          <span className="hover:text-blue-600 cursor-pointer">Jobs</span>
          {" / "}
          <span className="text-gray-700">Precio test&apos;s applications</span>
        </p>
        <h1 className="text-xl font-semibold text-gray-900">
          Precio test&apos;s applications
        </h1>
      </div>

      <div className="px-6 py-4">
        {/* Bulk action toolbar */}
        {someSelected && (
          <div className="mb-3 flex items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2">
            <span className="text-sm text-indigo-700 font-medium">
              {selectedIds.size} candidate{selectedIds.size > 1 ? "s" : ""} selected
            </span>
            <span className="text-gray-300">|</span>
            <button className="text-sm text-indigo-600 hover:underline">
              Change Stage
            </button>
            <button className="text-sm text-red-600 hover:underline">Reject</button>
            <button
              onClick={onBulkEmail}
              className="text-sm text-indigo-600 font-semibold hover:underline flex items-center gap-1"
            >
              <Mail size={14} />
              Bulk Email
            </button>
          </div>
        )}

        {/* Table card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Table toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by candidate..."
                className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-56"
              />
            </div>
            <button className="flex items-center gap-1.5 text-sm text-indigo-600 font-medium border border-indigo-300 rounded-lg px-3 py-1.5 hover:bg-indigo-50 transition-colors">
              <Plus size={14} />
              Add Candidate
            </button>
          </div>

          {/* Table */}
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="w-10 px-4 py-3">
                  <Checkbox
                    checked={allSelected}
                    onChange={onToggleAll}
                    aria-label="Select all"
                  />
                </th>
                <th className="px-4 py-3 font-medium text-gray-600">Candidate</th>
                <th className="px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="px-4 py-3 font-medium text-gray-600">Phone</th>
                <th className="px-4 py-3 font-medium text-gray-600">Stage</th>
                <th className="px-4 py-3 font-medium text-gray-600">Applied</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {candidates.map((c) => (
                <tr
                  key={c.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    selectedIds.has(c.id) ? "bg-indigo-50/50" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selectedIds.has(c.id)}
                      onChange={() => onToggle(c.id)}
                      aria-label={`Select ${c.name}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar initials={c.avatarInitials} />
                      <div>
                        <div className="font-medium text-gray-900">{c.name}</div>
                        {c.issue !== "none" && <IssueLabel issue={c.issue} />}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.email || <span className="text-gray-300 italic">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${stageBadge(c.stage)}`}
                    >
                      {c.stage}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(c.appliedAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!someSelected && (
          <p className="text-xs text-gray-400 mt-3 text-center">
            Select candidates above to enable bulk actions
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Inline missing-data editor inside the candidates panel ──────────────────
interface MissingDataRowProps {
  candidate: Candidate;
  onResolve: (id: string, patch: Partial<Candidate>) => void;
  onRemove: (id: string) => void;
}

function MissingDataRow({ candidate, onResolve, onRemove }: MissingDataRowProps) {
  const [value, setValue] = useState("");

  const fieldLabel =
    candidate.issue === "missing_email" || candidate.issue === "invalid_email"
      ? "Email address"
      : "—";

  function handleSave() {
    if (!value.trim()) return;
    onResolve(candidate.id, { email: value.trim(), issue: "none" });
  }

  return (
    <div className="px-3 py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-start gap-3">
        <Avatar initials={candidate.avatarInitials} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm font-medium text-gray-900 truncate">{candidate.name}</span>
            <AlertCircle size={13} className="text-red-500 shrink-0" />
          </div>
          <div className="flex items-center gap-1.5">
            <IssueLabel issue={candidate.issue} />
            <input
              type="email"
              placeholder={fieldLabel}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="flex-1 border border-gray-300 rounded px-2 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleSave}
              disabled={!value.trim()}
              className="p-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors"
              title="Save"
            >
              <Check size={12} />
            </button>
          </div>
        </div>
        <button
          onClick={() => onRemove(candidate.id)}
          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
          title="Remove candidate"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Screen 2: Bulk Send Form ─────────────────────────────────────────────────
interface BulkSendScreenProps {
  form: BulkSendForm;
  onChange: (form: BulkSendForm) => void;
  onCancel: () => void;
  onSend: (resolvedCount: number) => void;
  initialCandidates: Candidate[];
}

function BulkSendScreen({
  form,
  onChange,
  onCancel,
  onSend,
  initialCandidates,
}: BulkSendScreenProps) {
  const [emailSettingsOpen, setEmailSettingsOpen] = useState(true);
  const [emailContentOpen, setEmailContentOpen] = useState(true);
  const [candidatesTab, setCandidatesTab] = useState<"all" | "issues">("all");
  const [candidateSearch, setCandidateSearch] = useState("");
  const [showRecentMessages, setShowRecentMessages] = useState(false);
  // Local mutable copy so we can resolve missing data without touching root state
  const [panelCandidates, setPanelCandidates] = useState<Candidate[]>(initialCandidates);
  // Values filled in for each {{variable}} found in subject + body
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  const issueCount = panelCandidates.filter((c) => c.issue !== "none").length;
  const hasUnresolvedIssues = issueCount > 0;

  const filteredCandidates = panelCandidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(candidateSearch.toLowerCase());
    if (candidatesTab === "issues") return matchesSearch && c.issue !== "none";
    return matchesSearch;
  });

  function updateSettings(patch: Partial<BulkSendSettings>) {
    onChange({ ...form, settings: { ...form.settings, ...patch } });
  }

  function handleTemplateChange(id: string) {
    const tpl = emailTemplates.find((t) => t.id === id);
    onChange({
      ...form,
      templateId: id,
      subject: tpl?.subject ?? form.subject,
      body: tpl?.body ?? form.body,
    });
  }

  function removeCandidate(id: string) {
    setPanelCandidates((prev) => prev.filter((c) => c.id !== id));
  }

  function resolveCandidate(id: string, patch: Partial<Candidate>) {
    setPanelCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <p className="text-xs text-gray-500 mb-1">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          {" / "}
          <span className="hover:text-blue-600 cursor-pointer">Jobs</span>
          {" / "}
          <button onClick={onCancel} className="hover:text-blue-600 transition-colors">
            Precio test&apos;s applications
          </button>
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">New Bulk Send</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            {/* Disabled until all issues are resolved */}
            <Button
              onClick={() => onSend(panelCandidates.filter((c) => c.issue === "none").length)}
              disabled={hasUnresolvedIssues}
              className="flex items-center gap-1.5"
              title={
                hasUnresolvedIssues
                  ? `Resolve or remove ${issueCount} candidate issue${issueCount > 1 ? "s" : ""} to send`
                  : undefined
              }
            >
              <Send size={14} />
              Send Emails
            </Button>
          </div>
        </div>
      </div>

      {/* Disabled-send hint banner */}
      {hasUnresolvedIssues && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 flex items-center gap-2">
          <AlertCircle size={15} className="text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">
            <span className="font-medium">{issueCount} candidate{issueCount > 1 ? "s have" : " has"} issues.</span>{" "}
            Fill in the missing data or remove them from the list to enable sending.
          </p>
          <button
            onClick={() => {
              setCandidatesTab("issues");
            }}
            className="ml-auto text-xs text-amber-700 underline whitespace-nowrap"
          >
            View issues →
          </button>
        </div>
      )}

      <div className="flex gap-4 px-6 py-4 max-w-screen-xl mx-auto">
        {/* ── Left: form ───────────────────────────────────────────────────── */}
        <div className="flex-1 space-y-4 min-w-0">
          {/* Bulk Send Name + Template */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bulk Send Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => onChange({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Email Template */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Select Email Template
                </label>
                <button
                  onClick={() => setShowRecentMessages(!showRecentMessages)}
                  className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <Clock size={12} />
                  Use Recent Message
                </button>
              </div>

              {showRecentMessages ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {recentMessages.map((msg) => (
                    <button
                      key={msg.id}
                      onClick={() => {
                        onChange({ ...form, subject: msg.subject });
                        setShowRecentMessages(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-indigo-50 border-b last:border-0 border-gray-100 transition-colors"
                    >
                      <div className="text-sm font-medium text-gray-800 truncate">
                        {msg.subject}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {new Date(msg.sentAt).toLocaleDateString("en-GB")} ·{" "}
                        {msg.recipientCount} recipients
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <select
                  value={form.templateId ?? ""}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">Please Select</option>
                  {emailTemplates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Email Setting */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setEmailSettingsOpen(!emailSettingsOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-semibold text-gray-700">Email Setting</span>
              {emailSettingsOpen ? (
                <ChevronDown size={16} className="text-gray-500" />
              ) : (
                <ChevronRight size={16} className="text-gray-500" />
              )}
            </button>

            {emailSettingsOpen && (
              <div className="px-4 py-4 space-y-4">
                {/* From */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
                  <input
                    type="text"
                    value={form.settings.from}
                    onChange={(e) => updateSettings({ from: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* To */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
                  <div className="flex items-start gap-2">
                    <div className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 flex flex-wrap gap-1 min-h-[38px]">
                      {panelCandidates
                        .filter((c) => c.issue === "none" && c.email)
                        .map((c) => (
                          <span
                            key={c.id}
                            className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs rounded px-1.5 py-0.5"
                          >
                            {c.email}
                            <button
                              onClick={() => removeCandidate(c.id)}
                              className="hover:text-indigo-900"
                            >
                              <X size={10} />
                            </button>
                          </span>
                        ))}
                      {panelCandidates.filter((c) => c.issue === "none").length === 0 && (
                        <span className="text-gray-400 text-sm">No valid recipients</span>
                      )}
                    </div>
                    <button className="text-xs text-indigo-600 border border-indigo-300 rounded px-2 py-1 hover:bg-indigo-50 whitespace-nowrap">
                      + CC
                    </button>
                    <button className="text-xs text-indigo-600 border border-indigo-300 rounded px-2 py-1 hover:bg-indigo-50 whitespace-nowrap">
                      + BCC
                    </button>
                  </div>
                </div>

                {/* Tracking */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">
                    Tracking
                  </label>
                  <div className="flex items-center gap-6">
                    <Checkbox
                      id="trackOpens"
                      label="Track Opens"
                      checked={form.settings.trackOpens}
                      onChange={(e) => updateSettings({ trackOpens: e.target.checked })}
                    />
                    <Checkbox
                      id="trackClicks"
                      label="Track Clicks"
                      checked={form.settings.trackClicks}
                      onChange={(e) => updateSettings({ trackClicks: e.target.checked })}
                    />
                    <Checkbox
                      id="trackReplies"
                      label="Track Replies"
                      checked={form.settings.trackReplies}
                      onChange={(e) => updateSettings({ trackReplies: e.target.checked })}
                    />
                  </div>
                </div>

                {/* Schedule Send */}
                <div>
                  <Checkbox
                    id="scheduleSend"
                    label="Schedule Send"
                    checked={form.settings.scheduleSend}
                    onChange={(e) => updateSettings({ scheduleSend: e.target.checked })}
                  />
                  {form.settings.scheduleSend && (
                    <div className="flex gap-3 mt-3">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Date</label>
                        <input
                          type="date"
                          value={form.settings.scheduleDate}
                          onChange={(e) => updateSettings({ scheduleDate: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Time</label>
                        <input
                          type="time"
                          value={form.settings.scheduleTime}
                          onChange={(e) => updateSettings({ scheduleTime: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Email Content */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setEmailContentOpen(!emailContentOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-semibold text-gray-700">Email Content</span>
              {emailContentOpen ? (
                <ChevronDown size={16} className="text-gray-500" />
              ) : (
                <ChevronRight size={16} className="text-gray-500" />
              )}
            </button>

            {emailContentOpen && (
              <div className="px-4 py-4 space-y-4">
                {/* Subject */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => onChange({ ...form, subject: e.target.value })}
                    placeholder="Enter email subject..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {/* Subject variable preview */}
                  {/{{[^}]+}}/.test(form.subject) && (
                    <div className="mt-1.5 text-xs text-gray-500 leading-relaxed">
                      Preview: <HighlightedText text={form.subject} values={variableValues} />
                    </div>
                  )}
                </div>

                {/* Body */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Email Body
                  </label>
                  {/* Toolbar */}
                  <div className="flex items-center gap-1 border border-gray-300 border-b-0 rounded-t-lg px-2 py-1.5 bg-gray-50">
                    <button
                      className="p-1 rounded hover:bg-gray-200 transition-colors"
                      title="Bold"
                    >
                      <Bold size={14} className="text-gray-600" />
                    </button>
                    <button
                      className="p-1 rounded hover:bg-gray-200 transition-colors"
                      title="Italic"
                    >
                      <Italic size={14} className="text-gray-600" />
                    </button>
                    <div className="w-px h-4 bg-gray-300 mx-1" />
                    <button
                      className="p-1 rounded hover:bg-gray-200 transition-colors flex items-center gap-1 text-xs text-gray-600"
                      title="Attach Files"
                    >
                      <Paperclip size={13} />
                      Attach Files
                    </button>
                    <div className="ml-auto">
                      <button
                        className="p-1 rounded hover:bg-gray-200 transition-colors flex items-center gap-1 text-xs text-gray-600"
                        title="Signature"
                      >
                        <PenLine size={13} />
                        Signature
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={form.body}
                    onChange={(e) => onChange({ ...form, body: e.target.value })}
                    placeholder="Write your email body here. Use {{variable_name}} for dynamic fields."
                    rows={6}
                    className="w-full border border-gray-300 rounded-b-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />

                  {/* Variable body preview */}
                  {/{{[^}]+}}/.test(form.body) && (
                    <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                      <p className="text-xs font-medium text-gray-500 mb-1">Preview:</p>
                      <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
                        <HighlightedText text={form.body} values={variableValues} />
                      </p>
                    </div>
                  )}

                  {/* Variable resolver: [chip] [input] per unique variable */}
                  <VariableResolver
                    text={form.subject + "\n" + form.body}
                    values={variableValues}
                    onChange={setVariableValues}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: candidates panel ──────────────────────────────────────── */}
        <div className="w-96 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-4">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setCandidatesTab("all")}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  candidatesTab === "all"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                All ({panelCandidates.length})
              </button>
              <button
                onClick={() => setCandidatesTab("issues")}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                  candidatesTab === "issues"
                    ? "text-red-600 border-b-2 border-red-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {issueCount > 0 && <AlertCircle size={14} />}
                Issues ({issueCount})
              </button>
            </div>

            {/* Search + Add */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100">
              <div className="relative flex-1">
                <Search
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search by candidate..."
                  value={candidateSearch}
                  onChange={(e) => setCandidateSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button className="text-xs text-indigo-600 border border-indigo-300 rounded-lg px-2.5 py-1.5 hover:bg-indigo-50 transition-colors whitespace-nowrap flex items-center gap-1">
                <Plus size={12} />
                Add Candidate
              </button>
            </div>

            {/* Candidate list */}
            {filteredCandidates.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">
                {candidatesTab === "issues" ? "No issues — ready to send!" : "No candidates found"}
              </div>
            ) : candidatesTab === "issues" ? (
              // Issues tab: show inline missing-data editor
              <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                {filteredCandidates.map((c) => (
                  <MissingDataRow
                    key={c.id}
                    candidate={c}
                    onResolve={resolveCandidate}
                    onRemove={removeCandidate}
                  />
                ))}
              </div>
            ) : (
              // All tab: compact list
              <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                {filteredCandidates.map((c) => (
                  <div key={c.id} className="flex items-start gap-3 px-3 py-3 group">
                    <Avatar initials={c.avatarInitials} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {c.name}
                        </span>
                        {c.issue === "none" ? (
                          <CheckCircle2 size={13} className="text-green-500 shrink-0" />
                        ) : (
                          <AlertCircle size={13} className="text-red-500 shrink-0" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500 truncate mt-0.5">
                        {c.email || (
                          <span className="text-red-500 italic">No email address</span>
                        )}
                      </div>
                      {c.issue !== "none" && <IssueLabel issue={c.issue} />}
                    </div>
                    <button
                      onClick={() => removeCandidate(c.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                      title="Remove candidate"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Footer hint — only on "all" tab when issues exist */}
            {issueCount > 0 && candidatesTab === "all" && (
              <div className="px-3 py-2.5 bg-red-50 border-t border-red-100 flex items-center gap-2">
                <AlertCircle size={14} className="text-red-500 shrink-0" />
                <p className="text-xs text-red-600">
                  {issueCount} candidate{issueCount > 1 ? "s have" : " has"} issues.{" "}
                  <button
                    onClick={() => setCandidatesTab("issues")}
                    className="underline font-medium"
                  >
                    Fix or remove them
                  </button>{" "}
                  to enable sending.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 3: Success ────────────────────────────────────────────────────────
interface SuccessScreenProps {
  form: BulkSendForm;
  sentCount: number;
  onDone: () => void;
}

function SuccessScreen({ form, sentCount, onDone }: SuccessScreenProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Emails Sent!</h2>
        <p className="text-gray-500 text-sm mb-6">
          Your bulk send{" "}
          <span className="font-medium text-gray-700">&ldquo;{form.name}&rdquo;</span> has been
          queued successfully.
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Emails queued</span>
            <span className="font-semibold text-green-700">{sentCount}</span>
          </div>
          {form.settings.scheduleSend && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Scheduled for</span>
              <span className="font-semibold text-indigo-700">
                {form.settings.scheduleDate} {form.settings.scheduleTime}
              </span>
            </div>
          )}
        </div>

        <Button onClick={onDone} className="w-full">
          Back to Candidates
        </Button>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
type Screen = "candidateTable" | "bulkSend" | "success";

function Group3489Inner() {
  const { showToast } = useToast();

  const [screen, setScreen] = useState<Screen>("candidateTable");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(["c-1", "c-2", "c-3"]));

  const [form, setForm] = useState<BulkSendForm>({
    name: "Precio test's applications - Bulk Send (19/03)",
    templateId: null,
    subject: "",
    body: "",
    settings: {
      from: "nguyenvana@gmail.com",
      trackOpens: true,
      trackClicks: true,
      trackReplies: false,
      scheduleSend: false,
      scheduleDate: "",
      scheduleTime: "",
    },
    selectedCandidateIds: [],
  });

  const [sentCount, setSentCount] = useState(0);

  function toggleCandidate(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selectedIds.size === candidates.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(candidates.map((c) => c.id)));
    }
  }

  function handleBulkEmail() {
    if (selectedIds.size === 0) {
      showToast("error", "No candidates selected");
      return;
    }
    setForm((f) => ({ ...f, selectedCandidateIds: Array.from(selectedIds) }));
    setScreen("bulkSend");
  }

  function handleSend(resolvedCount: number) {
    setSentCount(resolvedCount);
    setScreen("success");
    showToast("success", `${resolvedCount} email(s) queued successfully`);
  }

  const selectedCandidates = candidates.filter((c) => selectedIds.has(c.id));

  if (screen === "candidateTable") {
    return (
      <CandidateTableScreen
        selectedIds={selectedIds}
        onToggle={toggleCandidate}
        onToggleAll={toggleAll}
        onBulkEmail={handleBulkEmail}
      />
    );
  }

  if (screen === "bulkSend") {
    return (
      <BulkSendScreen
        form={form}
        onChange={setForm}
        onCancel={() => setScreen("candidateTable")}
        onSend={handleSend}
        initialCandidates={selectedCandidates}
      />
    );
  }

  return (
    <SuccessScreen
      form={form}
      sentCount={sentCount}
      onDone={() => {
        setScreen("candidateTable");
        setSelectedIds(new Set());
      }}
    />
  );
}

export function Group3489Client() {
  return (
    <ToastProvider>
      <Group3489Inner />
    </ToastProvider>
  );
}
