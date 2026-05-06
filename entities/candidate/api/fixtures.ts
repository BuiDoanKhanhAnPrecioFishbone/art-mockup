import type { Candidate } from "../model/types";

/**
 * Mock candidate seed — the names come from the wireframe so the demo
 * shows realistic data. Stage/step IDs reference the SAMPLE workflow
 * shipped via getSampleDraft (smp-stage-* / smp-step-*) so when the user
 * opens the Pipelines tab on an existing program with that workflow,
 * candidates correctly bucket into stages.
 *
 * Programs without the demo workflow simply have no seeded candidates;
 * the pipeline shows an empty state with "+ Add New Candidate" prompt.
 *
 * Backed by globalThis so writes are shared across Next.js per-route
 * bundles (same pattern as program fixtures — see entities/program).
 */

const SEED: Candidate[] = [
  // Pipeline candidates for the Engineering Standard pipeline (used in the
  // sample workflow). Programs with this flowTemplateId will see them.
  {
    id: "cnd-bao",
    programId: "*", // wildcard — shown for every program in the demo
    name: "Tran Gia Bao",
    email: "trangb@example.com",
    status: "on-going",
    skillsMatchPercent: 92,
    groupLabel: "high-priority",
    bookedDateISO: "2026-01-25",
    bookedTime: "09:00",
    currentStageId: "smp-stage-screen",
    currentStepId: "smp-step-call",
    reviewerIds: ["u-amelia", "u-marcus", "u-priya"],
    pendingEmailCount: 1,
    hasNote: false,
  },
  {
    id: "cnd-mai",
    programId: "*",
    name: "Nguyen Thi Mai",
    email: "mainguyen.dev@gmail.com",
    status: "on-going",
    skillsMatchPercent: 78,
    currentStageId: "smp-stage-inbox",
    currentStepId: "smp-step-cv",
    reviewerIds: ["u-amelia"],
    pendingEmailCount: 0,
    hasNote: false,
  },
  {
    id: "cnd-nam",
    programId: "*",
    name: "Le Hoang Nam",
    email: "nam.lehoang@yahoo.com",
    status: "on-going",
    skillsMatchPercent: 88,
    groupLabel: "high-priority",
    bookedDateISO: "2026-03-28",
    bookedTime: "14:30",
    currentStageId: "smp-stage-screen",
    currentStepId: "smp-step-test",
    reviewerIds: ["u-amelia"],
    pendingEmailCount: 0,
    hasNote: false,
  },
  {
    id: "cnd-kien",
    programId: "*",
    name: "Pham Van Kien",
    email: "kienpv_99@outlook.com",
    status: "on-going",
    skillsMatchPercent: 45,
    groupLabel: "low-priority",
    currentStageId: "smp-stage-screen",
    currentStepId: "smp-step-test",
    reviewerIds: [],
    pendingEmailCount: 3,
    hasNote: false,
  },
  {
    id: "cnd-huong",
    programId: "*",
    name: "Vu Thi Huong",
    email: "huongvu.design@gmail.com",
    status: "on-going",
    skillsMatchPercent: 95,
    groupLabel: "high-priority",
    currentStageId: "smp-stage-onsite",
    currentStepId: "smp-step-portfolio",
    reviewerIds: ["u-amelia", "u-sofia"],
    pendingEmailCount: 0,
    hasNote: false,
  },
  {
    id: "cnd-anh",
    programId: "*",
    name: "Doan Tuan Anh",
    email: "tuandoan.anh@gmail.com",
    status: "on-going",
    skillsMatchPercent: 60,
    groupLabel: "mid-priority",
    bookedDateISO: "2026-03-26",
    bookedTime: "10:00",
    currentStageId: "smp-stage-onsite",
    currentStepId: "smp-step-hm",
    reviewerIds: ["u-amelia", "u-marcus"],
    pendingEmailCount: 1,
    hasNote: true,
  },
  {
    id: "cnd-elena",
    programId: "*",
    name: "Elena Rostova",
    email: "elena.r@international.com",
    status: "on-going",
    skillsMatchPercent: 30,
    currentStageId: "smp-stage-onsite",
    currentStepId: "smp-step-portfolio",
    reviewerIds: ["u-jonas"],
    pendingEmailCount: 0,
    hasNote: false,
  },
  // Final-decisions candidates (one Hired, one Rejected) for variety.
  {
    id: "cnd-bao-final",
    programId: "*",
    name: "James O'Brien",
    email: "james.obrien@example.com",
    status: "hired",
    skillsMatchPercent: 91,
    groupLabel: "high-priority",
    stepResult: "Excellent technical skills and cultural fit.",
    currentStageId: "smp-stage-final",
    currentStepId: "smp-step-hired",
    reviewerIds: ["u-amelia"],
    pendingEmailCount: 0,
    hasNote: false,
  },
  {
    id: "cnd-rej-1",
    programId: "*",
    name: "Sara Lee",
    email: "sara.lee@example.com",
    status: "rejected",
    skillsMatchPercent: 35,
    stepResult: "Lack of required experience in automation.",
    currentStageId: "smp-stage-final",
    currentStepId: "smp-step-rejected",
    reviewerIds: ["u-marcus"],
    pendingEmailCount: 0,
    hasNote: false,
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __artMockCandidatesStore: Candidate[] | undefined;
}

function store(): Candidate[] {
  if (!globalThis.__artMockCandidatesStore) {
    globalThis.__artMockCandidatesStore = [...SEED];
  }
  return globalThis.__artMockCandidatesStore;
}

export function listCandidates(programId: string): Candidate[] {
  // The "*" wildcard programId in the seed makes the demo data visible for
  // every program. Real (non-seed) candidates would carry an actual
  // programId and only show for that program.
  return store().filter(
    (c) => c.programId === programId || c.programId === "*"
  );
}

export function getCandidate(id: string): Candidate | undefined {
  return store().find((c) => c.id === id);
}

export function updateCandidate(
  id: string,
  patch: Partial<Candidate>
): Candidate | undefined {
  const all = store();
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return undefined;
  all[idx] = { ...all[idx], ...patch };
  return all[idx];
}

export function deleteCandidate(id: string): boolean {
  const all = store();
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  all.splice(idx, 1);
  return true;
}

export function addCandidate(c: Candidate): Candidate {
  store().push(c);
  return c;
}
