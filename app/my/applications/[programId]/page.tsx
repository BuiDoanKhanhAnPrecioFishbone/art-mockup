"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, CheckCircle2, MapPin } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import {
  CANDIDATE_STATUS_LABEL,
  type CandidateStatus,
} from "@/entities/candidate";
import type { Program } from "@/entities/program";

interface ApplicationRow {
  candidateId: string;
  program: Program;
  currentStage: { id: string; name: string } | null;
  currentStep: { id: string; name: string; type: string } | null;
  status: CandidateStatus;
}

const STATUS_TONE: Record<CandidateStatus, string> = {
  "on-going": "bg-violet-100 text-violet-700",
  hired: "bg-emerald-100 text-emerald-700",
  completed: "bg-sky-100 text-sky-700",
  rejected: "bg-red-100 text-red-700",
  withdrawn: "bg-gray-200 text-gray-600",
};

/** Read-only program detail for the candidate. Surfaces the
 *  public-facing fields only — title / role / dates / description /
 *  location — plus a stripped workflow timeline showing stage + step
 *  names and which one the candidate is currently on. No reviewer
 *  ids, no instructions, no email templates. */
export default function MyApplicationDetailPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const [row, setRow] = useState<ApplicationRow | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [programId, setProgramId] = useState<string>("");

  useEffect(() => {
    params.then((p) => setProgramId(p.programId));
  }, [params]);

  useEffect(() => {
    if (!programId) return;
    Promise.all([
      fetch("/api/my/me").then((r) => r.json()),
      fetch(`/api/programs/${programId}`).then((r) => r.json()),
    ])
      .then(([me, prog]) => {
        const found =
          (me.applications ?? []).find(
            (a: ApplicationRow) => a.program.id === programId
          ) ?? null;
        setRow(found);
        setProgram(prog.program ?? null);
      })
      .finally(() => setLoading(false));
  }, [programId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12 text-sm text-gray-400">
        Loading…
      </div>
    );
  }
  if (!row || !program) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12">
        <Link
          href="/my/applications"
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={12} /> Back to my applications
        </Link>
        <p className="mt-6 rounded-md border border-dashed border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
          You aren&rsquo;t currently a candidate in this program.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <Link
        href="/my/applications"
        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={12} /> Back to my applications
      </Link>

      {/* Header card */}
      <section className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-700">
                {program.position} · {program.level}
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-gray-900">
                {program.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <Calendar size={12} />
                  {formatRange(program.startDate, program.endDate)}
                </span>
                {program.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={12} /> {program.location}
                  </span>
                )}
                {program.employmentType && (
                  <span className="rounded bg-gray-100 px-2 py-0.5">
                    {program.employmentType}
                  </span>
                )}
              </div>
            </div>
            <span
              className={cn(
                "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium",
                STATUS_TONE[row.status]
              )}
            >
              Your status · {CANDIDATE_STATUS_LABEL[row.status]}
            </span>
          </div>
        </div>
      </section>

      {/* About the role */}
      {program.description && (
        <section className="mt-4 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-violet-600">
            About this role
          </h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-700">
            {program.description}
          </p>
        </section>
      )}

      {/* Workflow timeline (public-facing — names only) */}
      <section className="mt-4 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-violet-600">
          Your hiring journey
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Steps in this program. The highlighted one is where you are right
          now. Detailed feedback stays with the hiring team.
        </p>

        <ol className="mt-4 space-y-3">
          {(program.workflow?.stages ?? []).map((stage) => (
            <li key={stage.id}>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {stage.name}
              </p>
              <ul className="mt-1.5 space-y-1.5">
                {stage.steps.map((step) => {
                  const isCurrent = row.currentStep?.id === step.id;
                  const isPast = passedStep(
                    program,
                    row.currentStage?.id ?? null,
                    row.currentStep?.id ?? null,
                    stage.id,
                    step.id
                  );
                  return (
                    <li
                      key={step.id}
                      className={cn(
                        "flex items-center gap-3 rounded-md border px-3 py-2 text-sm",
                        isCurrent
                          ? "border-violet-300 bg-violet-50 text-violet-800"
                          : isPast
                            ? "border-emerald-200 bg-emerald-50/50 text-emerald-700"
                            : "border-gray-200 text-gray-700"
                      )}
                    >
                      <span
                        className={cn(
                          "grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px]",
                          isCurrent
                            ? "bg-violet-600 text-white"
                            : isPast
                              ? "bg-emerald-500 text-white"
                              : "border border-gray-300 text-gray-400"
                        )}
                      >
                        {isPast ? <CheckCircle2 size={10} /> : ""}
                      </span>
                      <span className="flex-1">{step.name}</span>
                      <span className="rounded bg-white px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-gray-500">
                        {humanizeType(step.type)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
          {(program.workflow?.stages ?? []).length === 0 && (
            <p className="text-xs text-gray-400">No steps published yet.</p>
          )}
        </ol>
      </section>

      <p className="mt-4 text-[11px] text-gray-400">
        Need to make changes? Reach out to the recruiter who invited you —
        candidates can view but not edit application details here.
      </p>
    </div>
  );
}

/** True when the given (stage, step) has already been completed by the
 *  candidate (i.e. they're now on a later step in the workflow order). */
function passedStep(
  program: Program,
  currentStageId: string | null,
  currentStepId: string | null,
  stageId: string,
  stepId: string
): boolean {
  if (!currentStageId || !currentStepId) return false;
  const order: { stageId: string; stepId: string }[] = [];
  for (const stage of program.workflow?.stages ?? []) {
    for (const step of stage.steps) {
      order.push({ stageId: stage.id, stepId: step.id });
    }
  }
  const currentIdx = order.findIndex(
    (p) => p.stageId === currentStageId && p.stepId === currentStepId
  );
  const thisIdx = order.findIndex(
    (p) => p.stageId === stageId && p.stepId === stepId
  );
  return currentIdx > -1 && thisIdx > -1 && thisIdx < currentIdx;
}

function humanizeType(t: string): string {
  if (t === "test") return "Test";
  if (t === "interview") return "Interview";
  return "Review";
}

function formatRange(start: string, end: string): string {
  const fmt = (s: string) => {
    if (!s) return "—";
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  return `${fmt(start)} → ${fmt(end)}`;
}
