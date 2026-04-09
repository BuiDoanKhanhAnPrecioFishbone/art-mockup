"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { emailTemplates } from "@/shared/fixtures/email-templates";
import { emailLogs } from "@/shared/fixtures/email-logs";
import { emailAccounts as initialAccounts } from "@/shared/fixtures/email-accounts";
import type { EmailAccount, EmailProvider } from "@/shared/types/email";
import {
  Plus, Edit3, Zap, Search, SlidersHorizontal,
  CheckCircle2, XCircle, MinusCircle, BarChart2,
  AlertCircle, Unlink, Link2, RefreshCw, Shield,
  Mail, X, ChevronRight, Trash2, HelpCircle, Info,
  Bold, Paperclip, Save,
} from "lucide-react";

type Tab = "template-library" | "settings" | "logs";

// ─────────────────────────────────────────────
// CANNOT DELETE MODAL
// ─────────────────────────────────────────────
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
        <div className="flex items-center justify-end gap-3 px-6 pb-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button className="px-4 py-2 rounded-lg bg-gray-900 text-sm font-medium text-white hover:bg-gray-800 transition-colors">
            Go to Workflow
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TEMPLATE LIBRARY TAB
// ─────────────────────────────────────────────
function TemplateLibraryTab() {
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<(typeof emailTemplates)[0] | null>(null);
  const filtered = emailTemplates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase())
  );

  function handleDelete(tpl: (typeof emailTemplates)[0]) {
    if (tpl.usedInWorkflow) {
      setDeleteTarget(tpl);
    }
    // If not in a workflow, a confirmation modal could be added here
  }

  return (
    <div className="p-6">
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xl">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by template name, category..."
            className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          />
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          <SlidersHorizontal size={14} />
          Filter
        </button>
        <Link
          href="/flows/email-management/templates/new"
          className="ml-auto inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors whitespace-nowrap"
        >
          <Plus size={14} />
          + Create New Template
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[26%]">Template Name</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[28%]">Subject Line</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[12%]">Tags</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[14%]">Last Updated</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[10%]">Status</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[10%]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">
                  No templates match &ldquo;{search}&rdquo;
                </td>
              </tr>
            )}
            {filtered.map((tpl) => (
              <tr key={tpl.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-5 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-gray-900">{tpl.name}</span>
                    {tpl.usedInWorkflow && (
                      <span className="inline-flex items-center gap-1 w-fit rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700">
                        <Zap size={10} /> {tpl.usedInWorkflow}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-500 text-xs max-w-0">
                  <p className="truncate">{tpl.subject}</p>
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700 ring-1 ring-inset ring-purple-100">
                    Email
                  </span>
                </td>
                <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
                  {new Date(tpl.updatedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                    tpl.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {tpl.status === "active" ? "Active" : "Draft"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/flows/email-management/templates/${tpl.id}`}
                      className="p-1.5 rounded-md text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                      title="Edit"
                    >
                      <Edit3 size={15} />
                    </Link>
                    <button
                      onClick={() => handleDelete(tpl)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <p className="text-xs text-gray-400">{filtered.length} of {emailTemplates.length} templates</p>
        </div>
      </div>

      {deleteTarget?.usedInWorkflow && (
        <CannotDeleteModal
          workflowName={deleteTarget.usedInWorkflow}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// SETTINGS TAB
// ─────────────────────────────────────────────
function GmailIcon({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size}>
      <path fill="#EA4335" d="M6 40V18l18 12 18-12v22H6z" />
      <path fill="#FBBC05" d="M6 18l18 12 18-12" />
      <path fill="#4285F4" d="M6 18V8l18 12V8h18v10L24 30 6 18z" />
      <path fill="#34A853" d="M42 8v32H6V8l18 12L42 8z" opacity=".1" />
    </svg>
  );
}
function OutlookIcon({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size}>
      <rect width="48" height="48" rx="6" fill="#0078D4" />
      <rect x="4" y="12" width="22" height="24" rx="2" fill="#005A9E" />
      <text x="9" y="29" fontSize="16" fill="white" fontWeight="bold" fontFamily="sans-serif">O</text>
      <rect x="24" y="16" width="20" height="16" rx="1" fill="white" opacity=".9" />
      <path d="M24 16l10 9 10-9" stroke="#0078D4" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

const PROVIDERS: { id: EmailProvider; label: string; description: string }[] = [
  { id: "outlook", label: "Outlook", description: "Syncs your Outlook calendar and emails." },
  { id: "gmail", label: "Gmail", description: "Syncs emails and calendar events." },
];

const SIG_VARIABLES = [
  { key: "{user_name}", label: "Your name" },
  { key: "{job_title}", label: "Job title" },
  { key: "{company}", label: "Company name" },
  { key: "{phone}", label: "Phone number" },
  { key: "{website}", label: "Website URL" },
];

function DisconnectModal({ account, onConfirm, onCancel }: { account: EmailAccount; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <Unlink size={18} className="text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Disconnect Account?</h3>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            Are you sure you want to disconnect <span className="font-medium text-gray-900">{account.email}</span>?
            This will immediately stop all ongoing email processes and automations.
            You will need to re-login to resume.
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 pb-6">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-600 text-sm font-medium text-white hover:bg-red-700 transition-colors">Yes, disconnect</button>
        </div>
      </div>
    </div>
  );
}

function ConnectModal({ provider, onConnect, onCancel }: { provider: EmailProvider; onConnect: (provider: EmailProvider, email: string) => void; onCancel: () => void }) {
  const [email, setEmail] = useState("");
  const p = PROVIDERS.find((p) => p.id === provider)!;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {provider === "gmail" ? <GmailIcon size={28} /> : <OutlookIcon size={28} />}
            <div>
              <h3 className="font-semibold text-gray-900">Connect {p.label}</h3>
              <p className="text-xs text-gray-500">{p.description}</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-500">Connect your account to automatically sync candidate communication and calendar events. Authorization is handled securely via OAuth.</p>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder={`your@${provider === "gmail" ? "gmail.com" : "outlook.com"}`}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 pb-6">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={() => email && onConnect(provider, email)} disabled={!email}
            className="px-4 py-2 rounded-lg bg-purple-600 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-40 disabled:pointer-events-none transition-colors">
            Connect via OAuth
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  const [accounts, setAccounts] = useState<EmailAccount[]>(initialAccounts);
  const [disconnectTarget, setDisconnectTarget] = useState<EmailAccount | null>(null);
  const [connectProvider, setConnectProvider] = useState<EmailProvider | null>(null);
  const [signature, setSignature] = useState(
    "Best regard, @ Precio Fishbone VN\nFinding the best talent for tomorrow's challenges\n\n{user_name}\n{job_title}\nwww.preciofishbone.com | LinkedIn Profile"
  );
  const [sigSaved, setSigSaved] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  function handleDisconnect(account: EmailAccount) {
    setAccounts((prev) => prev.map((a) => a.id === account.id ? { ...a, status: "not_connected" as const, connectedAt: undefined } : a));
    setDisconnectTarget(null);
    showToast(`${account.email} disconnected`);
  }

  function handleConnect(provider: EmailProvider, email: string) {
    const existing = accounts.find((a) => a.provider === provider);
    if (existing) {
      setAccounts((prev) => prev.map((a) => a.id === existing.id ? { ...a, email, status: "connected" as const, connectedAt: new Date().toISOString() } : a));
    } else {
      setAccounts((prev) => [...prev, { id: `acc-${Date.now()}`, email, provider, status: "connected" as const, connectedAt: new Date().toISOString() }]);
    }
    setConnectProvider(null);
    showToast(`${email} connected successfully`);
  }

  function handleReconnect(account: EmailAccount) {
    setAccounts((prev) => prev.map((a) => a.id === account.id ? { ...a, status: "connected" as const, connectedAt: new Date().toISOString() } : a));
    showToast(`${account.email} reconnected`);
  }

  function insertVar(v: string) {
    setSignature((s) => s + v);
  }

  function saveSignature() {
    setSigSaved(true);
    setTimeout(() => setSigSaved(false), 2000);
    showToast("Signature saved");
  }

  return (
    <div className="p-6 space-y-5">

      {/* ── Email Integration ── */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">Email Integration</h3>
            <HelpCircle size={14} className="text-gray-400" />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Connect your email account to automatically sync candidate communication and calendar events.
          </p>
        </div>

        <div className="grid grid-cols-2 divide-x divide-gray-100">
          {PROVIDERS.map((p) => {
            const account = accounts.find((a) => a.provider === p.id);
            const isConnected = account?.status === "connected";
            const isExpired = account?.status === "expired";

            return (
              <div key={p.id} className="p-6 flex flex-col gap-4">
                {/* Logo + badge */}
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center">
                    {p.id === "gmail" ? <GmailIcon size={36} /> : <OutlookIcon size={36} />}
                  </div>
                  {isConnected && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                      <CheckCircle2 size={11} /> Active
                    </span>
                  )}
                  {isExpired && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                      <AlertCircle size={11} /> Expired
                    </span>
                  )}
                  {!isConnected && !isExpired && (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-400">
                      Not connected
                    </span>
                  )}
                </div>

                {/* Name + description */}
                <div>
                  <p className="font-semibold text-gray-900">{p.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{p.description}</p>
                </div>

                {/* Connected account info */}
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Connected Account</p>
                  {account && account.status !== "not_connected" ? (
                    <p className="text-sm text-gray-700 font-medium">{account.email}</p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Not connected</p>
                  )}
                  {isExpired && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> Token expired — please reconnect.
                    </p>
                  )}
                </div>

                {/* Action button */}
                <div className="mt-auto pt-2">
                  {isConnected && account && (
                    <button
                      onClick={() => setDisconnectTarget(account)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3.5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <Unlink size={13} /> Disconnect
                    </button>
                  )}
                  {isExpired && account && (
                    <button
                      onClick={() => handleReconnect(account)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors"
                    >
                      <RefreshCw size={13} /> Reconnect
                    </button>
                  )}
                  {!isConnected && !isExpired && (
                    <button
                      onClick={() => setConnectProvider(p.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
                    >
                      <Link2 size={13} /> Connect
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Privacy & Security ── */}
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-4 flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
          <Info size={14} className="text-blue-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Privacy &amp; Security</p>
          <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
            We access your email solely to sync candidate correspondence. Your data is encrypted and we never store your password.{" "}
            <span className="text-purple-600 cursor-pointer hover:underline">Learn more about our security policy.</span>
          </p>
        </div>
      </div>

      {/* ── Email Signature ── */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">Email Signature</h3>
            <HelpCircle size={14} className="text-gray-400" />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Create a professional signature to be automatically appended to your outgoing emails.
          </p>
        </div>

        <div className="flex">
          {/* Editor */}
          <div className="flex-1 flex flex-col border-r border-gray-100">
            {/* Toolbar */}
            <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-100 bg-gray-50">
              <button className="p-1.5 rounded hover:bg-gray-200 transition-colors font-bold text-sm text-gray-600 w-7 h-7 flex items-center justify-center">B</button>
              <button className="p-1.5 rounded hover:bg-gray-200 transition-colors italic text-sm text-gray-600 w-7 h-7 flex items-center justify-center">I</button>
              <div className="w-px h-4 bg-gray-300 mx-1" />
              <button className="inline-flex items-center gap-1.5 px-2 py-1 rounded hover:bg-gray-200 transition-colors text-xs text-gray-600">
                <Paperclip size={13} /> Attach Files
              </button>
            </div>
            {/* Text area */}
            <textarea
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              rows={10}
              className="flex-1 p-4 text-sm text-gray-700 font-mono resize-none focus:outline-none leading-relaxed"
              placeholder="Write your email signature here..."
            />
            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Mail size={11} /> This signature will be appended to emails sent via connected accounts.
              </p>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={saveSignature}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 text-xs font-medium text-white hover:bg-purple-700 transition-colors"
                >
                  <Save size={12} />
                  {sigSaved ? "Saved!" : "Save"}
                </button>
              </div>
            </div>
          </div>

          {/* Variables panel */}
          <div className="w-52 shrink-0 flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <p className="text-xs font-semibold text-gray-600">Personal Variable</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Click to insert into signature</p>
            </div>
            <div className="p-3 space-y-1.5 flex-1">
              {SIG_VARIABLES.map((v) => (
                <button
                  key={v.key}
                  onClick={() => insertVar(v.key)}
                  className="w-full flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50 text-left transition-colors group"
                >
                  <code className="text-[11px] font-mono text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded shrink-0">{"{*}"}</code>
                  <span className="text-xs text-gray-600 truncate">{v.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {disconnectTarget && (
        <DisconnectModal
          account={disconnectTarget}
          onConfirm={() => handleDisconnect(disconnectTarget)}
          onCancel={() => setDisconnectTarget(null)}
        />
      )}
      {connectProvider && (
        <ConnectModal
          provider={connectProvider}
          onConnect={handleConnect}
          onCancel={() => setConnectProvider(null)}
        />
      )}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg flex items-center gap-2">
          <CheckCircle2 size={15} className="text-green-400" />{toast}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// LOGS TAB
// ─────────────────────────────────────────────
function LogsTab() {
  const [search, setSearch] = useState("");
  const filtered = emailLogs.filter((l) =>
    !search || l.name.toLowerCase().includes(search.toLowerCase()) || (l.jobName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by template name, category..."
            className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        <button className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition-colors">
          <SlidersHorizontal size={16} />
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 font-medium text-gray-500 min-w-[220px]">Name</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 min-w-[160px]">Job Name</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 min-w-[180px]">Type &amp; Sender</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 whitespace-nowrap">Timestamp</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 min-w-[200px]">Delivery Status</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 min-w-[160px]">Performance</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  {/* Name */}
                  <td className="px-5 py-3.5">
                    <Link href={`/flows/email-management/logs/${log.id}`} className="font-medium text-gray-900 hover:text-purple-600 transition-colors leading-snug line-clamp-2 max-w-[220px]">
                      {log.name}
                    </Link>
                  </td>
                  {/* Job Name */}
                  <td className="px-5 py-3.5 text-sm text-gray-600 max-w-[160px] truncate">{log.jobName || "—"}</td>
                  {/* Type & Sender */}
                  <td className="px-5 py-3.5">
                    {log.sendType ? (
                      <>
                        <p className="text-sm text-gray-700 capitalize">
                          {log.sendType === "bulk" ? `Bulk (${log.total})` : "Single Send"}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]">{log.sender}</p>
                      </>
                    ) : <span className="text-gray-400">—</span>}
                  </td>
                  {/* Timestamp */}
                  <td className="px-5 py-3.5 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.sentAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    {" · "}
                    {new Date(log.sentAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  {/* Delivery Status */}
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-green-700 font-medium">{log.delivered} Delivered</span>
                    <span className="text-gray-300 mx-1.5">|</span>
                    <span className="text-xs text-amber-600 font-medium">{log.skipped} Skipped</span>
                    <span className="text-gray-300 mx-1.5">|</span>
                    <span className="text-xs text-red-600 font-medium">{log.failed} Failed</span>
                  </td>
                  {/* Performance */}
                  <td className="px-5 py-3.5">
                    {log.openRate !== undefined ? (
                      <div className="text-xs text-gray-600 space-y-0.5">
                        <p>Open Rate: <span className="font-medium text-gray-800">{log.openRate}%</span></p>
                        <p>Click Rate: <span className="font-medium text-gray-800">{log.clickRate}%</span></p>
                      </div>
                    ) : <span className="text-gray-400 text-xs">—</span>}
                  </td>
                  {/* Action */}
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/flows/email-management/logs/${log.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-800 transition-colors whitespace-nowrap"
                    >
                      View full report <ChevronRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-400">No logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">{filtered.length} entries</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <button className="px-2 py-1 rounded border border-gray-200 disabled:opacity-30" disabled>&lt;</button>
            <span className="px-2 font-medium">1 / 1</span>
            <button className="px-2 py-1 rounded border border-gray-200 disabled:opacity-30" disabled>&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
const TABS: { id: Tab; label: string }[] = [
  { id: "template-library", label: "Template Library" },
  { id: "settings", label: "Settings" },
  { id: "logs", label: "Logs" },
];

function EmailManagementPageInner() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab | null) ?? "template-library";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  useEffect(() => {
    const t = searchParams.get("tab") as Tab | null;
    if (t) setActiveTab(t);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Page header */}
      <header className="bg-white border-b border-gray-200 px-8 py-5 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Email Management</h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage email templates, accounts, and sending logs</p>
          </div>
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1">
            <ChevronRight size={12} className="rotate-180" /> Wireframe Explorer
          </Link>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-8 shrink-0">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-purple-600 text-purple-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "template-library" && <TemplateLibraryTab />}
        {activeTab === "settings" && <SettingsTab />}
        {activeTab === "logs" && <LogsTab />}
      </div>
    </div>
  );
}

export default function EmailManagementPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <EmailManagementPageInner />
    </Suspense>
  );
}
