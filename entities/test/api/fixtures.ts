import type {
  Submission,
  Test,
  TestSession,
} from "../model/types";

const NOW = Date.now();
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const TESTS: Test[] = [
  {
    id: "test-data-scientist",
    title: "Data Scientist Intern Test",
    type: "Assesment",
    status: "Draft",
    durationMinutes: 80,
    tags: ["Frontend", ".Net", "Back-end"],
    description:
      "This assessment evaluates candidates for an AI Engineer Internship, assessing their skills in machine learning, data analysis, and algorithm development.",
    passRatioPercent: 80,
    canSkipQuestion: true,
    compositionMode: "static",
    staticQuestions: [
      { questionId: "q-clean-code", order: 0 },
      { questionId: "q-validate-string", order: 1 },
      { questionId: "q-async-multithread", order: 2 },
      { questionId: "q-csharp-linq", order: 3 },
      { questionId: "q-mc-qa", order: 4 },
    ],
    dynamicConditions: [],
    shuffleQuestions: false,
    createdAtISO: new Date(NOW - 14 * DAY).toISOString(),
    updatedAtISO: new Date(NOW - 2 * DAY).toISOString(),
  },
  {
    id: "test-machine-learning",
    title: "Machine Learning Researcher Intern Test",
    type: "Recruitment",
    status: "Published",
    durationMinutes: 120,
    tags: [".NET", "C#"],
    description:
      "Evaluates research-level ML knowledge, paper comprehension, and applied modelling capability.",
    passRatioPercent: 70,
    canSkipQuestion: false,
    compositionMode: "dynamic",
    staticQuestions: [],
    dynamicConditions: [
      {
        id: "dc-ml-1",
        type: "multiple-choice",
        difficulty: "Easy",
        tags: ["HTML", "CSS"],
        quantity: 1,
        order: 0,
      },
      {
        id: "dc-ml-2",
        type: "multiple-choice",
        difficulty: "Easy",
        tags: [".Net", "C#"],
        quantity: 2,
        order: 1,
      },
      {
        id: "dc-ml-3",
        type: "essay",
        difficulty: "Medium",
        tags: ["Python", "Django"],
        quantity: 4,
        order: 2,
      },
      {
        id: "dc-ml-4",
        type: "multiple-choice",
        difficulty: "Hard",
        tags: ["Figma", "Adobe"],
        quantity: 3,
        order: 3,
      },
    ],
    shuffleQuestions: true,
    createdAtISO: new Date(NOW - 30 * DAY).toISOString(),
    updatedAtISO: new Date(NOW - 5 * DAY).toISOString(),
  },
  {
    id: "test-software-developer",
    title: "Software Developer Intern Test",
    type: "Assesment",
    status: "Draft",
    durationMinutes: 90,
    tags: ["Python", "Django", "Flask"],
    description:
      "Hands-on coding assessment for software engineering interns — scoped to backend basics.",
    passRatioPercent: 65,
    canSkipQuestion: true,
    compositionMode: "static",
    staticQuestions: [
      { questionId: "q-validate-string", order: 0 },
      { questionId: "q-csharp-linq", order: 1 },
    ],
    dynamicConditions: [],
    shuffleQuestions: false,
    createdAtISO: new Date(NOW - 21 * DAY).toISOString(),
    updatedAtISO: new Date(NOW - 9 * DAY).toISOString(),
  },
  {
    id: "test-network-engineer",
    title: "Network Engineer Trainee Test",
    type: "Assesment",
    status: "Draft",
    durationMinutes: 60,
    tags: ["Ruby", "Rails", "JavaScript"],
    description:
      "Foundational networking + infrastructure knowledge for trainee-level network engineers.",
    passRatioPercent: 60,
    canSkipQuestion: true,
    compositionMode: "static",
    staticQuestions: [],
    dynamicConditions: [],
    shuffleQuestions: false,
    createdAtISO: new Date(NOW - 11 * DAY).toISOString(),
    updatedAtISO: new Date(NOW - 11 * DAY).toISOString(),
  },
  {
    id: "test-uxui-designer",
    title: "UX/UI Designer Intern Test",
    type: "Recruitment",
    status: "Published",
    durationMinutes: 90,
    tags: ["Figma", "Adobe"],
    description:
      "Portfolio walk-through, brief response, and design-systems literacy.",
    passRatioPercent: 75,
    canSkipQuestion: true,
    compositionMode: "static",
    staticQuestions: [{ questionId: "q-mc-qa", order: 0 }],
    dynamicConditions: [],
    shuffleQuestions: false,
    createdAtISO: new Date(NOW - 60 * DAY).toISOString(),
    updatedAtISO: new Date(NOW - 25 * DAY).toISOString(),
  },
  {
    id: "test-qa-checkout",
    title: "QA Test Plan Workshop",
    type: "Recruitment",
    status: "Published",
    durationMinutes: 75,
    tags: ["QA", "Testing"],
    description:
      "Open-ended testing scenario — candidates outline a regression suite for a checkout flow.",
    passRatioPercent: 70,
    canSkipQuestion: false,
    compositionMode: "static",
    staticQuestions: [{ questionId: "q-testing-checkout", order: 0 }],
    dynamicConditions: [],
    shuffleQuestions: false,
    createdAtISO: new Date(NOW - 7 * DAY).toISOString(),
    updatedAtISO: new Date(NOW - 1 * DAY).toISOString(),
  },
];

// Seed a realistic spread across the new status machine — 2 each
// of Upcoming / Active / Completed and one each of Closing / Cancelled
// — so list filters and detail screens have something to render.
const SESSION_STATUS_SEEDS: {
  status: TestSession["status"];
  type: TestSession["type"];
  startOffsetDays: number;
  endOffsetDays: number;
  cancelReason?: string;
  forceFinished?: boolean;
}[] = [
  { status: "Upcoming", type: "Public", startOffsetDays: 2, endOffsetDays: 9 },
  { status: "Upcoming", type: "Private", startOffsetDays: 5, endOffsetDays: 12 },
  { status: "Active", type: "Public", startOffsetDays: -1, endOffsetDays: 4 },
  { status: "Active", type: "Private Onsite", startOffsetDays: 0, endOffsetDays: 1 },
  {
    status: "Closing",
    type: "Private Onsite",
    startOffsetDays: -2,
    endOffsetDays: 0,
  },
  {
    status: "Completed",
    type: "Public",
    startOffsetDays: -10,
    endOffsetDays: -3,
    forceFinished: true,
  },
  {
    status: "Completed",
    type: "Private",
    startOffsetDays: -14,
    endOffsetDays: -7,
  },
  {
    status: "Cancelled",
    type: "Public",
    startOffsetDays: -6,
    endOffsetDays: 1,
    cancelReason: "Job opening filled before the public session date.",
  },
];

const SESSIONS: TestSession[] = SESSION_STATUS_SEEDS.map((seed, i) => ({
  id: `sess-${i + 1}`,
  testId: "test-data-scientist",
  name: `Data Scientist Intern — ${seed.status} Cohort ${i + 1}`,
  type: seed.type,
  status: seed.status,
  accessCode: `9876${String.fromCharCode(97 + i)}${String.fromCharCode(120 + (i % 3))}`,
  description:
    "Seeking a motivated intern to join our team and contribute to building innovative software solutions.",
  refreshAccessCodeMinutes: 0,
  startISO: new Date(NOW + seed.startOffsetDays * DAY).toISOString(),
  endISO: new Date(NOW + seed.endOffsetDays * DAY).toISOString(),
  ...(seed.status === "Completed" || seed.status === "Cancelled"
    ? { actualEndISO: new Date(NOW + seed.endOffsetDays * DAY).toISOString() }
    : {}),
  ...(seed.cancelReason ? { cancelReason: seed.cancelReason } : {}),
}));

// Helper that builds a per-question result row matching the shape the
// Submission Detail table expects.
function qr(
  questionId: string,
  title: string,
  type: string,
  difficulty: string,
  tags: string[],
  scored: number,
  max: number
): import("../model/types").SubmissionQuestionResult {
  return { questionId, title, type, difficulty, tags, scored, max };
}

const SUBMISSIONS: Submission[] = [
  // ------- sess-3 (Active Public): one graded + one in-progress -------
  {
    id: "sub-1",
    sessionId: "sess-3",
    candidateName: "Tran Gia Bao",
    candidateEmail: "trangb@example.com",
    status: "graded",
    scorePercent: 88,
    startedAtISO: new Date(NOW - 1 * HOUR).toISOString(),
    submittedAtISO: new Date(NOW - 30 * 60 * 1000).toISOString(),
    finalReview: "Passed",
    integrity: {
      leavingTabCount: 1,
      copyPasteCount: 0,
      devtoolsOpenCount: 0,
      multiInstanceCount: 0,
      multiMonitorFlag: false,
    },
    skillBreakdown: [
      { skill: "Python", percent: 95 },
      { skill: "SQL", percent: 88 },
      { skill: "Statistics", percent: 80 },
    ],
    questionResults: [
      qr("q1", "Linked List Reversal", "Code", "Easy", ["Python"], 10, 10),
      qr("q2", "SQL Joins basics", "MultipleChoice", "Easy", ["SQL"], 5, 5),
      qr("q3", "Time-series anomaly write-up", "Essay", "Medium", ["Statistics"], 8, 10),
    ],
    aiReviewerNotes:
      "Strong fundamentals. Code question solved cleanly with clear edge-case handling. Essay shows solid grasp of seasonality but could benefit from concrete metrics for scoring detection accuracy.",
  },
  {
    id: "sub-2",
    sessionId: "sess-3",
    candidateName: "Nguyen Thi Mai",
    candidateEmail: "mainguyen.dev@gmail.com",
    status: "submitted",
    scorePercent: 72,
    startedAtISO: new Date(NOW - 2 * HOUR).toISOString(),
    submittedAtISO: new Date(NOW - 1 * HOUR).toISOString(),
    finalReview: "Under Review",
    integrity: {
      leavingTabCount: 4,
      copyPasteCount: 2,
      devtoolsOpenCount: 0,
      multiInstanceCount: 0,
      multiMonitorFlag: false,
    },
    skillBreakdown: [
      { skill: "Python", percent: 75 },
      { skill: "SQL", percent: 70 },
      { skill: "Statistics", percent: 60 },
    ],
    questionResults: [
      qr("q1", "Linked List Reversal", "Code", "Easy", ["Python"], 7, 10),
      qr("q2", "SQL Joins basics", "MultipleChoice", "Easy", ["SQL"], 4, 5),
      qr("q3", "Time-series anomaly write-up", "Essay", "Medium", ["Statistics"], 6, 10),
    ],
    aiReviewerNotes:
      "Above the bar overall. Multiple tab-switches flagged — recommend a follow-up live coding session before final decision.",
  },
  {
    id: "sub-3",
    sessionId: "sess-3",
    candidateName: "Le Hoang Nam",
    candidateEmail: "nam.lehoang@yahoo.com",
    status: "in-progress",
    startedAtISO: new Date(NOW - 12 * 60 * 1000).toISOString(),
  },

  // ------- sess-4 (Active Onsite): a small in-room cohort -------
  {
    id: "sub-4",
    sessionId: "sess-4",
    candidateName: "Pham Van Kien",
    candidateEmail: "kienpv_99@outlook.com",
    status: "in-progress",
    startedAtISO: new Date(NOW - 25 * 60 * 1000).toISOString(),
  },
  {
    id: "sub-5",
    sessionId: "sess-4",
    candidateName: "Doan Tuan Anh",
    candidateEmail: "tuandoan.anh@gmail.com",
    status: "submitted",
    scorePercent: 64,
    startedAtISO: new Date(NOW - 1.5 * HOUR).toISOString(),
    submittedAtISO: new Date(NOW - 10 * 60 * 1000).toISOString(),
    finalReview: "Pending",
    integrity: {
      leavingTabCount: 0,
      copyPasteCount: 0,
      devtoolsOpenCount: 0,
      multiInstanceCount: 0,
      multiMonitorFlag: false,
    },
  },

  // ------- sess-5 (Closing Onsite): one finished, one force-submitted -------
  {
    id: "sub-6",
    sessionId: "sess-5",
    candidateName: "Vu Thi Huong",
    candidateEmail: "huongvu.design@gmail.com",
    status: "submitted",
    scorePercent: 91,
    startedAtISO: new Date(NOW - 3 * HOUR).toISOString(),
    submittedAtISO: new Date(NOW - 2 * HOUR).toISOString(),
    finalReview: "Passed",
  },
  {
    id: "sub-7",
    sessionId: "sess-5",
    candidateName: "Lucas Bergman",
    candidateEmail: "lucas.bergman@example.com",
    status: "submitted",
    scorePercent: 38,
    startedAtISO: new Date(NOW - 3 * HOUR).toISOString(),
    submittedAtISO: new Date(NOW - 1 * HOUR).toISOString(),
    forceSubmitted: true,
    finalReview: "Failed",
    integrity: {
      leavingTabCount: 6,
      copyPasteCount: 3,
      devtoolsOpenCount: 1,
      multiInstanceCount: 0,
      multiMonitorFlag: true,
    },
    aiReviewerNotes:
      "Multiple high-risk integrity events (DevTools opened, multi-monitor detected). Recommend rejecting the submission and re-testing in a supervised environment.",
  },

  // ------- sess-6 (Completed Public): full graded cohort -------
  {
    id: "sub-8",
    sessionId: "sess-6",
    candidateName: "Olivia Park",
    candidateEmail: "olivia.park@example.com",
    status: "graded",
    scorePercent: 84,
    startedAtISO: new Date(NOW - 5 * DAY).toISOString(),
    submittedAtISO: new Date(NOW - 5 * DAY + 1 * HOUR).toISOString(),
    finalReview: "Passed",
    integrity: {
      leavingTabCount: 0,
      copyPasteCount: 1,
      devtoolsOpenCount: 0,
      multiInstanceCount: 0,
      multiMonitorFlag: false,
    },
  },
  {
    id: "sub-9",
    sessionId: "sess-6",
    candidateName: "Mateusz Kowalski",
    candidateEmail: "mateusz.k@example.com",
    status: "graded",
    scorePercent: 51,
    startedAtISO: new Date(NOW - 5 * DAY).toISOString(),
    submittedAtISO: new Date(NOW - 5 * DAY + 45 * 60 * 1000).toISOString(),
    finalReview: "Failed",
  },
  {
    id: "sub-10",
    sessionId: "sess-6",
    candidateName: "Hiroshi Tanaka",
    candidateEmail: "hiroshi.tanaka@example.com",
    status: "abandoned",
    startedAtISO: new Date(NOW - 5 * DAY).toISOString(),
    forceSubmitted: true,
    excludeReason: "Network drop — candidate disconnected and never returned.",
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __artMockTestsStore: Test[] | undefined;
  // eslint-disable-next-line no-var
  var __artMockTestSessionsStore: TestSession[] | undefined;
  // eslint-disable-next-line no-var
  var __artMockSubmissionsStore: Submission[] | undefined;
}

function tests(): Test[] {
  if (!globalThis.__artMockTestsStore) {
    globalThis.__artMockTestsStore = [...TESTS];
  }
  return globalThis.__artMockTestsStore;
}
function sessions(): TestSession[] {
  if (!globalThis.__artMockTestSessionsStore) {
    globalThis.__artMockTestSessionsStore = [...SESSIONS];
  }
  return globalThis.__artMockTestSessionsStore;
}
function subs(): Submission[] {
  if (!globalThis.__artMockSubmissionsStore) {
    globalThis.__artMockSubmissionsStore = [...SUBMISSIONS];
  }
  return globalThis.__artMockSubmissionsStore;
}

/* ---------- Tests ---------- */

export function listTests(): Test[] {
  return [...tests()].sort(
    (a, b) => Date.parse(b.updatedAtISO) - Date.parse(a.updatedAtISO)
  );
}
export function getTest(id: string): Test | undefined {
  return tests().find((t) => t.id === id);
}
export function addTest(t: Test): Test {
  tests().unshift(t);
  return t;
}
export function updateTest(id: string, patch: Partial<Test>): Test | undefined {
  const all = tests();
  const idx = all.findIndex((t) => t.id === id);
  if (idx === -1) return undefined;
  all[idx] = { ...all[idx], ...patch, updatedAtISO: new Date().toISOString() };
  return all[idx];
}
export function deleteTest(id: string): boolean {
  const all = tests();
  const idx = all.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  all.splice(idx, 1);
  return true;
}

/* ---------- Sessions ---------- */

export function listSessions(testId?: string): TestSession[] {
  return testId
    ? sessions().filter((s) => s.testId === testId)
    : [...sessions()];
}
export function getSession(id: string): TestSession | undefined {
  return sessions().find((s) => s.id === id);
}
export function addSession(s: TestSession): TestSession {
  sessions().unshift(s);
  return s;
}
export function deleteSession(id: string): boolean {
  const all = sessions();
  const idx = all.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  all.splice(idx, 1);
  return true;
}

/* ---------- Submissions ---------- */

export function listSubmissions(sessionId: string): Submission[] {
  return subs().filter((s) => s.sessionId === sessionId);
}
export function getSubmission(id: string): Submission | undefined {
  return subs().find((s) => s.id === id);
}
