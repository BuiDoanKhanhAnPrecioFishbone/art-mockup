"use client";

import { useState } from "react";
import type { EmailLog, EmailLogRecipient } from "@/shared/types/email";
import {
  CheckCircle2, XCircle, MinusCircle, Search,
  Download, X, AlertTriangle,
  ChevronRight
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────
type Filter = "all" | "delivered" | "skipped" | "failed";

function StatusBadge({ status }: { status: EmailLogRecipient["status"] }) {
  const map = {
    delivered: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    skipped: "bg-amber-100 text-amber-700",
  };
  const Icon = { delivered: CheckCircle2, failed: XCircle, skipped: MinusCircle }[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${map[status]}`}>
      <Icon size={11} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

// ── Variable chips in email preview ──────────────────────────────────────────
const VAR_REGEX = /(\{[A-Za-z]+\})/g;
function PreviewBody({ text }: { text: string }) {
  const parts = text.split(VAR_REGEX);
  return (
    <>
      {parts.flatMap((part, i) => {
        if (!part.match(/^\{[A-Za-z]+\}$/)) {
          return part.split("\n").map((line, j, arr) => (
            <span key={`${i}-${j}`}>{line}{j < arr.length - 1 && <br />}</span>
          ));
        }
        return [
          <span key={i} className="inline-flex items-center rounded-md bg-green-100 px-1.5 py-0.5 text-[11px] font-medium text-green-800 mx-0.5">
            {part}
          </span>
        ];
      })}
    </>
  );
}

// ── Resolve Issues Modal ──────────────────────────────────────────────────────
/** Captured per-recipient fixes from the Resolve Issues form. Skipped
 *  rows surface their missing template variables as `vars`; failed
 *  rows expose the address as `email` so it can be corrected. */
export interface ResolveFix {
  recipientId: string;
  vars?: Record<string, string>;
  email?: string;
}

function ResolveIssuesModal({
  recipients,
  onClose,
  onResend,
}: {
  recipients: EmailLogRecipient[];
  onClose: () => void;
  onResend: (fixes: ResolveFix[]) => void;
}) {
  // Per-recipient draft state for missing vars + corrected email.
  const [vars, setVars] = useState<Record<string, Record<string, string>>>({});
  const [emails, setEmails] = useState<Record<string, string>>({});

  function setVar(recipientId: string, varKey: string, val: string) {
    setVars((prev) => ({
      ...prev,
      [recipientId]: { ...(prev[recipientId] ?? {}), [varKey]: val },
    }));
  }
  function setEmail(recipientId: string, val: string) {
    setEmails((prev) => ({ ...prev, [recipientId]: val }));
  }

  const skipped = recipients.filter(
    (r) => r.status === "skipped" && r.missingVars && r.missingVars.length > 0
  );
  const failed = recipients.filter((r) => r.status === "failed");

  function handleSubmit() {
    const fixes: ResolveFix[] = [];
    for (const r of skipped) {
      const filled = vars[r.id] ?? {};
      const merged = (r.missingVars ?? []).reduce<Record<string, string>>(
        (acc, v) => {
          acc[v.key] = filled[v.key] ?? v.value ?? "";
          return acc;
        },
        {}
      );
      fixes.push({ recipientId: r.id, vars: merged });
    }
    for (const r of failed) {
      fixes.push({
        recipientId: r.id,
        email: (emails[r.id] ?? r.email).trim(),
      });
    }
    onResend(fixes);
  }

  // Submit is gated until every visible row has its required input
  // filled in — vars for skipped, a non-empty email for failed.
  const skippedReady = skipped.every((r) =>
    (r.missingVars ?? []).every(
      (v) => (vars[r.id]?.[v.key] ?? v.value ?? "").trim().length > 0
    )
  );
  const failedReady = failed.every(
    (r) => (emails[r.id] ?? r.email).trim().length > 0
  );
  const canSubmit = skippedReady && failedReady && (skipped.length + failed.length) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl mx-4 rounded-2xl bg-white shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle size={20} className="text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 text-base">Resolve Issues</h3>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <span className="w-4 h-4 rounded-full border border-gray-300 text-[10px] flex items-center justify-center font-medium">?</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Fix the data issues below to resume sending the template.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        {/* Issues list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Skipped — missing template variables */}
          {skipped.length > 0 && (
            <section>
              <p className="text-sm font-medium text-gray-800 mb-1">
                Missing Data in {skipped.length} Profile{skipped.length !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-gray-500 mb-4">
                These candidates are missing required variables for the template.
              </p>

              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Candidate</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Issue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {skipped.map((r) => (
                    <tr key={r.id}>
                      <td className="px-4 py-3 align-top">
                        <p className="font-medium text-gray-900">{r.candidateName}</p>
                        <p className="text-xs text-gray-400">{r.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        {(r.missingVars ?? []).map((v) => {
                          const filled = (vars[r.id]?.[v.key] ?? v.value ?? "").trim().length > 0;
                          return (
                            <div key={v.key} className="flex items-center gap-2 mb-1.5 last:mb-0">
                              <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium shrink-0 transition-colors ${
                                filled
                                  ? "bg-green-100 text-green-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}>
                                {v.key}
                              </span>
                              <input
                                value={vars[r.id]?.[v.key] ?? v.value ?? ""}
                                onChange={(e) => setVar(r.id, v.key, e.target.value)}
                                placeholder={`Enter ${v.label}`}
                                className={`flex-1 rounded-lg border px-2.5 py-1 text-xs focus:outline-none focus:ring-2 transition-colors ${
                                  filled
                                    ? "border-green-300 bg-green-50 focus:ring-green-400"
                                    : "border-gray-200 focus:ring-purple-400"
                                }`}
                              />
                            </div>
                          );
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* Failed — bounced / invalid address */}
          {failed.length > 0 && (
            <section>
              <p className="text-sm font-medium text-gray-800 mb-1">
                Address Issues in {failed.length} Profile{failed.length !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-gray-500 mb-4">
                These messages bounced. Enter a corrected email address to resend.
              </p>

              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Candidate</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Issue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {failed.map((r) => {
                    const current = emails[r.id] ?? r.email;
                    const changed = current !== r.email;
                    return (
                      <tr key={r.id}>
                        <td className="px-4 py-3 align-top">
                          <p className="font-medium text-gray-900">{r.candidateName}</p>
                          <p className="text-xs text-gray-400">{r.email}</p>
                          {r.failureReason && (
                            <p className="text-[11px] text-red-500 mt-1 leading-tight">
                              {r.failureReason}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium shrink-0 ${
                              changed
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-700"
                            }`}>
                              email
                            </span>
                            <input
                              type="email"
                              value={current}
                              onChange={(e) => setEmail(r.id, e.target.value)}
                              placeholder="Enter new email address"
                              className={`flex-1 rounded-lg border px-2.5 py-1 text-xs focus:outline-none focus:ring-2 transition-colors ${
                                changed
                                  ? "border-green-300 bg-green-50 focus:ring-green-400"
                                  : "border-gray-200 focus:ring-purple-400"
                              }`}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          )}

          {skipped.length === 0 && failed.length === 0 && (
            <p className="rounded-lg border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-400">
              Nothing to resolve — every recipient was delivered.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-4 py-2 rounded-lg bg-purple-600 text-sm font-medium text-white hover:bg-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save &amp; Resend
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function LogDetailClient({
  log: initialLog,
  recipients: initialRecipients,
}: {
  log: EmailLog;
  recipients: EmailLogRecipient[];
}) {
  const [recipients, setRecipients] = useState<EmailLogRecipient[]>(
    initialRecipients
  );
  const [log, setLog] = useState<EmailLog>(initialLog);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [showResolve, setShowResolve] = useState(false);
  const [resolveSuccess, setResolveSuccess] = useState(false);

  const counts = {
    all: recipients.length,
    delivered: recipients.filter((r) => r.status === "delivered").length,
    skipped: recipients.filter((r) => r.status === "skipped").length,
    failed: recipients.filter((r) => r.status === "failed").length,
  };

  const filtered = recipients.filter((r) => {
    const matchStatus = filter === "all" || r.status === filter;
    const matchSearch =
      !search ||
      r.candidateName.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Fix & Resend is reachable whenever there's anything to fix —
  // skipped (missing template vars) OR failed (bounced address).
  const canResend = counts.skipped > 0 || counts.failed > 0;

  function handleResend(fixes: ResolveFix[]) {
    if (fixes.length === 0) {
      setShowResolve(false);
      return;
    }
    const fixById = new Map(fixes.map((f) => [f.recipientId, f] as const));
    setRecipients((prev) =>
      prev.map((r) => {
        const fix = fixById.get(r.id);
        if (!fix) return r;
        // Mark fixed rows as delivered, clear the issue payload, and
        // stamp a delivery timestamp so the Tracking column reads
        // something instead of staying blank.
        const next: EmailLogRecipient = {
          ...r,
          status: "delivered",
          missingVars: undefined,
          failureReason: undefined,
          deliveredAt: new Date().toISOString(),
        };
        if (fix.email && fix.email.trim().length > 0) next.email = fix.email;
        return next;
      })
    );
    // Roll the aggregate counts forward so the funnel header reflects
    // what the recruiter just resolved.
    setLog((prev) => {
      const moved = fixes.length;
      const skippedFixed = fixes.filter((f) => f.vars).length;
      const failedFixed = fixes.filter((f) => f.email).length;
      return {
        ...prev,
        delivered: prev.delivered + moved,
        skipped: Math.max(0, prev.skipped - skippedFixed),
        failed: Math.max(0, prev.failed - failedFixed),
      };
    });
    setShowResolve(false);
    setResolveSuccess(true);
    setTimeout(() => setResolveSuccess(false), 3000);
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* ── Stats bar ───────────────────────────────────────────────────── */}
      <div className="border-b border-gray-200 bg-white px-8 py-4 shrink-0 space-y-3">
        {/* Row 1: Delivery Funnel + Performance + Export */}
        <div className="flex items-start gap-8">
          {/* Delivery Funnel */}
          <div className="min-w-[240px]">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
              Delivery Funnel (Total: {log.total})
            </p>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-semibold text-green-700">{log.delivered} Delivered</span>
              <span className="text-gray-300">|</span>
              <span className="font-semibold text-amber-600">{log.skipped} Skipped</span>
              <span className="text-gray-300">|</span>
              <span className="font-semibold text-red-600">{log.failed} Failed</span>
            </div>
          </div>

          {/* Performance Metrics */}
          {log.openRate !== undefined && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                Performance Metrics
              </p>
              <div className="flex items-center gap-3 text-sm">
                <span className="font-semibold text-gray-800">{log.openRate}% Open Rate</span>
                <span className="text-gray-300">|</span>
                <span className="font-semibold text-gray-800">{log.clickRate}% Click Rate</span>
                <span className="text-gray-300">|</span>
                <span className="font-semibold text-gray-800">{log.replyRate}% Reply Rate</span>
              </div>
            </div>
          )}

          {/* Export button */}
          <div className="ml-auto shrink-0">
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3.5 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <Download size={13} /> Export .xlsx
            </button>
          </div>
        </div>

        {/* Row 2: AI Campaign Insight (same section, second line) */}
        {log.aiInsight && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 flex items-center gap-2">
            <AlertTriangle size={12} className="text-amber-500 shrink-0" />
            <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-widest mr-1.5 shrink-0">AI Campaign Insight</span>
            <span className="text-xs text-amber-800">{log.aiInsight.replace(/^[⚠️✅ℹ️]+\s*/, "")}</span>
          </div>
        )}
      </div>

      {/* ── Content: Email Preview + Table ──────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex">

        {/* Left: Email Preview panel */}
        <aside className="w-[340px] shrink-0 border-r border-gray-200 bg-white flex flex-col overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 shrink-0">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Email Preview</p>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {/* Meta */}
            <div className="space-y-1.5 mb-4 text-xs">
              {log.jobName && (
                <div className="flex gap-2">
                  <span className="text-gray-400 w-14 shrink-0">Job:</span>
                  <span className="text-gray-700 font-medium">{log.jobName}</span>
                </div>
              )}
              <div className="flex gap-2">
                <span className="text-gray-400 w-14 shrink-0">Subject:</span>
                <span className="text-gray-700 font-medium leading-snug">{log.subject || "—"}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-400 w-14 shrink-0">From:</span>
                <span className="text-gray-600">{log.sender || "—"}</span>
              </div>
              {log.cc && (
                <div className="flex gap-2">
                  <span className="text-gray-400 w-14 shrink-0">CC:</span>
                  <span className="text-gray-600">{log.cc}</span>
                </div>
              )}
            </div>
            <div className="border-t border-gray-100 mb-4" />
            {log.emailBody ? (
              <div className="text-sm text-gray-700 leading-relaxed">
                <PreviewBody text={log.emailBody} />
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No email body available.</p>
            )}
            <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500 space-y-0.5">
              <p>Best regards, @ Precio Fishbone VN</p>
              <p className="font-medium text-gray-700">Matthias Linda</p>
              <p>HR Admin</p>
            </div>
          </div>
        </aside>

        {/* Right: recipients table */}
        <div className="flex-1 overflow-auto flex flex-col min-w-0">
          {/* Toolbar */}
          <div className="border-b border-gray-200 bg-white px-5 py-2.5 flex items-center gap-3 shrink-0 sticky top-0 z-10">
            {/* Filter tabs */}
            <div className="flex items-center gap-1">
              {(["all", "delivered", "skipped", "failed"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                    filter === f
                      ? "bg-purple-100 text-purple-700"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative ml-2">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by candidate..."
                className="rounded-lg border border-gray-200 pl-7 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-purple-400 w-44"
              />
            </div>

            {/* Fix & Resend */}
            <button
              onClick={() => setShowResolve(true)}
              disabled={!canResend}
              className={`ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                canResend
                  ? "bg-amber-500 text-white hover:bg-amber-600"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Fix &amp; Resend
            </button>
          </div>

          {/* Table */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60 sticky top-[45px] z-10">
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Candidate</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Tracking</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3.5">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-gray-900">{r.candidateName}</p>
                    <p className="text-xs text-gray-400">{r.email}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={r.status} />
                    {r.failureReason && (
                      <p className="text-[10px] text-gray-400 mt-1 max-w-[140px] leading-tight">{r.failureReason}</p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-500 space-y-0.5">
                    {r.openedAt && (
                      <p>Opened: {fmt(r.openedAt)}</p>
                    )}
                    {r.clickedAt && (
                      <p>Clicked: {fmt(r.clickedAt)}</p>
                    )}
                    {!r.openedAt && !r.clickedAt && <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    <button className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-800 transition-colors">
                      View Log <ChevronRight size={11} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">
                    No recipients match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolve Issues Modal */}
      {showResolve && (
        <ResolveIssuesModal
          recipients={recipients}
          onClose={() => setShowResolve(false)}
          onResend={handleResend}
        />
      )}

      {/* Success toast */}
      {resolveSuccess && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-green-600 px-4 py-3 text-sm text-white shadow-lg flex items-center gap-2">
          <CheckCircle2 size={15} /> Issue Resolved — emails are being resent.
        </div>
      )}
    </div>
  );
}
