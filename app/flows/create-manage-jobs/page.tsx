"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Copy,
  X,
  Trash2,
  SlidersHorizontal,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { jobPrograms, jobTemplates } from "@/shared/fixtures/jobs";
import type { JobProgram, JobTemplate, ProgramStatus } from "@/shared/fixtures/jobs";

// ─── Date formatting ────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const sStr = s.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const eStr = e.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${sStr} - ${eStr}`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Status badge ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ProgramStatus }) {
  const classes: Record<ProgramStatus, string> = {
    open: "bg-green-100 text-green-700 border border-green-200",
    draft: "bg-amber-100 text-amber-700 border border-amber-200",
    closed: "bg-gray-100 text-gray-600 border border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${classes[status]}`}
    >
      <span
        className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
          status === "open"
            ? "bg-green-500"
            : status === "draft"
            ? "bg-amber-500"
            : "bg-gray-400"
        }`}
      />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── Toast ───────────────────────────────────────────────────────────────────

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

function Toast({ message, onDismiss }: ToastProps) {
  return (
    <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 flex items-center gap-3 rounded-xl bg-gray-900 px-5 py-3 text-sm text-white shadow-2xl">
      <span>{message}</span>
      <button
        onClick={onDismiss}
        className="ml-1 rounded-full p-0.5 hover:bg-white/20 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ─── Info Modal ──────────────────────────────────────────────────────────────

function InfoModal({ title, body, onClose }: { title: string; body: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-2xl bg-white shadow-2xl">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <AlertCircle size={18} className="text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
        </div>
        <div className="flex items-center justify-end px-6 pb-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-900 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Delete Modal ────────────────────────────────────────────────────

function ConfirmDeleteModal({
  title,
  body,
  onCancel,
  onConfirm,
}: {
  title: string;
  body: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-2xl bg-white shadow-2xl">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 size={18} className="text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-sm font-medium text-white hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Program Card Dropdown ────────────────────────────────────────────────────

interface ProgramCardMenuProps {
  program: JobProgram;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onDuplicate: () => void;
  onMarkClosed: () => void;
  onDelete: () => void;
}

function ProgramCardMenu({
  program,
  isOpen,
  onToggle,
  onClose,
  onDuplicate,
  onMarkClosed,
  onDelete,
}: ProgramCardMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.preventDefault();
          onToggle();
        }}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-8 z-50 w-48 rounded-xl bg-white shadow-xl border border-gray-100 py-1 overflow-hidden">
          <Link
            href={`/flows/create-manage-jobs/programs/${program.id}`}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={onClose}
          >
            <Pencil size={14} className="text-gray-400" />
            Edit Program
          </Link>

          <button
            onClick={() => {
              onClose();
              onDuplicate();
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Copy size={14} className="text-gray-400" />
            Duplicate
          </button>

          <button
            onClick={() => {
              onClose();
              onMarkClosed();
            }}
            disabled={program.status === "closed"}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <X size={14} className="text-gray-400" />
            Mark as Closed
          </button>

          <div className="my-1 border-t border-gray-100" />

          <div className="relative group">
            <button
              onClick={() => {
                onClose();
                onDelete();
              }}
              disabled={program.status === "open"}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 size={14} />
              Delete
            </button>
            {program.status === "open" && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 hidden group-hover:block z-50">
                <div className="bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg">
                  Cannot delete an open program
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Program Card ─────────────────────────────────────────────────────────────

interface ProgramCardProps {
  program: JobProgram;
  menuOpenId: string | null;
  onMenuToggle: (id: string) => void;
  onMenuClose: () => void;
  onDuplicate: (prog: JobProgram) => void;
  onMarkClosed: (id: string) => void;
  onDelete: (prog: JobProgram) => void;
}

function ProgramCard({
  program,
  menuOpenId,
  onMenuToggle,
  onMenuClose,
  onDuplicate,
  onMarkClosed,
  onDelete,
}: ProgramCardProps) {
  return (
    <div className="relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <StatusBadge status={program.status} />
        <ProgramCardMenu
          program={program}
          isOpen={menuOpenId === program.id}
          onToggle={() => onMenuToggle(program.id)}
          onClose={onMenuClose}
          onDuplicate={() => onDuplicate(program)}
          onMarkClosed={() => onMarkClosed(program.id)}
          onDelete={() => onDelete(program)}
        />
      </div>

      {/* Title */}
      <div>
        <Link
          href={`/flows/create-manage-jobs/programs/${program.id}`}
          className="text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors leading-snug line-clamp-2"
        >
          {program.name}
        </Link>
        <p className="mt-0.5 text-xs text-gray-500">
          {program.jobTitle} • {program.jobLevel}
        </p>
      </div>

      {/* Date range */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <span className="font-medium text-gray-700">
          {formatDateRange(program.startDate, program.endDate)}
        </span>
      </div>

      {/* Footer row */}
      <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-100">
        <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 text-xs font-medium">
          {program.headcount} headcount
        </span>
        {program.newApplications && program.newApplications > 0 ? (
          <span className="inline-flex items-center rounded-full bg-red-500 text-white px-2 py-0.5 text-xs font-bold">
            +{program.newApplications} NEW
          </span>
        ) : null}
      </div>
    </div>
  );
}

// ─── Recruitment Programs Tab ─────────────────────────────────────────────────

type StatusFilter = "all" | ProgramStatus;

function RecruitmentProgramsTab() {
  const [programs, setPrograms] = useState<JobProgram[]>(jobPrograms);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [infoModal, setInfoModal] = useState<{ title: string; body: string } | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const filtered = programs.filter((p) => {
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesSearch =
      search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.jobTitle.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  function handleMenuToggle(id: string) {
    setMenuOpenId((prev) => (prev === id ? null : id));
  }

  function handleDuplicate(prog: JobProgram) {
    const clone: JobProgram = {
      ...prog,
      id: `prog-clone-${Date.now()}`,
      name: `${prog.name} (Copy)`,
      status: "draft",
      newApplications: 0,
    };
    setPrograms((prev) => [...prev, clone]);
    showToast(`The program '${prog.name}' has been cloned.`);
  }

  function handleMarkClosed(id: string) {
    setPrograms((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "closed" as ProgramStatus } : p))
    );
  }

  function handleDelete(prog: JobProgram) {
    if (prog.status === "open") {
      setInfoModal({
        title: "Cannot Delete Program",
        body: "Cannot delete because it is currently open for recruitment. Please close the program first before deleting it.",
      });
      return;
    }
    setPrograms((prev) => prev.filter((p) => p.id !== prog.id));
    showToast(`Program '${prog.name}' has been deleted.`);
  }

  const statusTabs: { label: string; value: StatusFilter }[] = [
    { label: "All", value: "all" },
    { label: "Open", value: "open" },
    { label: "Draft", value: "draft" },
    { label: "Closed", value: "closed" },
  ];

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-6">
        {/* Left: search + filter */}
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search programs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
            />
          </div>
          {/* Status filter dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition cursor-pointer"
            >
              {statusTabs.map((tab) => (
                <option key={tab.value} value={tab.value}>
                  {tab.label}
                  {tab.value === "all"
                    ? ` (${programs.length})`
                    : ` (${programs.filter((p) => p.status === tab.value).length})`}
                </option>
              ))}
            </select>
            <SlidersHorizontal
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        {/* Right: add button */}
        <Link
          href="/flows/create-manage-jobs/programs/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shrink-0"
        >
          <Plus size={16} />
          Add New Program
        </Link>
      </div>

      {/* Card grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Search size={40} className="mb-3 opacity-40" />
          <p className="text-sm">No programs found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((prog) => (
            <ProgramCard
              key={prog.id}
              program={prog}
              menuOpenId={menuOpenId}
              onMenuToggle={handleMenuToggle}
              onMenuClose={() => setMenuOpenId(null)}
              onDuplicate={handleDuplicate}
              onMarkClosed={handleMarkClosed}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}

      {/* Info modal */}
      {infoModal && (
        <InfoModal
          title={infoModal.title}
          body={infoModal.body}
          onClose={() => setInfoModal(null)}
        />
      )}
    </div>
  );
}

// ─── Job Templates Tab ────────────────────────────────────────────────────────

function JobTemplatesTab() {
  const [templates, setTemplates] = useState<JobTemplate[]>(jobTemplates);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JobTemplate | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const filtered = templates.filter(
    (t) =>
      search === "" ||
      t.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
      t.level.toLowerCase().includes(search.toLowerCase())
  );

  function handleDuplicate(tpl: JobTemplate) {
    const clone: JobTemplate = {
      ...tpl,
      id: `tpl-clone-${Date.now()}`,
      jobTitle: `${tpl.jobTitle} (Copy)`,
      lastUpdated: new Date().toISOString(),
    };
    setTemplates((prev) => [...prev, clone]);
    showToast(`The template '${tpl.jobTitle}' has been cloned.`);
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setTemplates((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    showToast(`Template '${deleteTarget.jobTitle}' has been deleted.`);
    setDeleteTarget(null);
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 w-56 transition"
            />
          </div>
          <button className="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors">
            <SlidersHorizontal size={16} />
          </button>
        </div>
        <Link
          href="/flows/create-manage-jobs/templates/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Add New Job Template
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Job Title
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Level
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Skills Configured
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Last Updated
              </th>
              <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16 text-gray-400 text-sm">
                  No templates found.
                </td>
              </tr>
            ) : (
              filtered.map((tpl) => (
                <tr key={tpl.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <Link
                      href={`/flows/create-manage-jobs/templates/${tpl.id}`}
                      className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {tpl.jobTitle}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center rounded-full bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-0.5 text-xs font-medium">
                      {tpl.level}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{tpl.skillsConfigured} skills</td>
                  <td className="px-5 py-4 text-gray-500">{formatDateTime(tpl.lastUpdated)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/flows/create-manage-jobs/templates/${tpl.id}`}
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        onClick={() => handleDuplicate(tpl)}
                        className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                        title="Duplicate"
                      >
                        <Copy size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(tpl)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}

      {/* Confirm delete modal */}
      {deleteTarget && (
        <ConfirmDeleteModal
          title="Delete Template"
          body="Are you sure you want to delete this template? This cannot be undone."
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type MainTab = "programs" | "templates";

export default function CreateManageJobsPage() {
  const [activeTab, setActiveTab] = useState<MainTab>("programs");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-4">
          <Link href="/" className="hover:text-gray-600 transition-colors">
            Home
          </Link>
          <ChevronRight size={14} />
          <span className="text-gray-600 font-medium">Jobs Management</span>
        </nav>

        {/* Page header */}
        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Jobs Management</h1>
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Learn more about Jobs Management"
          >
            <HelpCircle size={18} />
          </button>
        </div>

        {/* Main tabs */}
        <div className="flex items-center gap-0 border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab("programs")}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "programs"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Recruitment Programs
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "templates"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Jobs Template
          </button>
        </div>

        {/* Tab content */}
        {activeTab === "programs" ? <RecruitmentProgramsTab /> : <JobTemplatesTab />}
      </div>
    </div>
  );
}
