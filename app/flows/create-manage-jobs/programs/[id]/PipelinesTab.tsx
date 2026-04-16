"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  Filter,
  LayoutGrid,
  Columns,
  Plus,
  MoreVertical,
  X,
  ChevronRight,
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  Trash2,
  User,
} from "lucide-react";
import {
  PIPELINE_STAGES,
  candidates as allCandidates,
  type Candidate,
  type PipelineStage,
} from "@/shared/fixtures/candidates";
import { masterSkills } from "@/shared/fixtures/skills";
import { Modal, Button } from "@/shared/ui";

// ── Helpers ──────────────────────────────────────────────────────────────────

function matchColor(pct: number): string {
  if (pct >= 80) return "bg-green-500";
  if (pct >= 60) return "bg-yellow-400";
  return "bg-red-500";
}

function matchTextColor(pct: number): string {
  if (pct >= 80) return "text-green-700";
  if (pct >= 60) return "text-yellow-700";
  return "text-red-700";
}

function statusBadge(status: Candidate["status"]) {
  const map: Record<Candidate["status"], { label: string; cls: string }> = {
    "on-going": { label: "On-going", cls: "bg-amber-100 text-amber-700" },
    passed: { label: "Passed", cls: "bg-green-100 text-green-700" },
    failed: { label: "Failed", cls: "bg-red-100 text-red-700" },
    withdrawn: { label: "Withdrawn", cls: "bg-gray-100 text-gray-600" },
  };
  const { label, cls } = map[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

function groupBadge(label: Candidate["groupLabel"]) {
  if (!label) return null;
  const map: Record<NonNullable<Exclude<Candidate["groupLabel"], "">>, { text: string; cls: string }> = {
    "high-priority": { text: "High-priority", cls: "bg-green-100 text-green-700" },
    "mid-priority": { text: "Mid-priority", cls: "bg-yellow-100 text-yellow-700" },
    "low-priority": { text: "Low-priority", cls: "bg-red-100 text-red-700" },
  };
  const entry = map[label as "high-priority" | "mid-priority" | "low-priority"];
  if (!entry) return null;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${entry.cls}`}>
      {entry.text}
    </span>
  );
}

function stageName(stageId: string): string {
  return PIPELINE_STAGES.find((s) => s.id === stageId)?.name ?? stageId;
}

function stepName(stageId: string, stepId: string): string {
  const stage = PIPELINE_STAGES.find((s) => s.id === stageId);
  return stage?.steps.find((st) => st.id === stepId)?.name ?? stepId;
}

function stepDescription(stageId: string, stepId: string): string {
  const stage = PIPELINE_STAGES.find((s) => s.id === stageId);
  return stage?.steps.find((st) => st.id === stepId)?.description ?? "";
}

// ── Reviewer avatars ──────────────────────────────────────────────────────────

function ReviewerAvatars({ reviewers }: { reviewers: Candidate["reviewers"] }) {
  const max = 2;
  const shown = reviewers.slice(0, max);
  const extra = reviewers.length - max;
  return (
    <div className="flex items-center -space-x-2">
      {shown.map((r) => (
        <div
          key={r.id}
          title={r.name}
          className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white ${r.color}`}
        >
          {r.initials}
        </div>
      ))}
      {extra > 0 && (
        <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-[10px] font-bold text-gray-600">
          +{extra}
        </div>
      )}
    </div>
  );
}

// ── Row action dropdown ───────────────────────────────────────────────────────

interface RowMenuProps {
  candidateId: string;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onDelete: () => void;
  onMoveTo: () => void;
  onChangeStatus: () => void;
  onView: () => void;
}

function RowMenu({ open, onToggle, onClose, onDelete, onMoveTo, onChangeStatus, onView }: RowMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={onToggle}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-30 w-52 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
          <button
            onClick={() => { onClose(); onView(); }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            View Candidate Details
          </button>
          <button
            onClick={() => { onClose(); onMoveTo(); }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Move to [...]
          </button>
          <button
            onClick={() => { onClose(); onChangeStatus(); }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Change status
          </button>
          <button
            onClick={() => { onClose(); }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Download CV
          </button>
          <div className="my-1 border-t border-gray-100" />
          <button
            onClick={() => { onClose(); onDelete(); }}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ── Move-to modal ─────────────────────────────────────────────────────────────

interface MoveModalState {
  candidateId: string;
  stageId: string;
  stepId: string;
}

function MoveToModal({
  state,
  onClose,
  onConfirm,
}: {
  state: MoveModalState | null;
  onClose: () => void;
  onConfirm: (candidateId: string, stageId: string, stepId: string) => void;
}) {
  const [selectedStage, setSelectedStage] = useState<string>(state?.stageId ?? "");
  const [selectedStep, setSelectedStep] = useState<string>(state?.stepId ?? "");

  useEffect(() => {
    if (state) {
      setSelectedStage(state.stageId);
      setSelectedStep(state.stepId);
    }
  }, [state]);

  const currentStageObj = PIPELINE_STAGES.find((s) => s.id === selectedStage);

  function handleStageChange(stageId: string) {
    setSelectedStage(stageId);
    const stage = PIPELINE_STAGES.find((s) => s.id === stageId);
    setSelectedStep(stage?.steps[0]?.id ?? "");
  }

  return (
    <Modal
      open={!!state}
      onClose={onClose}
      title="Move Candidate To"
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (state) onConfirm(state.candidateId, selectedStage, selectedStep);
            }}
          >
            Confirm
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Stage</label>
          <select
            value={selectedStage}
            onChange={(e) => handleStageChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            {PIPELINE_STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Step</label>
          <select
            value={selectedStep}
            onChange={(e) => setSelectedStep(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            {currentStageObj?.steps.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  );
}

// ── Toast (local, since PipelinesTab may not be inside ToastProvider) ─────────

interface LocalToast {
  id: string;
  type: "success" | "error";
  message: string;
}

function LocalToastContainer({ toasts, onRemove }: { toasts: LocalToast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg ${
            t.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <span className="text-sm font-medium">{t.message}</span>
          <button onClick={() => onRemove(t.id)} className="ml-2 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

function useLocalToast() {
  const [toasts, setToasts] = useState<LocalToast[]>([]);

  function showToast(type: "success" | "error", message: string) {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }

  function removeToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return { toasts, showToast, removeToast };
}

// ── Stage chevron nav ─────────────────────────────────────────────────────────

function stageCount(candidates: Candidate[], stageId: string): number {
  return candidates.filter((c) => c.stageId === stageId).length;
}

// ── Grid view ─────────────────────────────────────────────────────────────────

function GridView({
  candidates,
  openMenuId,
  setOpenMenuId,
  onDelete,
  onMoveTo,
}: {
  candidates: Candidate[];
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  onDelete: (id: string) => void;
  onMoveTo: (candidate: Candidate) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-100 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-10 px-4 py-3">
              <input type="checkbox" className="rounded border-gray-300" />
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Name &amp; Contact
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Matched Kw
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Group Label
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Booked Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Test Result
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Stage – Step
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Reviewers
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {candidates.length === 0 ? (
            <tr>
              <td colSpan={10} className="px-4 py-12 text-center text-sm text-gray-400">
                No candidates found.
              </td>
            </tr>
          ) : (
            candidates.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                {/* Checkbox */}
                <td className="px-4 py-3">
                  <input type="checkbox" className="rounded border-gray-300" />
                </td>

                {/* Name & Contact */}
                <td className="px-4 py-3">
                  <p className="font-semibold text-blue-700 hover:underline cursor-pointer leading-tight">
                    {c.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{c.email}</p>
                </td>

                {/* Status */}
                <td className="px-4 py-3">{statusBadge(c.status)}</td>

                {/* Matched Kw */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${matchColor(c.matchedKeywords)}`} />
                    <span className={`font-medium ${matchTextColor(c.matchedKeywords)}`}>
                      {c.matchedKeywords}%
                    </span>
                  </div>
                </td>

                {/* Group Label */}
                <td className="px-4 py-3">{groupBadge(c.groupLabel) ?? <span className="text-gray-300">—</span>}</td>

                {/* Booked Date */}
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {c.bookedDate ?? <span className="text-gray-300">—</span>}
                </td>

                {/* Test Result */}
                <td className="px-4 py-3 text-gray-600">
                  {c.testResult ?? <span className="text-gray-300">—</span>}
                </td>

                {/* Stage – Step */}
                <td className="px-4 py-3">
                  <div className="group relative inline-block">
                    <p className="text-xs font-semibold text-gray-800 leading-tight">
                      {stageName(c.stageId)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{stepName(c.stageId, c.stepId)}</p>
                    {/* Tooltip */}
                    <div className="pointer-events-none absolute bottom-full left-0 z-20 mb-1.5 hidden w-56 rounded-lg border border-gray-200 bg-white p-2.5 shadow-lg group-hover:block">
                      <p className="text-xs text-gray-600">{stepDescription(c.stageId, c.stepId)}</p>
                    </div>
                  </div>
                </td>

                {/* Reviewers */}
                <td className="px-4 py-3">
                  <ReviewerAvatars reviewers={c.reviewers} />
                </td>

                {/* Action */}
                <td className="px-4 py-3">
                  <RowMenu
                    candidateId={c.id}
                    open={openMenuId === c.id}
                    onToggle={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}
                    onClose={() => setOpenMenuId(null)}
                    onDelete={() => onDelete(c.id)}
                    onMoveTo={() => onMoveTo(c)}
                    onChangeStatus={() => {}}
                    onView={() => {}}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── Kanban view ───────────────────────────────────────────────────────────────

function KanbanCard({
  c,
  onDragStart,
}: {
  c: Candidate;
  onDragStart: (e: React.DragEvent, candidateId: string) => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, c.id)}
      className="cursor-grab active:cursor-grabbing rounded-lg border border-gray-200 bg-white p-3 shadow-sm space-y-2 hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div>
        <p className="text-sm font-semibold text-gray-900 leading-tight">{c.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{c.email}</p>
      </div>
      <div className="border-t border-gray-100" />
      {/* Fields with labels */}
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 font-medium">Status</span>
          {statusBadge(c.status)}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400 font-medium">Match</span>
          <div className="flex items-center gap-1">
            <span className={`h-2 w-2 rounded-full ${matchColor(c.matchedKeywords)}`} />
            <span className={`font-semibold ${matchTextColor(c.matchedKeywords)}`}>
              {c.matchedKeywords}%
            </span>
          </div>
        </div>
        {c.groupLabel && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400 font-medium">Group</span>
            {groupBadge(c.groupLabel)}
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-gray-400 font-medium">Booked</span>
          <span className="text-gray-600">{c.bookedDate ?? "—"}</span>
        </div>
        {c.testResult && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400 font-medium">Test</span>
            <span className="text-gray-600">{c.testResult}</span>
          </div>
        )}
        {c.reviewers.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400 font-medium">Reviewers</span>
            <ReviewerAvatars reviewers={c.reviewers} />
          </div>
        )}
      </div>
    </div>
  );
}

function KanbanView({
  candidates,
  selectedStageId,
  onMove,
}: {
  candidates: Candidate[];
  selectedStageId: string | null;
  onMove: (candidateId: string, stageId: string, stepId: string) => void;
}) {
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const stagesToShow: PipelineStage[] =
    selectedStageId
      ? PIPELINE_STAGES.filter((s) => s.id === selectedStageId)
      : PIPELINE_STAGES;

  const columns = stagesToShow.flatMap((stage) =>
    stage.steps.map((step) => ({
      key: `${stage.id}::${step.id}`,
      stageId: stage.id,
      stageName: stage.name,
      stepId: step.id,
      stepName: step.name,
      cards: candidates.filter((c) => c.stageId === stage.id && c.stepId === step.id),
    }))
  );

  function handleDragStart(e: React.DragEvent, candidateId: string) {
    e.dataTransfer.setData("candidateId", candidateId);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent, colKey: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCol(colKey);
  }

  function handleDrop(e: React.DragEvent, stageId: string, stepId: string, colKey: string) {
    e.preventDefault();
    const candidateId = e.dataTransfer.getData("candidateId");
    if (candidateId) onMove(candidateId, stageId, stepId);
    setDragOverCol(null);
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-3" style={{ minWidth: `${columns.length * 240}px` }}>
        {columns.map((col) => (
          <div
            key={col.key}
            className="flex w-56 shrink-0 flex-col"
            onDragOver={(e) => handleDragOver(e, col.key)}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={(e) => handleDrop(e, col.stageId, col.stepId, col.key)}
          >
            {/* Column header */}
            <div className="flex items-center justify-between rounded-t-lg border border-b-0 border-gray-200 bg-gray-50 px-3 py-2">
              <div>
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">{col.stageName}</p>
                <p className="text-xs font-semibold text-gray-700 truncate leading-tight">{col.stepName}</p>
              </div>
              <span className="ml-1 shrink-0 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
                {col.cards.length}
              </span>
            </div>
            {/* Cards drop zone */}
            <div
              className={`flex flex-col gap-2 rounded-b-lg border border-t-0 p-2 min-h-[120px] transition-colors ${
                dragOverCol === col.key
                  ? "border-blue-300 bg-blue-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              {col.cards.length === 0 ? (
                <p className="py-6 text-center text-xs text-gray-400">No candidates</p>
              ) : (
                col.cards.map((c) => (
                  <KanbanCard key={c.id} c={c} onDragStart={handleDragStart} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Add Candidate Modal ───────────────────────────────────────────────────────

const SOURCES = ["LinkedIn", "Facebook", "TikTok", "Gmail", "Referral", "Direct", "Other"] as const;
type Source = typeof SOURCES[number];

// Simulated AI-extracted candidates for bulk upload cycling
const AI_PARSED_SAMPLES = [
  { name: "Nguyen Van An", email: "vanan.nguyen@example.com", phone: "0901 234 567" },
  { name: "Tran Thi Lan", email: "lantran.hr@gmail.com", phone: "0912 345 678" },
  { name: "Le Duc Minh", email: "minh.leduc@outlook.com", phone: "0923 456 789" },
];

interface BulkFile {
  id: string;
  name: string;
  size: number;
  status: "pending" | "parsing" | "done" | "error";
}

interface AddCandidateModalProps {
  mode: "single" | "bulk" | null;
  onClose: () => void;
  onAdd: (candidate: Omit<Candidate, "id" | "programId">) => void;
  existingEmails: string[];
}

// Skill types for the candidate form
interface CandidateSkill {
  key: string; // unique key
  name: string;
  type: "system" | "custom"; // system = from master library (purple), custom = user-typed
  systemId?: string;
}

function AddCandidateModal({ mode, onClose, onAdd, existingEmails }: AddCandidateModalProps) {
  const open = mode !== null;

  // ── Single state ──
  const [cvState, setCvState] = useState<"idle" | "parsing" | "done">("idle");
  const [cvFileName, setCvFileName] = useState<string | null>(null);
  const [cvDragOver, setCvDragOver] = useState(false);
  const cvInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState<Source>("LinkedIn");
  const [emailError, setEmailError] = useState<string | null>(null);

  // Skills state
  const [addedSkills, setAddedSkills] = useState<CandidateSkill[]>([]);
  const [skillSearch, setSkillSearch] = useState("");
  const [skillDropdownOpen, setSkillDropdownOpen] = useState(false);
  const skillSearchRef = useRef<HTMLDivElement>(null);
  // Custom skill expand: key of the custom skill chip being expanded
  const [expandedCustomKey, setExpandedCustomKey] = useState<string | null>(null);

  // ── Bulk state ──
  const [bulkFiles, setBulkFiles] = useState<BulkFile[]>([]);
  const [bulkSource, setBulkSource] = useState<Source>("LinkedIn");
  const [bulkDragOver, setBulkDragOver] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const bulkInputRef = useRef<HTMLInputElement>(null);

  // Reset when closed
  useEffect(() => {
    if (!open) {
      setCvState("idle"); setCvFileName(null); setCvDragOver(false);
      setName(""); setEmail(""); setPhone(""); setSource("LinkedIn"); setEmailError(null);
      setAddedSkills([]); setSkillSearch(""); setSkillDropdownOpen(false); setExpandedCustomKey(null);
      setBulkFiles([]); setBulkSource("LinkedIn"); setBulkUploading(false);
    }
  }, [open]);

  // Close skill dropdown on outside click
  useEffect(() => {
    if (!skillDropdownOpen) return;
    function handler(e: MouseEvent) {
      if (skillSearchRef.current && !skillSearchRef.current.contains(e.target as Node)) {
        setSkillDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [skillDropdownOpen]);

  // ── CV ──
  function simulateParsing(fileName: string) {
    setCvFileName(fileName);
    setCvState("parsing");
    const sample = AI_PARSED_SAMPLES[Math.floor(Math.random() * AI_PARSED_SAMPLES.length)];
    // Also extract some skills from master library
    const autoSkills: CandidateSkill[] = masterSkills.slice(0, 3).map((s) => ({
      key: s.id, name: s.name, type: "system", systemId: s.id,
    }));
    setTimeout(() => {
      setName(sample.name);
      setEmail(sample.email);
      setPhone(sample.phone);
      setAddedSkills(autoSkills);
      setCvState("done");
    }, 2000);
  }

  function handleCvDrop(e: React.DragEvent) {
    e.preventDefault(); setCvDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) simulateParsing(file.name);
  }

  function handleCvFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) simulateParsing(file.name);
    e.target.value = "";
  }

  // ── Skills ──
  const alreadyAddedIds = new Set(addedSkills.map((s) => s.systemId).filter(Boolean));

  const skillSuggestions = skillSearch.trim()
    ? masterSkills.filter((s) => {
        if (alreadyAddedIds.has(s.id)) return false;
        const q = skillSearch.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.synonyms.some((syn) => syn.toLowerCase().includes(q))
        );
      }).slice(0, 6)
    : [];

  function addSystemSkill(skill: typeof masterSkills[0]) {
    if (alreadyAddedIds.has(skill.id)) return;
    setAddedSkills((prev) => [...prev, { key: skill.id, name: skill.name, type: "system", systemId: skill.id }]);
    setSkillSearch("");
    setSkillDropdownOpen(false);
  }

  function addCustomSkill() {
    const s = skillSearch.trim();
    if (!s) return;
    // If it exactly matches a system skill name, add as system
    const exact = masterSkills.find((m) => m.name.toLowerCase() === s.toLowerCase());
    if (exact && !alreadyAddedIds.has(exact.id)) {
      addSystemSkill(exact);
      return;
    }
    const key = `custom-${Date.now()}`;
    setAddedSkills((prev) => [...prev, { key, name: s, type: "custom" }]);
    setSkillSearch("");
    setSkillDropdownOpen(false);
  }

  function removeSkill(key: string) {
    setAddedSkills((prev) => prev.filter((s) => s.key !== key));
    if (expandedCustomKey === key) setExpandedCustomKey(null);
  }

  // Fuzzy similar system skills for a custom chip
  function getSimilarSystemSkills(customName: string) {
    const q = customName.toLowerCase();
    return masterSkills
      .filter((s) => {
        if (alreadyAddedIds.has(s.id)) return false;
        return (
          s.name.toLowerCase().includes(q) ||
          q.includes(s.name.toLowerCase()) ||
          s.synonyms.some((syn) => syn.toLowerCase().includes(q) || q.includes(syn.toLowerCase()))
        );
      })
      .slice(0, 4);
  }

  function replaceCustomWithSystem(customKey: string, systemSkill: typeof masterSkills[0]) {
    setAddedSkills((prev) =>
      prev.map((s) =>
        s.key === customKey
          ? { key: systemSkill.id, name: systemSkill.name, type: "system", systemId: systemSkill.id }
          : s
      )
    );
    setExpandedCustomKey(null);
  }

  // ── Save ──
  function handleSave() {
    setEmailError(null);
    if (!name.trim() || !email.trim()) return;
    if (existingEmails.includes(email.trim().toLowerCase())) {
      setEmailError("A candidate with this email already exists in the pipeline.");
      return;
    }
    onAdd({
      name: name.trim(), email: email.trim(),
      status: "on-going", matchedKeywords: 0, groupLabel: "",
      bookedDate: null, testResult: null,
      stageId: "cv-review", stepId: "preliminary-cv-review",
      reviewers: [], note: `Source: ${source}`,
    });
  }

  // ── Bulk ──
  function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function addBulkFiles(fileList: FileList) {
    const toAdd = Array.from(fileList).slice(0, 50 - bulkFiles.length).map((f) => ({
      id: `${Date.now()}-${Math.random()}`, name: f.name, size: f.size, status: "pending" as const,
    }));
    setBulkFiles((prev) => [...prev, ...toAdd]);
  }

  function handleBulkDrop(e: React.DragEvent) {
    e.preventDefault(); setBulkDragOver(false); addBulkFiles(e.dataTransfer.files);
  }

  function handleBulkFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) addBulkFiles(e.target.files);
  }

  function removeBulkFile(id: string) {
    setBulkFiles((prev) => prev.filter((f) => f.id !== id));
  }

  function handleBulkUpload() {
    if (bulkFiles.length === 0) return;
    setBulkUploading(true);
    bulkFiles.forEach((f, i) => {
      setTimeout(() => {
        setBulkFiles((prev) => prev.map((x) => x.id === f.id ? { ...x, status: "parsing" } : x));
        setTimeout(() => {
          setBulkFiles((prev) => prev.map((x) =>
            x.id === f.id ? { ...x, status: Math.random() > 0.1 ? "done" : "error" } : x
          ));
        }, 1200 + i * 300);
      }, i * 400);
    });
    setTimeout(() => setBulkUploading(false), bulkFiles.length * 700 + 800);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      {/* Click backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className="relative flex h-full flex-col bg-white shadow-2xl"
        style={{ width: "min(860px, 92vw)" }}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            {mode === "single" ? "Add Candidate" : "Bulk Upload CVs"}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Single Candidate: two panels ── */}
        {mode === "single" && (
          <div className="flex min-h-0 flex-1 overflow-hidden">

            {/* ── LEFT: CV upload / preview ── */}
            <div className="flex w-72 shrink-0 flex-col border-r border-gray-100 bg-gray-100">
              {/* idle: full-panel drag-drop zone */}
              {cvState === "idle" && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setCvDragOver(true); }}
                  onDragLeave={() => setCvDragOver(false)}
                  onDrop={handleCvDrop}
                  className={`flex flex-1 flex-col items-center justify-center gap-5 p-8 text-center transition-colors ${
                    cvDragOver ? "bg-purple-50" : ""
                  }`}
                >
                  {/* Icon in circle */}
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                    <Upload size={28} className="text-purple-500" />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">Upload CV to Parse</p>
                    <p className="text-xs leading-relaxed text-gray-500">
                      Drag and drop a PDF or DOCX file here, or click to browse.
                      The AI will automatically extract the candidate's information.
                    </p>
                  </div>

                  <button
                    onClick={() => cvInputRef.current?.click()}
                    className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
                  >
                    Browse Files
                  </button>

                  <input ref={cvInputRef} type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={handleCvFileChange} />
                </div>
              )}

              {/* parsing: spinner */}
              {cvState === "parsing" && (
                <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                    <Loader2 size={28} className="animate-spin text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">AI Parsing CV…</p>
                    <p className="mt-1 truncate text-xs text-gray-400 max-w-[200px]">{cvFileName}</p>
                  </div>
                </div>
              )}

              {/* done: filename header + simulated CV preview */}
              {cvState === "done" && (
                <div className="flex flex-1 flex-col overflow-hidden">
                  {/* File header */}
                  <div className="flex shrink-0 items-center gap-2 border-b border-gray-100 bg-gray-50 px-3 py-2.5">
                    <FileText size={14} className="shrink-0 text-gray-400" />
                    <p className="flex-1 truncate text-xs font-medium text-gray-700">{cvFileName}</p>
                    <button
                      onClick={() => { setCvState("idle"); setCvFileName(null); setName(""); setEmail(""); setPhone(""); setAddedSkills([]); }}
                      className="shrink-0 text-xs text-gray-400 underline hover:text-gray-600"
                    >
                      Replace
                    </button>
                  </div>
                  {/* Simulated CV content */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {/* Name block */}
                    <div className="h-5 w-3/4 rounded bg-gray-800" />
                    {/* Contact info */}
                    <div className="space-y-1.5">
                      <div className="h-3 w-full rounded bg-gray-200" />
                      <div className="h-3 w-4/5 rounded bg-gray-200" />
                    </div>
                    {/* Section divider */}
                    <div className="border-t border-gray-100 pt-2">
                      <div className="mb-1.5 h-3.5 w-1/3 rounded bg-gray-700" />
                      <div className="space-y-1">
                        <div className="h-2.5 w-full rounded bg-gray-200" />
                        <div className="h-2.5 w-5/6 rounded bg-gray-200" />
                        <div className="h-2.5 w-4/5 rounded bg-gray-200" />
                        <div className="h-2.5 w-full rounded bg-gray-200" />
                      </div>
                    </div>
                    {/* Experience */}
                    <div className="border-t border-gray-100 pt-2">
                      <div className="mb-1.5 h-3.5 w-1/4 rounded bg-gray-700" />
                      <div className="mb-1 h-3 w-1/2 rounded bg-gray-400" />
                      <div className="space-y-1">
                        <div className="h-2.5 w-full rounded bg-gray-200" />
                        <div className="h-2.5 w-5/6 rounded bg-gray-200" />
                        <div className="h-2.5 w-3/4 rounded bg-gray-200" />
                      </div>
                    </div>
                    {/* Skills */}
                    <div className="border-t border-gray-100 pt-2">
                      <div className="mb-2 h-3.5 w-1/4 rounded bg-gray-700" />
                      <div className="flex flex-wrap gap-1.5">
                        {["ReactJS", "TypeScript", "Node.js"].map((s) => (
                          <div key={s} className="h-5 rounded-full bg-gray-200 px-3 text-[10px] leading-5 text-gray-500">{s}</div>
                        ))}
                      </div>
                    </div>
                    {/* Education */}
                    <div className="border-t border-gray-100 pt-2">
                      <div className="mb-1.5 h-3.5 w-1/3 rounded bg-gray-700" />
                      <div className="space-y-1">
                        <div className="h-2.5 w-full rounded bg-gray-200" />
                        <div className="h-2.5 w-2/3 rounded bg-gray-200" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT: form ── */}
            <div className="flex flex-1 flex-col overflow-y-auto p-6 gap-6">

              {/* Section 1: General Information */}
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">1. General Information</p>

                {/* Full Name */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Nguyen Van An"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
                    placeholder="e.g. vanan@example.com"
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
                      emailError ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-blue-400"
                    }`}
                  />
                  {emailError && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                      <X size={11} /> {emailError}
                    </p>
                  )}
                </div>

                {/* Phone + Source side by side */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Phone</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0901 234 567"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Source</label>
                    <select
                      value={source}
                      onChange={(e) => setSource(e.target.value as Source)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                    >
                      {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Skills Extraction */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">2. Skills Extraction</p>
                  {addedSkills.length > 0 && (
                    <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                      {addedSkills.length} skill{addedSkills.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {/* Search input with dropdown */}
                <div className="relative" ref={skillSearchRef}>
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    value={skillSearch}
                    onChange={(e) => { setSkillSearch(e.target.value); setSkillDropdownOpen(true); }}
                    onFocus={() => setSkillDropdownOpen(true)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); addCustomSkill(); }
                      if (e.key === "Escape") setSkillDropdownOpen(false);
                    }}
                    placeholder="Search and add skills from Master Library…"
                    className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-purple-400 focus:outline-none"
                  />

                  {/* Suggestions dropdown */}
                  {skillDropdownOpen && skillSearch.trim() && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
                      {skillSuggestions.length > 0 ? (
                        <>
                          <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                            From Master Library
                          </p>
                          {skillSuggestions.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => addSystemSkill(s)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-purple-50 transition-colors"
                            >
                              <span className="flex-1 text-sm text-gray-800">{s.name}</span>
                              <span className="text-xs text-gray-400">{s.category}</span>
                            </button>
                          ))}
                          <div className="my-1 border-t border-gray-100" />
                        </>
                      ) : null}
                      {/* Add as new custom skill */}
                      <button
                        onClick={addCustomSkill}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                      >
                        <Plus size={13} className="shrink-0 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Add <span className="font-medium text-gray-900">"{skillSearch}"</span> as new skill
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Skill chips */}
                {addedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {addedSkills.map((skill) => (
                      <div key={skill.key} className="relative">
                        {/* System skill chip: purple */}
                        {skill.type === "system" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-3 py-1 text-xs font-medium text-white">
                            {skill.name}
                            <button
                              onClick={() => removeSkill(skill.key)}
                              className="text-purple-200 hover:text-white transition-colors"
                            >
                              <X size={10} />
                            </button>
                          </span>
                        ) : (
                          /* Custom skill chip: gray outlined, clickable to expand replace options */
                          <div>
                            <button
                              onClick={() => setExpandedCustomKey(expandedCustomKey === skill.key ? null : skill.key)}
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                expandedCustomKey === skill.key
                                  ? "border-amber-400 bg-amber-50 text-amber-800"
                                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                              }`}
                            >
                              {skill.name}
                              <ChevronRight
                                size={10}
                                className={`transition-transform ${expandedCustomKey === skill.key ? "rotate-90" : "rotate-0"}`}
                              />
                            </button>

                            {/* Replace dropdown for custom skill */}
                            {expandedCustomKey === skill.key && (
                              <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-xl border border-gray-100 bg-white py-1.5 shadow-lg">
                                <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                                  Replace with system skill?
                                </p>
                                {getSimilarSystemSkills(skill.name).length > 0 ? (
                                  getSimilarSystemSkills(skill.name).map((s) => (
                                    <button
                                      key={s.id}
                                      onClick={() => replaceCustomWithSystem(skill.key, s)}
                                      className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-purple-50 transition-colors"
                                    >
                                      <span className="h-2 w-2 shrink-0 rounded-full bg-purple-500" />
                                      <span className="flex-1 text-sm text-gray-800">{s.name}</span>
                                    </button>
                                  ))
                                ) : (
                                  <p className="px-3 py-2 text-xs text-gray-400 italic">No similar skills found</p>
                                )}
                                <div className="my-1 border-t border-gray-100" />
                                <button
                                  onClick={() => removeSkill(skill.key)}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 size={12} /> Remove skill
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {addedSkills.length === 0 && (
                  <p className="text-xs text-gray-400 italic">No skills added yet. Search above or upload a CV to auto-extract.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Bulk Upload ── */}
        {mode === "bulk" && (
          <div className="flex flex-1 flex-col overflow-y-auto p-6 gap-5">
            <div
              onDragOver={(e) => { e.preventDefault(); setBulkDragOver(true); }}
              onDragLeave={() => setBulkDragOver(false)}
              onDrop={handleBulkDrop}
              onClick={() => !bulkUploading && bulkInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-12 text-center transition-colors ${
                bulkDragOver ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/40"
              } ${bulkUploading ? "pointer-events-none opacity-60" : ""}`}
            >
              <Upload size={32} className="text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-600">Drop CVs here or click to browse</p>
                <p className="mt-0.5 text-xs text-gray-400">Upload up to 50 PDF / DOCX files at once</p>
              </div>
              <p className="text-[10px] uppercase tracking-wide text-gray-300">PDF · DOCX · Max 50 files</p>
              <input ref={bulkInputRef} type="file" accept=".pdf,.docx,.doc" multiple className="hidden" onChange={handleBulkFileChange} />
            </div>

            <div className="flex items-center gap-4">
              <label className="shrink-0 text-xs font-medium text-gray-600">Source <span className="text-red-500">*</span></label>
              <select
                value={bulkSource}
                onChange={(e) => setBulkSource(e.target.value as Source)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
              >
                {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className="text-xs text-gray-400">{bulkFiles.length} / 50 files</span>
            </div>

            {bulkFiles.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 max-h-64 overflow-y-auto">
                {bulkFiles.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 px-4 py-3">
                    <FileText size={16} className="shrink-0 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{f.name}</p>
                      <p className="text-xs text-gray-400">{formatFileSize(f.size)}</p>
                    </div>
                    <div className="shrink-0 flex items-center gap-1.5">
                      {f.status === "pending" && <span className="text-xs text-gray-400">Pending</span>}
                      {f.status === "parsing" && <span className="flex items-center gap-1 text-xs text-blue-600"><Loader2 size={12} className="animate-spin" /> AI Extracting…</span>}
                      {f.status === "done" && <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle2 size={12} /> Done</span>}
                      {f.status === "error" && <span className="flex items-center gap-1 text-xs text-red-600"><X size={12} /> Error</span>}
                    </div>
                    {!bulkUploading && f.status === "pending" && (
                      <button onClick={() => removeBulkFile(f.id)} className="shrink-0 text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button onClick={onClose} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          {mode === "single" ? (
            <button
              onClick={handleSave}
              disabled={!name.trim() || !email.trim() || cvState === "parsing"}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save Candidate
            </button>
          ) : (
            <button
              onClick={handleBulkUpload}
              disabled={bulkFiles.length === 0 || bulkUploading || bulkFiles.every((f) => f.status !== "pending")}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {bulkUploading && <Loader2 size={14} className="animate-spin" />}
              Upload & Extract
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main PipelinesTab component ───────────────────────────────────────────────

export function PipelinesTab({ programId }: { programId: string }) {
  const [view, setView] = useState<"grid" | "kanban">("grid");
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [localCandidates, setLocalCandidates] = useState<Candidate[]>(
    allCandidates.filter((c) => c.programId === programId)
  );
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [moveModal, setMoveModal] = useState<MoveModalState | null>(null);
  const [addMode, setAddMode] = useState<"single" | "bulk" | null>(null);
  const [addDropdownOpen, setAddDropdownOpen] = useState(false);
  const addDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!addDropdownOpen) return;
    function handler(e: MouseEvent) {
      if (addDropdownRef.current && !addDropdownRef.current.contains(e.target as Node)) {
        setAddDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [addDropdownOpen]);

  const { toasts, showToast, removeToast } = useLocalToast();

  // Filter candidates by stage + search
  const filtered = localCandidates.filter((c) => {
    const matchesStage = selectedStageId ? c.stageId === selectedStageId : true;
    const q = search.toLowerCase();
    const matchesSearch =
      !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    return matchesStage && matchesSearch;
  });

  function handleDelete(id: string) {
    setLocalCandidates((prev) => prev.filter((c) => c.id !== id));
    showToast("success", "Candidate removed.");
  }

  function handleMoveTo(candidate: Candidate) {
    setMoveModal({ candidateId: candidate.id, stageId: candidate.stageId, stepId: candidate.stepId });
  }

  function handleAddCandidate(partial: Omit<Candidate, "id" | "programId">) {
    const newCand: Candidate = {
      id: `cand-${Date.now()}`,
      programId,
      ...partial,
    };
    setLocalCandidates((prev) => [newCand, ...prev]);
    setAddMode(null);
    showToast("success", "The candidate's profile has been moved to the Pipeline.");
  }

  function handleMoveConfirm(candidateId: string, stageId: string, stepId: string) {
    setLocalCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, stageId, stepId } : c))
    );
    setMoveModal(null);
    showToast("success", `Candidate moved to ${stageName(stageId)} — ${stepName(stageId, stepId)}.`);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Stage chevron nav ── */}
      <div className="flex w-full items-stretch gap-0">
        {/* All Stages pill */}
        <button
          onClick={() => setSelectedStageId(null)}
          className={`shrink-0 rounded-l-lg px-5 py-3 text-sm font-semibold transition-colors ${
            selectedStageId === null
              ? "bg-purple-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All Stages
        </button>

        {/* Divider */}
        <div className="w-px shrink-0 bg-gray-300" />

        {/* Stage chevrons — flex-1 so they fill remaining width */}
        <div className="flex flex-1 items-stretch">
          {PIPELINE_STAGES.map((stage, idx) => {
            const count = stageCount(localCandidates, stage.id);
            const isActive = selectedStageId === stage.id;
            const isLast = idx === PIPELINE_STAGES.length - 1;

            return (
              <button
                key={stage.id}
                onClick={() => setSelectedStageId(stage.id)}
                style={
                  !isLast
                    ? {
                        clipPath:
                          "polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%, 16px 50%)",
                      }
                    : idx === 0
                    ? {}
                    : {
                        clipPath:
                          "polygon(0 0, 100% 0, 100% 100%, 0 100%, 16px 50%)",
                      }
                }
                className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  isActive ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } ${idx > 0 ? "-ml-4" : ""}`}
              >
                {stage.name}
                <span
                  className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold ${
                    isActive ? "bg-white/25 text-white" : "bg-white text-gray-600 border border-gray-200"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-2">
        {/* Row 1: search + filter | view toggle + add button */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email..."
              className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Filter icon button */}
          <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition-colors">
            <Filter size={15} />
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-gray-200 bg-gray-100 p-1">
            <button
              onClick={() => setView("grid")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                view === "grid" ? "bg-white shadow text-gray-800" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <LayoutGrid size={14} />
              Grid
            </button>
            <button
              onClick={() => setView("kanban")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                view === "kanban" ? "bg-white shadow text-gray-800" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Columns size={14} />
              Kanban
            </button>
          </div>

          {/* Add candidate dropdown */}
          <div className="relative" ref={addDropdownRef}>
            <button
              onClick={() => setAddDropdownOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <Plus size={15} />
              Add New Candidate
              <ChevronRight
                size={14}
                className={`transition-transform ${addDropdownOpen ? "rotate-90" : "rotate-0"}`}
              />
            </button>
            {addDropdownOpen && (
              <div className="absolute right-0 top-full z-30 mt-1.5 w-52 rounded-xl border border-gray-100 bg-white py-1.5 shadow-lg">
                <button
                  onClick={() => { setAddMode("single"); setAddDropdownOpen(false); }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User size={15} className="shrink-0 text-gray-400" />
                  <div>
                    <p className="font-medium">Single Candidate</p>
                    <p className="text-xs text-gray-400">Upload CV or fill manually</p>
                  </div>
                </button>
                <button
                  onClick={() => { setAddMode("bulk"); setAddDropdownOpen(false); }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Upload size={15} className="shrink-0 text-gray-400" />
                  <div>
                    <p className="font-medium">Bulk Upload CVs</p>
                    <p className="text-xs text-gray-400">Up to 50 files at once</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: active filter chips */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600">
            Review: On-going
            <button className="ml-0.5 text-gray-400 hover:text-gray-600">
              <X size={11} />
            </button>
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      {view === "grid" ? (
        <GridView
          candidates={filtered}
          openMenuId={openMenuId}
          setOpenMenuId={setOpenMenuId}
          onDelete={handleDelete}
          onMoveTo={handleMoveTo}
        />
      ) : (
        <KanbanView
          candidates={filtered}
          selectedStageId={selectedStageId}
          onMove={(candidateId, stageId, stepId) => {
            setLocalCandidates((prev) =>
              prev.map((c) => (c.id === candidateId ? { ...c, stageId, stepId } : c))
            );
            showToast("success", `Moved to ${stageName(stageId)} — ${stepName(stageId, stepId)}.`);
          }}
        />
      )}

      {/* ── Add Candidate modal ── */}
      <AddCandidateModal
        mode={addMode}
        onClose={() => setAddMode(null)}
        onAdd={handleAddCandidate}
        existingEmails={localCandidates.map((c) => c.email.toLowerCase())}
      />

      {/* ── Move-to modal ── */}
      <MoveToModal
        state={moveModal}
        onClose={() => setMoveModal(null)}
        onConfirm={handleMoveConfirm}
      />

      {/* ── Local toasts ── */}
      <LocalToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
