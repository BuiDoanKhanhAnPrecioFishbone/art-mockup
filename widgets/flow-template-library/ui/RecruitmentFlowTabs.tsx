"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/cn";

const TABS: { id: string; label: string; href: string; matchPrefix: string }[] = [
  {
    id: "flows",
    label: "Flows",
    href: "/templates/recruitment-flow",
    // Matches the list page exactly OR any child route under it
    // EXCEPT /stages and /steps (handled by their own tabs).
    matchPrefix: "/templates/recruitment-flow",
  },
  {
    id: "stages",
    label: "Stages",
    href: "/templates/recruitment-flow/stages",
    matchPrefix: "/templates/recruitment-flow/stages",
  },
  {
    id: "steps",
    label: "Steps",
    href: "/templates/recruitment-flow/steps",
    matchPrefix: "/templates/recruitment-flow/steps",
  },
];

/** Shared header for all three Recruitment Flow library pages —
 *  matches the wireframe `Recruitment Flow ?` title with the
 *  Flows / Stages / Steps tab strip below. Used by the Flows /
 *  Stages / Steps list pages so navigation stays consistent. */
export function RecruitmentFlowTabs() {
  const pathname = usePathname();

  // Pick the most specific match — Stages and Steps both start with
  // the Flows prefix, so check them first.
  const stagesActive = pathname.startsWith(
    "/templates/recruitment-flow/stages"
  );
  const stepsActive = pathname.startsWith(
    "/templates/recruitment-flow/steps"
  );
  const flowsActive = !stagesActive && !stepsActive;
  const activeId = stagesActive
    ? "stages"
    : stepsActive
      ? "steps"
      : flowsActive
        ? "flows"
        : "";

  return (
    <div>
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold text-gray-900">
          Recruitment Flow
        </h1>
        <span
          title="Manage your reusable recruitment flows, stages, and steps."
          className="grid h-5 w-5 cursor-help place-items-center rounded-full bg-violet-100 text-[11px] font-semibold text-violet-700"
        >
          ?
        </span>
      </div>

      <nav className="mt-4 flex gap-1 border-b border-gray-200">
        {TABS.map((tab) => {
          const active = tab.id === activeId;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "relative px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "text-violet-700"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {tab.label}
              {active && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-violet-600" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
