import type { Candidate } from "../model/types";

/**
 * Mock candidate seed — names + numbers come from the wireframe so the
 * demo shows realistic data. Candidates are bound to specific programs by
 * id; the programs API derives applicantCount + newApplicantCount from
 * this same store so the card numbers always match the pipeline view.
 *
 * Backed by globalThis so writes are shared across Next.js per-route
 * bundles (same pattern as program fixtures — see entities/program).
 */

const NOW = Date.now();
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const SEED: Candidate[] = [
  /* ============================================================
   * Backend Developer Round 1 — 12 applicants
   * (matches program seed: backend-dev-r1-2026, applicantCount=12)
   * 3 of them are "new" (added in last 24-72h) so the program card
   * shows a "3 new" badge.
   * ============================================================ */
  {
    id: "cnd-bao",
    programId: "backend-dev-r1-2026",
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
    addedAtISO: new Date(NOW - 18 * DAY).toISOString(),
    stepEmailReplies: [
      {
        id: "reply-bao-1",
        stepId: "smp-step-call",
        status: "Accept",
        subject: "Re: Screening call invitation",
        body:
          "Hi Amelia, thank you for the invitation. The proposed " +
          "Friday 9 AM works for me — I'll dial in via the Meet link " +
          "you sent. Looking forward to it!\n\nBest, Bao",
        receivedAtISO: new Date(NOW - 1 * DAY).toISOString(),
      },
    ],
  },
  {
    // Already advanced to the Offer step. Pre-actioned so the Email
    // notification doesn't fire when she sits here — demos the
    // "no-renotify after action" rule.
    id: "cnd-mai",
    programId: "backend-dev-r1-2026",
    name: "Nguyen Thi Mai",
    email: "mainguyen.dev@gmail.com",
    status: "on-going",
    skillsMatchPercent: 78,
    groupLabel: "high-priority",
    currentStageId: "smp-stage-offer",
    currentStepId: "smp-step-offer",
    reviewerIds: ["u-amelia"],
    pendingEmailCount: 0,
    hasNote: false,
    addedAtISO: new Date(NOW - 12 * DAY).toISOString(),
    actionedStepIds: ["smp-step-offer"],
  },
  {
    id: "cnd-nam",
    programId: "backend-dev-r1-2026",
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
    addedAtISO: new Date(NOW - 9 * DAY).toISOString(),
  },
  {
    // Sitting at the Test step but already actioned — demos the
    // "Test Setup Required" notification NOT firing for him while it
    // still fires for Le Hoang Nam who's also at this step.
    id: "cnd-kien",
    programId: "backend-dev-r1-2026",
    name: "Pham Van Kien",
    email: "kienpv_99@outlook.com",
    status: "on-going",
    skillsMatchPercent: 45,
    groupLabel: "low-priority",
    currentStageId: "smp-stage-screen",
    currentStepId: "smp-step-test",
    reviewerIds: ["u-marcus"],
    pendingEmailCount: 0,
    hasNote: false,
    addedAtISO: new Date(NOW - 6 * DAY).toISOString(),
    actionedStepIds: ["smp-step-test"],
  },
  {
    id: "cnd-huong",
    programId: "backend-dev-r1-2026",
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
    addedAtISO: new Date(NOW - 5 * DAY).toISOString(),
  },
  {
    id: "cnd-anh",
    programId: "backend-dev-r1-2026",
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
    noteContent:
      "Strong technical interview but borderline on cultural fit — " +
      "ask about cross-team collaboration in the HM round.",
    addedAtISO: new Date(NOW - 5 * DAY).toISOString(),
    stepEmailReplies: [
      {
        id: "reply-anh-1",
        stepId: "smp-step-hm",
        status: "Reschedule",
        subject: "Re: Hiring Manager interview — scheduling",
        body:
          "Hi team, thanks for moving me forward. I have a conflict " +
          "Thursday morning but I'm flexible Wednesday afternoon or " +
          "Friday before 11. Whatever works best for the panel.\n\n" +
          "Thanks,\nTuan Anh",
        receivedAtISO: new Date(NOW - 8 * HOUR).toISOString(),
      },
    ],
  },
  {
    // Moved into the Reference Check step so the Offer stage isn't empty.
    id: "cnd-elena",
    programId: "backend-dev-r1-2026",
    name: "Elena Rostova",
    email: "elena.r@international.com",
    status: "on-going",
    skillsMatchPercent: 30,
    currentStageId: "smp-stage-offer",
    currentStepId: "smp-step-ref",
    reviewerIds: ["u-amelia"],
    pendingEmailCount: 0,
    hasNote: false,
    addedAtISO: new Date(NOW - 4 * DAY).toISOString(),
  },
  // Final-decisions: one Hired, one Rejected, for variety.
  {
    id: "cnd-bao-final",
    programId: "backend-dev-r1-2026",
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
    addedAtISO: new Date(NOW - 22 * DAY).toISOString(),
  },
  {
    id: "cnd-rej-1",
    programId: "backend-dev-r1-2026",
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
    addedAtISO: new Date(NOW - 19 * DAY).toISOString(),
  },
  // The 3 NEW applicants — recent enough to trigger the card badge.
  {
    id: "cnd-new-1",
    programId: "backend-dev-r1-2026",
    name: "Lucas Bergman",
    email: "lucas.bergman@example.com",
    status: "on-going",
    skillsMatchPercent: 84,
    currentStageId: "smp-stage-inbox",
    currentStepId: "smp-step-cv",
    reviewerIds: [],
    pendingEmailCount: 0,
    hasNote: false,
    addedAtISO: new Date(NOW - 6 * HOUR).toISOString(),
  },
  {
    id: "cnd-new-2",
    programId: "backend-dev-r1-2026",
    name: "Emma Schmidt",
    email: "emma.schmidt@example.com",
    status: "on-going",
    skillsMatchPercent: 71,
    currentStageId: "smp-stage-inbox",
    currentStepId: "smp-step-cv",
    reviewerIds: [],
    pendingEmailCount: 0,
    hasNote: false,
    addedAtISO: new Date(NOW - 22 * HOUR).toISOString(),
  },
  {
    id: "cnd-new-3",
    programId: "backend-dev-r1-2026",
    name: "Hiroshi Tanaka",
    email: "hiroshi.tanaka@example.com",
    status: "on-going",
    skillsMatchPercent: 66,
    currentStageId: "smp-stage-inbox",
    currentStepId: "smp-step-cv",
    reviewerIds: [],
    pendingEmailCount: 0,
    hasNote: false,
    addedAtISO: new Date(NOW - 2 * DAY).toISOString(),
  },

  /* ============================================================
   * Q1 Marketing Hiring — small set of marketing applicants so the
   * card / pipeline always have data when you click in.
   * ============================================================ */
  {
    id: "cnd-mkt-1",
    programId: "q1-marketing-hiring",
    name: "Olivia Park",
    email: "olivia.park@example.com",
    status: "on-going",
    skillsMatchPercent: 88,
    groupLabel: "high-priority",
    currentStageId: "smp-stage-inbox",
    currentStepId: "smp-step-cv",
    reviewerIds: ["u-sofia"],
    pendingEmailCount: 2,
    hasNote: false,
    addedAtISO: new Date(NOW - 3 * DAY).toISOString(),
    stepEmailReplies: [
      {
        id: "reply-olivia-1",
        stepId: "smp-step-cv",
        status: "Accept",
        subject: "Re: Application received — Q1 Marketing Hiring",
        body:
          "Hi, thanks for confirming. Quick question — is the role " +
          "remote-friendly or do you expect on-site presence in HCM? " +
          "Happy to relocate if needed.\n\nOlivia",
        receivedAtISO: new Date(NOW - 2 * DAY).toISOString(),
      },
      {
        id: "reply-olivia-2",
        stepId: "smp-step-cv",
        status: "Accept",
        subject: "Re: Portfolio link",
        body:
          "Sharing the updated portfolio with the campaign case " +
          "studies you asked about: olivia-park.com/portfolio. Let " +
          "me know if anything else would help.",
        receivedAtISO: new Date(NOW - 1 * DAY).toISOString(),
      },
    ],
  },
  {
    id: "cnd-mkt-2",
    programId: "q1-marketing-hiring",
    name: "Mateusz Kowalski",
    email: "mateusz.k@example.com",
    status: "on-going",
    skillsMatchPercent: 74,
    currentStageId: "smp-stage-screen",
    currentStepId: "smp-step-call",
    reviewerIds: ["u-sofia"],
    pendingEmailCount: 0,
    hasNote: false,
    addedAtISO: new Date(NOW - 8 * DAY).toISOString(),
  },
  {
    id: "cnd-mkt-3",
    programId: "q1-marketing-hiring",
    name: "Aisha Rahman",
    email: "aisha.r@example.com",
    status: "hired",
    skillsMatchPercent: 90,
    groupLabel: "high-priority",
    stepResult: "Strong campaign portfolio.",
    currentStageId: "smp-stage-final",
    currentStepId: "smp-step-hired",
    reviewerIds: ["u-sofia", "u-amelia"],
    pendingEmailCount: 0,
    hasNote: false,
    addedAtISO: new Date(NOW - 25 * DAY).toISOString(),
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

/** Wipe the candidates store and re-seed from the canonical fixtures.
 *  Used by the demo "Reset demo data" button so fixture-level changes
 *  (note content, email replies, etc.) propagate without restarting
 *  the dev server. */
export function resetCandidatesStore(): Candidate[] {
  globalThis.__artMockCandidatesStore = [...SEED];
  return globalThis.__artMockCandidatesStore;
}

export function listCandidates(programId: string): Candidate[] {
  return store().filter((c) => c.programId === programId);
}

/** All candidates across all programs — used by /api/programs to derive
 *  per-program applicant counts in one pass. */
export function listAllCandidates(): Candidate[] {
  return [...store()];
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
  // Auto-stamp addedAtISO so freshly-created candidates always count as
  // "new" for the next NEW_APPLICANT_WINDOW_DAYS.
  const stamped: Candidate = { ...c, addedAtISO: c.addedAtISO ?? new Date().toISOString() };
  store().push(stamped);
  return stamped;
}
