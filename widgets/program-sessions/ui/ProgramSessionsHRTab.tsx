"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Copy,
  Plus,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import {
  SESSION_STATUS_TONE,
  type Test,
  type TestSession,
  type SessionType,
} from "@/entities/test";
import type { WorkflowStage, WorkflowStep } from "@/entities/program/model/workflow";

/** Per-session card payload — mirrors ProgramSessionCard from the API. */
interface SessionCard {
  session: TestSession;
  test: Test | null;
  clonedFrom: string;
  counts: {
    submissions: number;
    completedReviews: number;
    underReview: number;
    pending: number;
  };
  reviewProcessPercent: number;
}

interface StepGroup {
  step: WorkflowStep;
  sessions: SessionCard[];
}

interface StageGroup {
  stage: WorkflowStage;
  testStepCount: number;
  sessionCount: number;
  steps: StepGroup[];
}

/** HR variant of the program Sessions tab — wireframe node 3228:203328.
 *
 *  Layout:
 *    1. Stage chevron filter row ("All Stages" + per-stage chevrons,
 *       each with its session count).
 *    2. One collapsible card per stage, header summarising step + session
 *       count.
 *    3. Inside each stage: per-step section with "+ Create Session"
 *       button + a stack of session cards. Each card shows
 *       Composition + Status badges, cloned-from line, period, four
 *       counter columns, and a Review-Process progress bar. */
export function ProgramSessionsHRTab({
  programId,
  canCreate = true,
}: {
  programId: string;
  canCreate?: boolean;
}) {
  const [stages, setStages] = useState<StageGroup[]>([]);
  const [loading, setLoading] = useState(true);
  /** Currently selected stage id — `null` = "All Stages". */
  const [activeStageId, setActiveStageId] = useState<string | null>(null);
  /** Per-stage collapsed state. Default = expanded for the first stage,
   *  collapsed for the rest (matches the wireframe). */
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLoading(true);
    fetch(`/api/programs/${programId}/sessions`)
      .then((r) => r.json())
      .then((d) => {
        // Sessions only ever attach to Test steps, so stages with
        // zero Test steps would render as dead "0 Sessions" chevrons
        // (Inbox / Onsite / Offer / Final Decisions on the sample
        // workflow). Filter them out before they reach the UI.
        const list: StageGroup[] = (d.stages ?? []).filter(
          (g: StageGroup) => g.testStepCount > 0
        );
        setStages(list);
        // First stage open by default; the rest collapsed.
        const next: Record<string, boolean> = {};
        list.forEach((g, i) => {
          next[g.stage.id] = i !== 0;
        });
        setCollapsed(next);
      })
      .finally(() => setLoading(false));
  }, [programId]);

  const totalSessions = useMemo(
    () => stages.reduce((sum, s) => sum + s.sessionCount, 0),
    [stages]
  );

  const visibleStages = activeStageId
    ? stages.filter((s) => s.stage.id === activeStageId)
    : stages;

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-400">
        Loading sessions…
      </div>
    );
  }

  if (stages.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
        <p className="text-sm font-medium text-gray-700">
          No sessions yet.
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Add a Test step on the program workflow, then create a session
          to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stage chevron filter row */}
      <StageChevronFilter
        stages={stages}
        totalSessions={totalSessions}
        activeStageId={activeStageId}
        onSelect={setActiveStageId}
      />

      {/* Per-stage collapsible cards */}
      <div className="space-y-3">
        {visibleStages.map((group) => (
          <StageCard
            key={group.stage.id}
            group={group}
            collapsed={collapsed[group.stage.id] ?? false}
            onToggle={() =>
              setCollapsed((prev) => ({
                ...prev,
                [group.stage.id]: !(prev[group.stage.id] ?? false),
              }))
            }
            canCreate={canCreate}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------- Stage chevron filter ---------- */

function StageChevronFilter({
  stages,
  totalSessions,
  activeStageId,
  onSelect,
}: {
  stages: StageGroup[];
  totalSessions: number;
  activeStageId: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div className="flex items-stretch gap-1 overflow-x-auto pb-1">
      {/* "All Stages" pill */}
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          "flex shrink-0 flex-col justify-center rounded-lg border px-5 py-2 text-left transition-colors",
          activeStageId === null
            ? "border-violet-300 bg-violet-50 text-violet-700"
            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
        )}
      >
        <span className="text-sm font-semibold">All Stages</span>
        <span className="text-[11px] text-gray-500">
          {totalSessions} {totalSessions === 1 ? "Session" : "Sessions"}
        </span>
      </button>

      {/* Per-stage chevrons */}
      {stages.map((group, i) => {
        const active = activeStageId === group.stage.id;
        return (
          <button
            key={group.stage.id}
            type="button"
            onClick={() =>
              onSelect(active ? null : group.stage.id)
            }
            className={cn(
              "relative shrink-0 px-6 py-2 text-left transition-colors",
              "border-y border-r-0 first:border-l",
              active
                ? "bg-violet-50 text-violet-700 border-violet-300"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50",
              i === 0 ? "rounded-l-lg" : ""
            )}
            style={{
              clipPath:
                "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 14px 50%)",
              paddingLeft: 24,
              paddingRight: 28,
            }}
          >
            <span className="block text-sm font-semibold">
              {group.stage.name}
            </span>
            <span className="block text-[11px] text-gray-500">
              {group.sessionCount}{" "}
              {group.sessionCount === 1 ? "Session" : "Sessions"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Stage card ---------- */

function StageCard({
  group,
  collapsed,
  onToggle,
  canCreate,
}: {
  group: StageGroup;
  collapsed: boolean;
  onToggle: () => void;
  canCreate: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
      {/* Stage header — always visible */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-5 py-3 text-left"
      >
        <span className="h-2.5 w-2.5 rounded-full border-2 border-gray-400" />
        <span className="text-sm font-semibold text-gray-900">
          {group.stage.name}
        </span>
        <Pill tone="violet">
          {group.testStepCount} Step: Test
        </Pill>
        <Pill tone="gray">
          {group.sessionCount}{" "}
          {group.sessionCount === 1 ? "Session" : "Sessions"}
        </Pill>
        <span className="ml-auto text-gray-400">
          {collapsed ? <ChevronDown size={20} /> : <ChevronRight size={20} className="rotate-90" />}
        </span>
      </button>

      {/* Stage body — per-step blocks */}
      {!collapsed && (
        <div className="space-y-4 px-5 pb-5">
          {group.steps.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gray-200 bg-white px-4 py-6 text-center text-xs text-gray-500">
              This stage has no steps configured.
            </p>
          ) : (
            group.steps
              .filter((s) => s.step.type === "test")
              .map((sg, idx) => (
                <StepBlock
                  key={sg.step.id}
                  index={idx + 1}
                  group={sg}
                  canCreate={canCreate}
                />
              ))
          )}
          {group.steps.every((s) => s.step.type !== "test") && (
            <p className="rounded-lg border border-dashed border-gray-200 bg-white px-4 py-6 text-center text-xs text-gray-500">
              No Test steps in this stage. Sessions are created from Test
              steps only.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

/* ---------- Step block ---------- */

function StepBlock({
  index,
  group,
  canCreate,
}: {
  index: number;
  group: StepGroup;
  canCreate: boolean;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-3">
        <span className="text-sm font-semibold text-gray-800">
          {index}. Step : {group.step.name}
        </span>
        <Pill tone="gray">
          {group.sessions.length}{" "}
          {group.sessions.length === 1 ? "Session" : "Sessions"}
        </Pill>
        {canCreate && (
          <Link
            href={`/tests/${group.step.testIds?.[0] ?? ""}/sessions/new`}
            className="ml-auto inline-flex items-center gap-1 rounded-md border border-violet-300 bg-white px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-50"
          >
            <Plus size={13} /> Create Session
          </Link>
        )}
      </div>

      {group.sessions.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-200 bg-white px-4 py-6 text-center text-xs text-gray-500">
          No sessions created yet for this step.
        </p>
      ) : (
        <ul className="space-y-2">
          {group.sessions.map((card) => (
            <SessionCardRow key={card.session.id} card={card} />
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------- Session card row ---------- */

function SessionCardRow({ card }: { card: SessionCard }) {
  const { session, clonedFrom, counts, reviewProcessPercent } = card;
  return (
    <li className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <Link
        href={`/submissions/${session.id}`}
        className="block px-5 py-4 transition-colors hover:bg-gray-50"
      >
        {/* Title row */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-gray-900">
                {session.name}
              </p>
              <CompositionBadge type={session.type} />
              <StatusBadge status={session.status} />
            </div>
            {clonedFrom && (
              <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-gray-500">
                <Copy size={12} />
                {clonedFrom}
              </p>
            )}
            <p className="mt-1 inline-flex items-center gap-1.5 pl-4 text-xs text-gray-500">
              <Calendar size={12} />
              {formatRange(session.startISO, session.endISO)}
            </p>
          </div>
        </div>

        {/* Counters + Review Process row */}
        <div className="mt-3 grid grid-cols-12 items-end gap-4">
          <div className="col-span-7 grid grid-cols-4 gap-4">
            <Stat label="Submissions" value={counts.submissions} />
            <Stat label="Completed Reviews" value={counts.completedReviews} />
            <Stat label="Under Review" value={counts.underReview} />
            <Stat label="Pending" value={counts.pending} />
          </div>
          <div className="col-span-5">
            <div className="flex items-baseline justify-end gap-2">
              <span className="text-xl font-semibold text-gray-900 tabular-nums">
                {reviewProcessPercent}%
              </span>
            </div>
            <ProgressBar percent={reviewProcessPercent} />
            <p className="mt-1 text-right text-[11px] text-gray-500">
              Review Process
            </p>
          </div>
        </div>
      </Link>
    </li>
  );
}

/* ---------- Small UI primitives ---------- */

function Pill({
  tone,
  children,
}: {
  tone: "violet" | "gray";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium",
        tone === "violet"
          ? "bg-violet-100 text-violet-700"
          : "bg-gray-100 text-gray-700"
      )}
    >
      {children}
    </span>
  );
}

function CompositionBadge({ type }: { type: SessionType }) {
  return (
    <span className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-0.5 text-[11px] font-medium text-gray-700">
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: TestSession["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium",
        SESSION_STATUS_TONE[status] ?? "bg-gray-200 text-gray-700"
      )}
    >
      {status}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-gray-500">{label}</p>
      <p
        className={cn(
          "mt-0.5 text-xl font-semibold tabular-nums",
          value === 0 ? "text-gray-400" : "text-gray-900"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  // Wireframe colour bands: amber for partial, green at 100%.
  const tone =
    percent >= 100
      ? "bg-green-500"
      : percent >= 50
        ? "bg-amber-400"
        : percent > 0
          ? "bg-amber-300"
          : "bg-gray-200";
  return (
    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        className={cn("h-full rounded-full transition-all", tone)}
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}

function formatRange(startISO: string, endISO: string): string {
  const fmt = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const time = d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const date = d.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
    });
    return `${time} ${date}`;
  };
  const year = new Date(endISO).getFullYear();
  return `${fmt(startISO)} – ${fmt(endISO)}, ${year}`;
}
