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

const SESSIONS: TestSession[] = Array.from({ length: 8 }, (_, i) => ({
  id: `sess-${i + 1}`,
  testId: "test-data-scientist",
  name: "Data Scientist Intern – Recruitment Assessment",
  type: "Public",
  status: "Active",
  accessCode: "9876xy",
  startISO: new Date(NOW + 2 * DAY).toISOString(),
  endISO: new Date(NOW + 9 * DAY).toISOString(),
}));

const SUBMISSIONS: Submission[] = [
  {
    id: "sub-1",
    sessionId: "sess-1",
    candidateName: "Tran Gia Bao",
    candidateEmail: "trangb@example.com",
    status: "graded",
    scorePercent: 88,
    startedAtISO: new Date(NOW - 1 * HOUR).toISOString(),
    submittedAtISO: new Date(NOW - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "sub-2",
    sessionId: "sess-1",
    candidateName: "Nguyen Thi Mai",
    candidateEmail: "mainguyen.dev@gmail.com",
    status: "submitted",
    scorePercent: 72,
    startedAtISO: new Date(NOW - 2 * HOUR).toISOString(),
    submittedAtISO: new Date(NOW - 1 * HOUR).toISOString(),
  },
  {
    id: "sub-3",
    sessionId: "sess-1",
    candidateName: "Le Hoang Nam",
    candidateEmail: "nam.lehoang@yahoo.com",
    status: "in-progress",
    startedAtISO: new Date(NOW - 12 * 60 * 1000).toISOString(),
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
