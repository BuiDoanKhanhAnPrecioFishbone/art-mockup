"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, HelpCircle, Search } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { REVIEWERS } from "@/shared/fixtures/reviewers";
import type { Candidate } from "@/entities/candidate";
import { candidateInitials } from "@/entities/candidate";
import type { Program } from "@/entities/program";
import type { ProgramEmailRecipient } from "@/entities/program-email";
import { ModalShell } from "./pieces";

/* =============================================================
 * Reviewer picker — Step* + Reviewer multi-select
 * ============================================================= */

export function ReviewerPickerModal({
  program,
  initialIds,
  onClose,
  onConfirm,
}: {
  program: Program;
  initialIds: string[];
  onClose: () => void;
  onConfirm: (
    recipients: ProgramEmailRecipient[],
    stage: { stageId?: string; stepId?: string; stageName?: string; stepName?: string }
  ) => void;
}) {
  const stages = program.workflow?.stages ?? [];
  const flatSteps = useMemo(
    () =>
      stages.flatMap((s) =>
        s.steps.map((st) => ({
          id: st.id,
          stepName: st.name,
          stageId: s.id,
          stageName: s.name,
        }))
      ),
    [stages]
  );

  const [stepId, setStepId] = useState(flatSteps[0]?.id ?? "");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initialIds)
  );

  const step = flatSteps.find((s) => s.id === stepId);
  const allReviewers = REVIEWERS;

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function selectAll() {
    setSelectedIds(new Set(allReviewers.map((r) => r.id)));
  }
  function clear() {
    setSelectedIds(new Set());
  }

  function confirm() {
    const recipients: ProgramEmailRecipient[] = allReviewers
      .filter((r) => selectedIds.has(r.id))
      .map((r) => ({
        id: r.id,
        name: r.name,
        // Mock email — real system would resolve from a user account.
        email: `${r.name.split(" ")[0].toLowerCase()}@preciofishbone.com`,
        kind: "reviewers",
      }));
    onConfirm(recipients, {
      stageId: step?.stageId,
      stepId: step?.id,
      stageName: step?.stageName,
      stepName: step?.stepName,
    });
  }

  return (
    <ModalShell
      title="Add Additional Recipients"
      subtitle="Search and select reviewers to include."
      onClose={onClose}
      width="max-w-lg"
      footer={
        <>
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={confirm}
            disabled={selectedIds.size === 0}
            className="rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add {selectedIds.size} Reviewer{selectedIds.size === 1 ? "" : "s"}
          </button>
        </>
      }
    >
      <div className="space-y-4 p-5">
        <Field label="Step" required hint="Filters reviewers by workflow step.">
          <div className="relative">
            <select
              value={stepId}
              onChange={(e) => setStepId(e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-sm"
            >
              {flatSteps.length === 0 && (
                <option value="">No steps configured</option>
              )}
              {flatSteps.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.stageName} · {s.stepName}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </Field>

        <Field label="Reviewer" required>
          <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2 py-1.5">
            {selectedIds.size === 0 ? (
              <span className="text-xs text-gray-400">Please Select</span>
            ) : (
              allReviewers
                .filter((r) => selectedIds.has(r.id))
                .map((r) => (
                  <span
                    key={r.id}
                    className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-medium text-violet-700"
                  >
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[8px] font-semibold text-white">
                      {candidateInitials(r.name)}
                    </span>
                    {r.name}
                  </span>
                ))
            )}
            <span className="ml-auto text-[11px] text-gray-400">
              {selectedIds.size}
            </span>
          </div>
        </Field>

        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <button
            onClick={selectAll}
            className="text-xs font-semibold text-violet-700 hover:text-violet-900"
          >
            Select All
          </button>
          <button
            onClick={clear}
            className="text-xs font-medium text-gray-500 hover:text-gray-800"
          >
            Clear
          </button>
        </div>

        <ul className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-1.5">
          {allReviewers.map((r) => {
            const checked = selectedIds.has(r.id);
            return (
              <li key={r.id}>
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 transition-colors",
                    checked ? "bg-white" : "hover:bg-white"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(r.id)}
                    className="accent-violet-600"
                  />
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-[10px] font-semibold uppercase text-white">
                    {candidateInitials(r.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-gray-900">
                      {r.name}
                    </p>
                    <p className="truncate text-[11px] text-gray-500">
                      {r.role}
                    </p>
                  </div>
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    </ModalShell>
  );
}

/* =============================================================
 * Candidate picker — table of program candidates with multi-select
 * ============================================================= */

export function CandidatePickerModal({
  programId,
  initialIds,
  onClose,
  onConfirm,
}: {
  programId: string;
  initialIds: string[];
  onClose: () => void;
  onConfirm: (recipients: ProgramEmailRecipient[]) => void;
}) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initialIds)
  );

  useEffect(() => {
    fetch(`/api/candidates?programId=${encodeURIComponent(programId)}`)
      .then((r) => r.json())
      .then((d) => {
        setCandidates(d.candidates ?? []);
        setLoading(false);
      });
  }, [programId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return candidates;
    return candidates.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [candidates, search]);

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((c) => selectedIds.has(c.id));

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllVisible() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        for (const c of filtered) next.delete(c.id);
      } else {
        for (const c of filtered) next.add(c.id);
      }
      return next;
    });
  }

  function confirm() {
    const recipients: ProgramEmailRecipient[] = candidates
      .filter((c) => selectedIds.has(c.id))
      .map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        kind: "candidates",
      }));
    onConfirm(recipients);
  }

  return (
    <ModalShell
      title="Add Additional Recipients"
      subtitle="Search and select candidates to include in your current email batch."
      onClose={onClose}
      width="max-w-5xl"
      footer={
        <>
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={confirm}
            disabled={selectedIds.size === 0}
            className="rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add {selectedIds.size} Candidate{selectedIds.size === 1 ? "" : "s"}
          </button>
        </>
      }
    >
      <div className="space-y-3 p-5">
        <div className="relative max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email…"
            className="h-9 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm focus:border-violet-500 focus:outline-none"
          />
        </div>
        {loading ? (
          <p className="py-12 text-center text-xs text-gray-400">
            Loading candidates…
          </p>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-xs text-gray-400">
            No candidates match this search.
          </p>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto rounded-lg border border-gray-100">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="w-10 p-2.5">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleAllVisible}
                      className="accent-violet-600"
                    />
                  </th>
                  <th className="p-2.5">Name &amp; Contact</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Skills</th>
                  <th className="p-2.5">Group</th>
                  <th className="p-2.5">Stage - Step</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const checked = selectedIds.has(c.id);
                  return (
                    <tr
                      key={c.id}
                      className={cn(
                        "border-t border-gray-100 hover:bg-violet-50/40",
                        checked && "bg-violet-50/60"
                      )}
                    >
                      <td className="p-2.5">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(c.id)}
                          className="accent-violet-600"
                        />
                      </td>
                      <td className="p-2.5">
                        <p className="font-medium text-gray-900">{c.name}</p>
                        <p className="text-[11px] text-gray-500">{c.email}</p>
                      </td>
                      <td className="p-2.5 text-xs text-gray-700">
                        {c.status}
                      </td>
                      <td className="p-2.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-xs font-medium",
                            c.skillsMatchPercent >= 80
                              ? "text-green-700"
                              : c.skillsMatchPercent >= 60
                                ? "text-amber-700"
                                : "text-red-700"
                          )}
                        >
                          {c.skillsMatchPercent}%
                        </span>
                      </td>
                      <td className="p-2.5 text-xs text-gray-700">
                        {c.groupLabel ?? "—"}
                      </td>
                      <td className="p-2.5 text-xs">
                        <p className="font-medium text-gray-800">
                          {c.currentStageId || "—"}
                        </p>
                        <p className="text-gray-500">
                          {c.currentStepId || ""}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ModalShell>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500">*</span>}
        {hint && (
          <span title={hint}>
            <HelpCircle size={11} className="text-gray-400" />
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

