"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Mail,
  Plus,
  Search,
  Send,
  Sparkles,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import {
  AppliedFilterChips,
  FilterButton,
  FilterModal,
  countActiveFilters,
  isFieldActive,
  type FilterField,
  type FilterValues,
} from "@/shared/ui/filter";
import { useToast } from "@/shared/ui/toast";
import {
  sendTypeLabel,
  type ProgramEmail,
} from "@/entities/program-email";
import type { Program, WorkflowStage } from "@/entities/program";
import { DeliveryPills, formatSentAt } from "./pieces";
import { ViewEmailModal } from "./ViewEmailModal";
import { NewEmailPage } from "./NewEmailPage";

interface Props {
  program: Program;
}

type View = "log" | "compose";

export function EmailsTab({ program }: Props) {
  const { showToast } = useToast();
  const stages: WorkflowStage[] = program.workflow?.stages ?? [];
  const [emails, setEmails] = useState<ProgramEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("log");
  const [activeStageId, setActiveStageId] = useState<string | "all">("all");
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [viewing, setViewing] = useState<ProgramEmail | null>(null);

  function refresh() {
    setLoading(true);
    return fetch(
      `/api/program-emails?programId=${encodeURIComponent(program.id)}`
    )
      .then((r) => r.json())
      .then((d) => {
        setEmails(d.emails ?? []);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program.id]);

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        id: "sendType",
        label: "Send Type",
        kind: "multi-select",
        options: [
          { value: "single", label: "Single Send" },
          { value: "bulk", label: "Bulk" },
        ],
      },
      {
        id: "receiverType",
        label: "Receiver",
        kind: "multi-select",
        options: [
          { value: "candidates", label: "Candidates" },
          { value: "reviewers", label: "Reviewers" },
        ],
      },
      {
        id: "sentRange",
        label: "Sent Date",
        kind: "date-range",
      },
    ],
    []
  );

  function passesFilters(e: ProgramEmail): boolean {
    for (const f of filterFields) {
      const v = filterValues[f.id];
      if (!isFieldActive(v)) continue;
      if (v?.kind === "multi-select") {
        if (f.id === "sendType" && !v.values.includes(e.sendType)) return false;
        if (f.id === "receiverType" && !v.values.includes(e.receiverType))
          return false;
      }
      if (v?.kind === "date-range") {
        const t = Date.parse(e.sentAtISO);
        if (v.from && t < Date.parse(v.from)) return false;
        if (v.to && t > Date.parse(v.to) + 24 * 3600 * 1000) return false;
      }
    }
    return true;
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return emails.filter((e) => {
      if (activeStageId !== "all" && e.stageId !== activeStageId) return false;
      if (q) {
        const hay =
          `${e.subject} ${e.logName} ${e.fromEmail} ${e.recipients
            .map((r) => `${r.name} ${r.email}`)
            .join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return passesFilters(e);
    });
  }, [emails, activeStageId, search, filterValues]);

  const countByStage = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of emails) {
      const q = search.trim().toLowerCase();
      if (q) {
        const hay =
          `${e.subject} ${e.logName} ${e.fromEmail} ${e.recipients
            .map((r) => `${r.name} ${r.email}`)
            .join(" ")}`.toLowerCase();
        if (!hay.includes(q)) continue;
      }
      if (!passesFilters(e)) continue;
      if (e.stageId) {
        map.set(e.stageId, (map.get(e.stageId) ?? 0) + 1);
      }
    }
    return map;
  }, [emails, search, filterValues]);

  const totalFiltered = filtered.length;

  function clearFilter(id: string) {
    setFilterValues((p) => {
      const n = { ...p };
      delete n[id];
      return n;
    });
  }

  function handleSent(email: ProgramEmail) {
    setEmails((prev) => [email, ...prev]);
    setView("log");
    showToast(
      "success",
      email.scheduledForISO
        ? `Scheduled "${email.subject}" for ${formatSentAt(
            email.scheduledForISO
          )}.`
        : `Email "${email.subject}" sent to ${email.recipients.length} recipient${
            email.recipients.length === 1 ? "" : "s"
          }.`
    );
  }

  /* -------------------- Render -------------------- */

  if (view === "compose") {
    return (
      <NewEmailPage
        program={program}
        onCancel={() => setView("log")}
        onSent={handleSent}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Stage chevron bar */}
      {stages.length > 0 && (
        <StageChevronBar
          stages={stages}
          countByStage={countByStage}
          totalAll={totalFiltered}
          active={activeStageId}
          onChange={setActiveStageId}
        />
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subject, sender, recipient…"
            className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm focus:border-violet-500 focus:outline-none"
          />
        </div>
        <FilterButton
          activeCount={countActiveFilters(filterValues)}
          onClick={() => setFilterOpen(true)}
        />
        <button
          onClick={() => setView("compose")}
          className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          <Plus size={16} />
          Send New Emails
        </button>
      </div>

      {countActiveFilters(filterValues) > 0 && (
        <AppliedFilterChips
          fields={filterFields}
          values={filterValues}
          onRemove={clearFilter}
          onClearAll={() => setFilterValues({})}
        />
      )}

      {/* Body */}
      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-400">
          Loading email history…
        </div>
      ) : emails.length === 0 ? (
        <EmptyState onSend={() => setView("compose")} />
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
          <p className="font-medium text-gray-500">No emails match</p>
          <p className="mt-1 text-sm text-gray-400">
            Try a different stage, clear filters, or broaden the search.
          </p>
        </div>
      ) : (
        <EmailLogTable
          emails={filtered}
          onView={(e) => setViewing(e)}
        />
      )}

      <FilterModal
        open={filterOpen}
        fields={filterFields}
        initialValues={filterValues}
        onApply={(v) => {
          setFilterValues(v);
          setFilterOpen(false);
        }}
        onCancel={() => setFilterOpen(false)}
      />

      {viewing && (
        <ViewEmailModal email={viewing} onClose={() => setViewing(null)} />
      )}
    </div>
  );
}

/* ============================================================
 * Stage chevron bar
 * ============================================================ */

function StageChevronBar({
  stages,
  countByStage,
  totalAll,
  active,
  onChange,
}: {
  stages: WorkflowStage[];
  countByStage: Map<string, number>;
  totalAll: number;
  active: string | "all";
  onChange: (id: string | "all") => void;
}) {
  return (
    <div className="flex items-stretch overflow-x-auto rounded-lg border border-gray-200 bg-white p-1">
      <Chevron
        label="All Stages"
        count={totalAll}
        active={active === "all"}
        onClick={() => onChange("all")}
        first
      />
      {stages.map((s, i) => (
        <Chevron
          key={s.id}
          label={s.name}
          count={countByStage.get(s.id) ?? 0}
          active={active === s.id}
          onClick={() => onChange(s.id)}
          last={i === stages.length - 1}
        />
      ))}
    </div>
  );
}

function Chevron({
  label,
  count,
  active,
  onClick,
  first,
  last,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  first?: boolean;
  last?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex shrink-0 items-center gap-1.5 px-5 py-2 text-xs font-medium transition-colors",
        !first && "pl-7",
        !last && "pr-7",
        active
          ? "bg-violet-600 text-white"
          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
      )}
      style={{ clipPath: chevronClip(first, last) }}
    >
      {label}
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
          active ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
        )}
      >
        ({count})
      </span>
    </button>
  );
}

function chevronClip(first?: boolean, last?: boolean): string {
  const leftIn = first ? "0% 0" : "12px 0";
  const leftOut = first ? "0% 100%" : "12px 100%";
  const rightIn = last ? "100% 100%" : "calc(100% - 12px) 100%";
  const rightOut = last ? "100% 0" : "calc(100% - 12px) 0";
  const arrowOut = last ? "" : ", 100% 50%";
  const arrowIn = first ? "" : ", 0% 50%";
  return `polygon(${leftIn}, ${rightOut}${arrowOut}, ${rightIn}, ${leftOut}${arrowIn})`;
}

/* ============================================================
 * Log table
 * ============================================================ */

function EmailLogTable({
  emails,
  onView,
}: {
  emails: ProgramEmail[];
  onView: (e: ProgramEmail) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          <tr>
            <th className="w-10 p-3">
              <input type="checkbox" disabled className="accent-violet-600" />
            </th>
            <th className="p-3">Name</th>
            <th className="p-3">Receiver</th>
            <th className="p-3">Stage - Step</th>
            <th className="p-3">Type &amp; Sender</th>
            <th className="p-3">Timestamp</th>
            <th className="p-3">Delivery Status</th>
            <th className="p-3">Performance</th>
            <th className="w-20 p-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {emails.map((e) => {
            return (
              <tr
                key={e.id}
                className="cursor-pointer border-t border-gray-100 align-top hover:bg-gray-50/60"
                onClick={() => onView(e)}
              >
                <td className="p-3" onClick={(ev) => ev.stopPropagation()}>
                  <input type="checkbox" className="accent-violet-600" />
                </td>
                <td className="max-w-[240px] p-3">
                  <p className="line-clamp-2 font-medium text-gray-900">
                    {e.subject}
                  </p>
                  {e.logName && e.logName !== e.subject && (
                    <p className="mt-0.5 truncate text-[11px] text-gray-500">
                      {e.logName}
                    </p>
                  )}
                  {e.scheduledForISO && (
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-700">
                      <Sparkles size={10} />
                      Scheduled
                    </span>
                  )}
                </td>
                <td className="p-3 text-xs text-gray-700">
                  {e.receiverType === "reviewers" ? "Reviewers" : "Candidate"}
                </td>
                <td className="p-3 text-xs">
                  {e.stageName && e.stepName ? (
                    <>
                      <p className="font-medium text-gray-800">
                        {e.stageName}
                      </p>
                      <p className="text-gray-500">{e.stepName}</p>
                    </>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="max-w-[240px] p-3 text-xs">
                  <p className="font-medium text-gray-800">
                    {sendTypeLabel(e)}
                  </p>
                  <p className="truncate text-gray-500">{e.fromEmail}</p>
                </td>
                <td className="p-3 text-xs text-gray-700">
                  {formatSentAt(e.sentAtISO)}
                </td>
                <td className="p-3">
                  <DeliveryPills d={e.delivery} />
                </td>
                <td className="p-3 text-[11px]">
                  {Object.keys(e.performance).length === 0 ? (
                    <span className="text-gray-300">—</span>
                  ) : (
                    <div className="space-y-0.5">
                      {e.performance.openRate !== undefined && (
                        <p className="text-gray-700">
                          Open Rate:{" "}
                          <span className="font-semibold">
                            {e.performance.openRate}%
                          </span>
                        </p>
                      )}
                      {e.performance.replyRate !== undefined && (
                        <p className="text-gray-700">
                          Reply Rate:{" "}
                          <span className="font-semibold">
                            {e.performance.replyRate}%
                          </span>
                        </p>
                      )}
                      {e.performance.clickRate !== undefined && (
                        <p className="text-gray-700">
                          Click Rate:{" "}
                          <span className="font-semibold">
                            {e.performance.clickRate}%
                          </span>
                        </p>
                      )}
                    </div>
                  )}
                </td>
                <td className="p-3" onClick={(ev) => ev.stopPropagation()}>
                  <button
                    onClick={() => onView(e)}
                    className="inline-flex items-center gap-1 rounded-md border border-violet-200 bg-white px-2.5 py-1 text-xs font-medium text-violet-700 hover:bg-violet-50"
                  >
                    <Eye size={12} />
                    View
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ============================================================
 * Empty state
 * ============================================================ */

function EmptyState({ onSend }: { onSend: () => void }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-16 text-center">
      <div className="mx-auto mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-violet-100 text-violet-600">
        <Mail size={32} />
      </div>
      <p className="text-base font-semibold text-gray-700">
        The Email log is empty
      </p>
      <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
        A space to manage the entire history of communication in this
        recruitment programme. Manually sent emails or bulk sending campaigns
        will be automatically recorded and diagnosed by the system here.
      </p>
      <button
        onClick={onSend}
        className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
      >
        <Send size={14} />
        Send New Emails
      </button>
    </div>
  );
}
