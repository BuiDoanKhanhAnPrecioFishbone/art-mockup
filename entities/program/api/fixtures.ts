import type { Program } from "../model/types";
import { defaultCandidateProfile } from "../model/profile";
import { defaultPublicFormSettings } from "../model/public-form";
import { sampleWorkflow } from "../model/sample-workflow";

/**
 * Module-level mock store, backed by globalThis so writes from one route
 * handler are visible to all others within the same dev-server process.
 *
 * Why globalThis? Next.js bundles each route handler / server component
 * separately, and each bundle gets its own module instance — so a plain
 * module-level `let` array is NOT shared across routes (writes in
 * `POST /api/programs/route.ts` would not appear in `GET /api/programs/[id]/route.ts`).
 * Pinning the array to `globalThis` gives us one true store for the
 * whole process and also survives HMR reloads in dev.
 */

const SEED: Program[] = [
  {
    id: "q1-marketing-hiring",
    title: "Q1 Marketing Hiring",
    position: "Marketing",
    level: "Intern",
    startDate: "2026-03-24",
    endDate: "2026-04-23",
    headcount: 2,
    applicantCount: 3,
    status: "active",
    createdAt: "2026-03-01T09:00:00Z",
    candidateProfile: defaultCandidateProfile(),
    publicForm: defaultPublicFormSettings(),
    workflow: sampleWorkflow(),
  },
  {
    id: "backend-dev-r1-2026",
    title: "Recruitment for Backend Developer Round 1 - 2026",
    position: "Backend Developer",
    level: "Fresher",
    startDate: "2026-03-24",
    endDate: "2026-04-30",
    headcount: 5,
    applicantCount: 12,
    status: "active",
    createdAt: "2026-03-10T09:00:00Z",
    candidateProfile: defaultCandidateProfile(),
    publicForm: defaultPublicFormSettings(),
    workflow: sampleWorkflow(),
  },
  {
    id: "precio-seed-q3-2026",
    title: "Precio Seed Q3 - 2026",
    position: "Fullstack Developer",
    level: "Fresher",
    startDate: "2026-10-09",
    endDate: "2026-10-30",
    headcount: 12,
    applicantCount: 0,
    status: "active",
    createdAt: "2026-09-15T09:00:00Z",
    candidateProfile: defaultCandidateProfile(),
    publicForm: defaultPublicFormSettings(),
    workflow: sampleWorkflow(),
  },
  {
    id: "se-summercamp-2023",
    title: "Software Engineer - SummerCamp 2023",
    position: "Software Engineer",
    level: "Fresher",
    startDate: "2023-03-01",
    endDate: "2023-04-30",
    headcount: 6,
    applicantCount: 47,
    status: "closed",
    createdAt: "2023-02-15T09:00:00Z",
    candidateProfile: defaultCandidateProfile(),
    publicForm: defaultPublicFormSettings(),
    workflow: sampleWorkflow(),
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __artMockProgramsStore: Program[] | undefined;
}

function store(): Program[] {
  if (!globalThis.__artMockProgramsStore) {
    globalThis.__artMockProgramsStore = [...SEED];
  }
  return globalThis.__artMockProgramsStore;
}

/** Wipe the programs store and re-seed it from the canonical fixtures.
 *  Used by the demo "Reset demo data" button so fixture changes (e.g.
 *  updated criterion categories) propagate without restarting the dev
 *  server. */
export function resetProgramsStore(): Program[] {
  globalThis.__artMockProgramsStore = [...SEED];
  return globalThis.__artMockProgramsStore;
}

export function listPrograms(): Program[] {
  return [...store()];
}

export function getProgram(id: string): Program | undefined {
  return store().find((p) => p.id === id);
}

export function createProgram(p: Program): Program {
  store().unshift(p);
  return p;
}

export function nextProgramId(seed: string): string {
  const slug =
    seed
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "program";
  let id = slug;
  let n = 1;
  const all = store();
  while (all.some((p) => p.id === id)) {
    n += 1;
    id = `${slug}-${n}`;
  }
  return id;
}

export function updateProgram(
  id: string,
  patch: Partial<Program>
): Program | undefined {
  const all = store();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  all[idx] = { ...all[idx], ...patch };
  return all[idx];
}

export function deleteProgram(id: string): boolean {
  const all = store();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  all.splice(idx, 1);
  return true;
}

export function duplicateProgram(id: string): Program | undefined {
  const src = getProgram(id);
  if (!src) return undefined;
  const copy: Program = {
    ...src,
    id: `${src.id}-copy-${Date.now()}`,
    title: `${src.title} (Copy)`,
    status: "draft",
    applicantCount: 0,
    createdAt: new Date().toISOString(),
  };
  store().unshift(copy);
  return copy;
}
