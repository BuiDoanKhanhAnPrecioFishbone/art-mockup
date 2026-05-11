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
  // ----- Tests referenced by the sample workflow's Test step -----
  // The default workflow's `smp-step-test` references these two ids
  // (see entities/program/model/sample-workflow.ts) so every program
  // that uses the sample workflow can render real test sessions in
  // its Sessions tab.
  {
    id: "test-coding-basics",
    title: "Coding Basics — Backend",
    type: "Recruitment",
    status: "Published",
    durationMinutes: 90,
    tags: ["Backend", "JavaScript", "Algorithms"],
    description:
      "Take-home coding assessment focused on string handling, async control flow, and clean-code fundamentals. Used as the screening test for backend / fullstack programs.",
    passRatioPercent: 70,
    canSkipQuestion: true,
    compositionMode: "static",
    staticQuestions: [
      { questionId: "q-validate-string", order: 0 },
      { questionId: "q-async-multithread", order: 1 },
      { questionId: "q-clean-code", order: 2 },
      { questionId: "q-csharp-linq", order: 3 },
    ],
    dynamicConditions: [],
    shuffleQuestions: false,
    createdAtISO: new Date(NOW - 90 * DAY).toISOString(),
    updatedAtISO: new Date(NOW - 14 * DAY).toISOString(),
  },
  {
    id: "test-marketing-quiz",
    title: "Marketing Fundamentals Quiz",
    type: "Recruitment",
    status: "Published",
    durationMinutes: 45,
    tags: ["Marketing", "Quiz"],
    description:
      "Multiple-choice assessment covering brand sense, campaign basics, and analytics literacy. Used by marketing intern + recruiter programs.",
    passRatioPercent: 65,
    canSkipQuestion: true,
    compositionMode: "static",
    staticQuestions: [
      { questionId: "q-mc-qa", order: 0 },
      { questionId: "q-clean-code", order: 1 },
    ],
    dynamicConditions: [],
    shuffleQuestions: true,
    createdAtISO: new Date(NOW - 60 * DAY).toISOString(),
    updatedAtISO: new Date(NOW - 7 * DAY).toISOString(),
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

const SESSIONS: TestSession[] = [
  ...SESSION_STATUS_SEEDS.map((seed, i) => ({
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
  })),

  // ============================================================
  // Program-tied sessions — these are the ones the Sessions tab
  // inside each Program detail surfaces, because their testIds
  // match the workflow's Test step (`smp-step-test`, see
  // entities/program/model/sample-workflow.ts).
  // ============================================================

  // backend-dev-r1-2026 — Active cohort the backend candidates are
  // currently sitting in.
  {
    id: "sess-bd-coding-active",
    testId: "test-coding-basics",
    name: "Backend R1 — Coding Basics (Active cohort)",
    type: "Public",
    status: "Active",
    accessCode: "bdcode26",
    description:
      "Take-home coding screen for the Backend Developer Round 1 program. 90-minute window, 4 questions.",
    refreshAccessCodeMinutes: 0,
    startISO: new Date(NOW - 2 * DAY).toISOString(),
    endISO: new Date(NOW + 5 * DAY).toISOString(),
  },
  // Older cohort, fully graded — drives a populated history view.
  {
    id: "sess-bd-coding-completed",
    testId: "test-coding-basics",
    name: "Backend R1 — Coding Basics (Feb cohort)",
    type: "Public",
    status: "Completed",
    accessCode: "bdfeb26",
    description: "Earlier completed cohort for the same program.",
    refreshAccessCodeMinutes: 0,
    startISO: new Date(NOW - 60 * DAY).toISOString(),
    endISO: new Date(NOW - 53 * DAY).toISOString(),
    actualEndISO: new Date(NOW - 53 * DAY).toISOString(),
  },
  // Onsite supervised round for the small shortlist.
  {
    id: "sess-bd-coding-onsite",
    testId: "test-coding-basics",
    name: "Backend R1 — Onsite Supervised (Closing)",
    type: "Private Onsite",
    status: "Closing",
    accessCode: "bdonsite",
    description:
      "Hall closed — last two candidates still typing. HR can force-complete the session from here.",
    refreshAccessCodeMinutes: 30,
    startISO: new Date(NOW - 1 * DAY).toISOString(),
    endISO: new Date(NOW + 2 * HOUR).toISOString(),
  },

  // q1-marketing-hiring — current quiz cohort.
  {
    id: "sess-mkt-quiz-active",
    testId: "test-marketing-quiz",
    name: "Q1 Marketing — Fundamentals Quiz (Active)",
    type: "Public",
    status: "Active",
    accessCode: "mktq126",
    description:
      "45-minute multiple-choice quiz for the Q1 Marketing Intern program.",
    refreshAccessCodeMinutes: 0,
    startISO: new Date(NOW - 3 * DAY).toISOString(),
    endISO: new Date(NOW + 4 * DAY).toISOString(),
  },

  // precio-seed-q3-2026 — opens later, no submissions yet.
  {
    id: "sess-precio-coding-upcoming",
    testId: "test-coding-basics",
    name: "Precio Seed Q3 — Coding Basics (Upcoming)",
    type: "Public",
    status: "Upcoming",
    accessCode: "preq326",
    description: "Scheduled to open when the Precio Seed Q3 program goes live.",
    refreshAccessCodeMinutes: 0,
    startISO: new Date(NOW + 30 * DAY).toISOString(),
    endISO: new Date(NOW + 37 * DAY).toISOString(),
  },

  // se-summercamp-2023 — closed program, historical session for audits.
  {
    id: "sess-se-summer-2023",
    testId: "test-coding-basics",
    name: "SE SummerCamp 2023 — Coding Basics (Closed)",
    type: "Public",
    status: "Completed",
    accessCode: "se23camp",
    description:
      "Historical record from the SummerCamp 2023 program. Locked.",
    refreshAccessCodeMinutes: 0,
    startISO: new Date(NOW - 730 * DAY).toISOString(),
    endISO: new Date(NOW - 723 * DAY).toISOString(),
    actualEndISO: new Date(NOW - 723 * DAY).toISOString(),
  },
];

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

  // ============================================================
  // Program-tied submissions — every backend candidate has a slot
  // in `sess-bd-coding-active` so the Sessions tab on the program
  // detail page shows realistic counts (Pending / Under Review /
  // Done / Total Assign) and the Submission Candidates view has
  // every state to demo.
  // ============================================================

  // sess-bd-coding-active — Active Public, the one to demo most.
  {
    id: "sub-bd-bao",
    sessionId: "sess-bd-coding-active",
    candidateId: "cnd-bao",
    candidateName: "Tran Gia Bao",
    candidateEmail: "trangb@example.com",
    status: "submitted",
    scorePercent: 88,
    startedAtISO: new Date(NOW - 1 * HOUR).toISOString(),
    submittedAtISO: new Date(NOW - 30 * 60 * 1000).toISOString(),
    finalReview: "Pending",
    integrity: {
      leavingTabCount: 1,
      copyPasteCount: 0,
      devtoolsOpenCount: 0,
      multiInstanceCount: 0,
      multiMonitorFlag: false,
    },
    skillBreakdown: [
      { skill: "JavaScript", percent: 92 },
      { skill: "Algorithms", percent: 85 },
      { skill: "Clean Code", percent: 80 },
    ],
    questionResults: [
      qr("q-validate-string", "Validate a String with Regular Expressions", "javascript", "Easy", ["JavaScript"], 10, 10),
      qr("q-async-multithread", "Async vs Multithread", "essay", "Easy", ["Async"], 8, 10),
      qr("q-clean-code", "Clean code best practices", "essay", "Easy", ["Clean Code"], 7, 10),
      qr("q-csharp-linq", "Group and aggregate orders with LINQ", "csharp", "Medium", ["LINQ"], 9, 10),
    ],
    answers: {
      "q-validate-string":
        "function isValidEmail(input) {\n  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(input);\n}\n\nmodule.exports = { isValidEmail };",
      "q-async-multithread":
        "Async (event-loop, single-threaded) is best for I/O-bound work — file reads, DB queries, network calls — because the runtime can yield while waiting and serve other requests. Multi-threading is best for CPU-bound parallelism — image processing, matrix math, encoding — where you split the work across cores. In Node we'd use Worker Threads for CPU work; in Python we'd reach for multiprocessing because of the GIL.",
      "q-clean-code":
        "I keep functions short (<20 lines), name them after WHAT they do (not HOW), prefer pure functions where possible, and use guard-clauses to flatten nested conditionals. Names are picked to remove the need for comments — `isPaidCustomer` over `flag`. PRs always go through review and follow the team's style guide for consistency.",
      "q-csharp-linq":
        "public static Dictionary<int, decimal> Totals(IEnumerable<Order> orders) =>\n    orders.GroupBy(o => o.CustomerId)\n          .ToDictionary(g => g.Key, g => g.Sum(o => o.Total));",
    },
    aiReviewerNotes:
      "Strong technical foundation. Clean async/await usage and tight regex implementation. The clean-code essay was a touch generic — I'd probe for concrete examples in the call.",
  },
  {
    id: "sub-bd-mai",
    sessionId: "sess-bd-coding-active",
    candidateId: "cnd-mai",
    candidateName: "Nguyen Thi Mai",
    candidateEmail: "mainguyen.dev@gmail.com",
    status: "graded",
    scorePercent: 94,
    startedAtISO: new Date(NOW - 4 * DAY).toISOString(),
    submittedAtISO: new Date(NOW - 4 * DAY + 75 * 60 * 1000).toISOString(),
    finalReview: "Passed",
    integrity: {
      leavingTabCount: 0,
      copyPasteCount: 0,
      devtoolsOpenCount: 0,
      multiInstanceCount: 0,
      multiMonitorFlag: false,
    },
    skillBreakdown: [
      { skill: "JavaScript", percent: 95 },
      { skill: "Algorithms", percent: 96 },
      { skill: "Clean Code", percent: 92 },
    ],
    questionResults: [
      qr("q-validate-string", "Validate a String with Regular Expressions", "javascript", "Easy", ["JavaScript"], 10, 10),
      qr("q-async-multithread", "Async vs Multithread", "essay", "Easy", ["Async"], 9, 10),
      qr("q-clean-code", "Clean code best practices", "essay", "Easy", ["Clean Code"], 9, 10),
      qr("q-csharp-linq", "Group and aggregate orders with LINQ", "csharp", "Medium", ["LINQ"], 10, 10),
    ],
    aiReviewerNotes:
      "Top-of-stack performance across every question. Promote on strength alone; the offer step is justified.",
  },
  {
    id: "sub-bd-nam",
    sessionId: "sess-bd-coding-active",
    candidateId: "cnd-nam",
    candidateName: "Le Hoang Nam",
    candidateEmail: "nam.lehoang@yahoo.com",
    status: "in-progress",
    startedAtISO: new Date(NOW - 35 * 60 * 1000).toISOString(),
  },
  {
    id: "sub-bd-kien",
    sessionId: "sess-bd-coding-active",
    candidateId: "cnd-kien",
    candidateName: "Pham Van Kien",
    candidateEmail: "kienpv_99@outlook.com",
    status: "graded",
    scorePercent: 81,
    startedAtISO: new Date(NOW - 3 * DAY).toISOString(),
    submittedAtISO: new Date(NOW - 3 * DAY + 80 * 60 * 1000).toISOString(),
    finalReview: "Passed",
    integrity: {
      leavingTabCount: 2,
      copyPasteCount: 1,
      devtoolsOpenCount: 0,
      multiInstanceCount: 0,
      multiMonitorFlag: false,
    },
    skillBreakdown: [
      { skill: "JavaScript", percent: 84 },
      { skill: "Algorithms", percent: 78 },
      { skill: "Clean Code", percent: 80 },
    ],
    questionResults: [
      qr("q-validate-string", "Validate a String with Regular Expressions", "javascript", "Easy", ["JavaScript"], 9, 10),
      qr("q-async-multithread", "Async vs Multithread", "essay", "Easy", ["Async"], 7, 10),
      qr("q-clean-code", "Clean code best practices", "essay", "Easy", ["Clean Code"], 8, 10),
      qr("q-csharp-linq", "Group and aggregate orders with LINQ", "csharp", "Medium", ["LINQ"], 8, 10),
    ],
  },
  {
    id: "sub-bd-huong",
    sessionId: "sess-bd-coding-active",
    candidateId: "cnd-huong",
    candidateName: "Vu Thi Huong",
    candidateEmail: "huongvu.design@gmail.com",
    status: "submitted",
    scorePercent: 71,
    startedAtISO: new Date(NOW - 1 * DAY).toISOString(),
    submittedAtISO: new Date(NOW - 1 * DAY + 85 * 60 * 1000).toISOString(),
    finalReview: "Under Review",
    integrity: {
      leavingTabCount: 4,
      copyPasteCount: 2,
      devtoolsOpenCount: 0,
      multiInstanceCount: 0,
      multiMonitorFlag: false,
    },
    skillBreakdown: [
      { skill: "JavaScript", percent: 72 },
      { skill: "Algorithms", percent: 70 },
      { skill: "Clean Code", percent: 71 },
    ],
    questionResults: [
      qr("q-validate-string", "Validate a String with Regular Expressions", "javascript", "Easy", ["JavaScript"], 8, 10),
      qr("q-async-multithread", "Async vs Multithread", "essay", "Easy", ["Async"], 7, 10),
      qr("q-clean-code", "Clean code best practices", "essay", "Easy", ["Clean Code"], 6, 10),
      qr("q-csharp-linq", "Group and aggregate orders with LINQ", "csharp", "Medium", ["LINQ"], 7, 10),
    ],
    aiReviewerNotes:
      "Borderline pass. Multiple tab-switches flagged — schedule a live coding follow-up to confirm independent work before deciding.",
  },
  {
    id: "sub-bd-anh",
    sessionId: "sess-bd-coding-active",
    candidateId: "cnd-anh",
    candidateName: "Doan Tuan Anh",
    candidateEmail: "tuandoan.anh@gmail.com",
    status: "graded",
    scorePercent: 48,
    startedAtISO: new Date(NOW - 5 * DAY).toISOString(),
    submittedAtISO: new Date(NOW - 5 * DAY + 90 * 60 * 1000).toISOString(),
    finalReview: "Failed",
    integrity: {
      leavingTabCount: 1,
      copyPasteCount: 0,
      devtoolsOpenCount: 0,
      multiInstanceCount: 0,
      multiMonitorFlag: false,
    },
    skillBreakdown: [
      { skill: "JavaScript", percent: 52 },
      { skill: "Algorithms", percent: 40 },
      { skill: "Clean Code", percent: 50 },
    ],
    questionResults: [
      qr("q-validate-string", "Validate a String with Regular Expressions", "javascript", "Easy", ["JavaScript"], 6, 10),
      qr("q-async-multithread", "Async vs Multithread", "essay", "Easy", ["Async"], 4, 10),
      qr("q-clean-code", "Clean code best practices", "essay", "Easy", ["Clean Code"], 5, 10),
      qr("q-csharp-linq", "Group and aggregate orders with LINQ", "csharp", "Medium", ["LINQ"], 4, 10),
    ],
    aiReviewerNotes:
      "Below pass threshold across all categories. Recommend rejecting for this round.",
  },
  {
    id: "sub-bd-elena",
    sessionId: "sess-bd-coding-active",
    candidateId: "cnd-elena",
    candidateName: "Elena Rodriguez",
    candidateEmail: "elena.r@international.com",
    status: "submitted",
    scorePercent: 79,
    startedAtISO: new Date(NOW - 2 * DAY).toISOString(),
    submittedAtISO: new Date(NOW - 2 * DAY + 70 * 60 * 1000).toISOString(),
    finalReview: "Pending",
    integrity: {
      leavingTabCount: 0,
      copyPasteCount: 0,
      devtoolsOpenCount: 0,
      multiInstanceCount: 0,
      multiMonitorFlag: false,
    },
    skillBreakdown: [
      { skill: "JavaScript", percent: 82 },
      { skill: "Algorithms", percent: 75 },
      { skill: "Clean Code", percent: 80 },
    ],
    questionResults: [
      qr("q-validate-string", "Validate a String with Regular Expressions", "javascript", "Easy", ["JavaScript"], 9, 10),
      qr("q-async-multithread", "Async vs Multithread", "essay", "Easy", ["Async"], 7, 10),
      qr("q-clean-code", "Clean code best practices", "essay", "Easy", ["Clean Code"], 7, 10),
      qr("q-csharp-linq", "Group and aggregate orders with LINQ", "csharp", "Medium", ["LINQ"], 8, 10),
    ],
  },
  {
    id: "sub-bd-james",
    sessionId: "sess-bd-coding-active",
    candidateId: "cnd-bao-final",
    candidateName: "James O'Brien",
    candidateEmail: "james.obrien@example.com",
    status: "graded",
    scorePercent: 90,
    startedAtISO: new Date(NOW - 6 * DAY).toISOString(),
    submittedAtISO: new Date(NOW - 6 * DAY + 70 * 60 * 1000).toISOString(),
    finalReview: "Passed",
    integrity: {
      leavingTabCount: 0,
      copyPasteCount: 0,
      devtoolsOpenCount: 0,
      multiInstanceCount: 0,
      multiMonitorFlag: false,
    },
  },
  {
    id: "sub-bd-sara",
    sessionId: "sess-bd-coding-active",
    candidateId: "cnd-rej-1",
    candidateName: "Sara Lee",
    candidateEmail: "sara.lee@example.com",
    status: "graded",
    scorePercent: 39,
    startedAtISO: new Date(NOW - 7 * DAY).toISOString(),
    submittedAtISO: new Date(NOW - 7 * DAY + 95 * 60 * 1000).toISOString(),
    forceSubmitted: true,
    finalReview: "Failed",
    integrity: {
      leavingTabCount: 8,
      copyPasteCount: 4,
      devtoolsOpenCount: 1,
      multiInstanceCount: 0,
      multiMonitorFlag: true,
    },
    aiReviewerNotes:
      "Multiple high-risk integrity events (DevTools, multi-monitor). Score is below pass threshold AND independence is unverified. Reject.",
  },
  {
    id: "sub-bd-lucas",
    sessionId: "sess-bd-coding-active",
    candidateId: "cnd-new-1",
    candidateName: "Lucas Bergman",
    candidateEmail: "lucas.bergman@example.com",
    status: "in-progress",
    startedAtISO: new Date(NOW - 12 * 60 * 1000).toISOString(),
  },
  {
    id: "sub-bd-emma",
    sessionId: "sess-bd-coding-active",
    candidateId: "cnd-new-2",
    candidateName: "Emma Schmidt",
    candidateEmail: "emma.schmidt@example.com",
    status: "in-progress",
    startedAtISO: new Date(NOW - 8 * 60 * 1000).toISOString(),
  },
  {
    id: "sub-bd-hiroshi",
    sessionId: "sess-bd-coding-active",
    candidateId: "cnd-new-3",
    candidateName: "Hiroshi Tanaka",
    candidateEmail: "hiroshi.tanaka@example.com",
    status: "abandoned",
    startedAtISO: new Date(NOW - 6 * HOUR).toISOString(),
    excludeReason:
      "Candidate started but never submitted; auto-abandoned at session end.",
  },

  // ============================================================
  // sess-bd-coding-completed — Older Feb cohort, all graded.
  // ============================================================
  {
    id: "sub-bdfeb-1",
    sessionId: "sess-bd-coding-completed",
    candidateName: "Khanh Truong",
    candidateEmail: "khanh.truong@example.com",
    status: "graded",
    scorePercent: 86,
    startedAtISO: new Date(NOW - 58 * DAY).toISOString(),
    submittedAtISO: new Date(NOW - 58 * DAY + 70 * 60 * 1000).toISOString(),
    finalReview: "Passed",
  },
  {
    id: "sub-bdfeb-2",
    sessionId: "sess-bd-coding-completed",
    candidateName: "Daniel Adler",
    candidateEmail: "daniel.adler@example.com",
    status: "graded",
    scorePercent: 73,
    startedAtISO: new Date(NOW - 58 * DAY).toISOString(),
    submittedAtISO: new Date(NOW - 58 * DAY + 80 * 60 * 1000).toISOString(),
    finalReview: "Passed",
  },
  {
    id: "sub-bdfeb-3",
    sessionId: "sess-bd-coding-completed",
    candidateName: "Petra Novak",
    candidateEmail: "petra.novak@example.com",
    status: "graded",
    scorePercent: 55,
    startedAtISO: new Date(NOW - 58 * DAY).toISOString(),
    submittedAtISO: new Date(NOW - 58 * DAY + 90 * 60 * 1000).toISOString(),
    finalReview: "Failed",
  },
  {
    id: "sub-bdfeb-4",
    sessionId: "sess-bd-coding-completed",
    candidateName: "Aiko Yamada",
    candidateEmail: "aiko.yamada@example.com",
    status: "graded",
    scorePercent: 91,
    startedAtISO: new Date(NOW - 58 * DAY).toISOString(),
    submittedAtISO: new Date(NOW - 58 * DAY + 65 * 60 * 1000).toISOString(),
    finalReview: "Passed",
  },
  {
    id: "sub-bdfeb-5",
    sessionId: "sess-bd-coding-completed",
    candidateName: "Marcus Whitfield",
    candidateEmail: "marcus.w@example.com",
    status: "graded",
    scorePercent: 42,
    startedAtISO: new Date(NOW - 58 * DAY).toISOString(),
    submittedAtISO: new Date(NOW - 58 * DAY + 88 * 60 * 1000).toISOString(),
    forceSubmitted: true,
    finalReview: "Failed",
    integrity: {
      leavingTabCount: 5,
      copyPasteCount: 3,
      devtoolsOpenCount: 0,
      multiInstanceCount: 0,
      multiMonitorFlag: false,
    },
  },

  // ============================================================
  // sess-bd-coding-onsite — Closing onsite, two still-typing
  // candidates demonstrate the force-complete flow.
  // ============================================================
  {
    id: "sub-bdonsite-1",
    sessionId: "sess-bd-coding-onsite",
    candidateName: "Mei-Lin Cheng",
    candidateEmail: "mei.cheng@example.com",
    status: "in-progress",
    startedAtISO: new Date(NOW - 70 * 60 * 1000).toISOString(),
  },
  {
    id: "sub-bdonsite-2",
    sessionId: "sess-bd-coding-onsite",
    candidateName: "Adrian Costa",
    candidateEmail: "adrian.costa@example.com",
    status: "submitted",
    scorePercent: 77,
    startedAtISO: new Date(NOW - 80 * 60 * 1000).toISOString(),
    submittedAtISO: new Date(NOW - 5 * 60 * 1000).toISOString(),
    finalReview: "Pending",
  },

  // ============================================================
  // sess-mkt-quiz-active — Q1 Marketing program quiz cohort.
  // ============================================================
  {
    id: "sub-mkt-olivia",
    sessionId: "sess-mkt-quiz-active",
    candidateId: "cnd-mkt-1",
    candidateName: "Olivia Park",
    candidateEmail: "olivia.park@example.com",
    status: "graded",
    scorePercent: 82,
    startedAtISO: new Date(NOW - 2 * DAY).toISOString(),
    submittedAtISO: new Date(NOW - 2 * DAY + 35 * 60 * 1000).toISOString(),
    finalReview: "Passed",
    skillBreakdown: [
      { skill: "Brand Sense", percent: 88 },
      { skill: "Campaign Basics", percent: 80 },
      { skill: "Analytics Literacy", percent: 78 },
    ],
    questionResults: [
      qr("q-mc-qa", "QA testing role", "multiple-choice", "Easy", ["Marketing"], 5, 5),
      qr("q-clean-code", "Best-practices framing", "essay", "Easy", ["Clean Code"], 6, 8),
    ],
  },
  {
    id: "sub-mkt-mateusz",
    sessionId: "sess-mkt-quiz-active",
    candidateId: "cnd-mkt-2",
    candidateName: "Mateusz Kowalski",
    candidateEmail: "mateusz.k@example.com",
    status: "submitted",
    scorePercent: 68,
    startedAtISO: new Date(NOW - 1 * DAY).toISOString(),
    submittedAtISO: new Date(NOW - 1 * DAY + 40 * 60 * 1000).toISOString(),
    finalReview: "Under Review",
    integrity: {
      leavingTabCount: 2,
      copyPasteCount: 1,
      devtoolsOpenCount: 0,
      multiInstanceCount: 0,
      multiMonitorFlag: false,
    },
  },
  {
    id: "sub-mkt-aisha",
    sessionId: "sess-mkt-quiz-active",
    candidateId: "cnd-mkt-3",
    candidateName: "Aisha Rahman",
    candidateEmail: "aisha.r@example.com",
    status: "graded",
    scorePercent: 95,
    startedAtISO: new Date(NOW - 3 * DAY).toISOString(),
    submittedAtISO: new Date(NOW - 3 * DAY + 25 * 60 * 1000).toISOString(),
    finalReview: "Passed",
    aiReviewerNotes:
      "Verified alumni — already moved to Hired stage. Quiz score reaffirms the offer call.",
  },

  // ============================================================
  // sess-se-summer-2023 — Closed historical session.
  // ============================================================
  {
    id: "sub-se-1",
    sessionId: "sess-se-summer-2023",
    candidateName: "Carla Mendoza",
    candidateEmail: "carla.mendoza@example.com",
    status: "graded",
    scorePercent: 89,
    startedAtISO: new Date(NOW - 728 * DAY).toISOString(),
    submittedAtISO: new Date(NOW - 728 * DAY + 70 * 60 * 1000).toISOString(),
    finalReview: "Passed",
  },
  {
    id: "sub-se-2",
    sessionId: "sess-se-summer-2023",
    candidateName: "Brandon Hill",
    candidateEmail: "brandon.hill@example.com",
    status: "graded",
    scorePercent: 60,
    startedAtISO: new Date(NOW - 728 * DAY).toISOString(),
    submittedAtISO: new Date(NOW - 728 * DAY + 85 * 60 * 1000).toISOString(),
    finalReview: "Failed",
  },
  {
    id: "sub-se-3",
    sessionId: "sess-se-summer-2023",
    candidateName: "Yui Nakamura",
    candidateEmail: "yui.nakamura@example.com",
    status: "graded",
    scorePercent: 78,
    startedAtISO: new Date(NOW - 728 * DAY).toISOString(),
    submittedAtISO: new Date(NOW - 728 * DAY + 80 * 60 * 1000).toISOString(),
    finalReview: "Passed",
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
