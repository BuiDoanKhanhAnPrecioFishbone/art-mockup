export type CandidateStatus = "on-going" | "passed" | "failed" | "withdrawn";
export type MatchLevel = "high" | "mid" | "low";
export type GroupLabel = "high-priority" | "mid-priority" | "low-priority" | "";

export interface PipelineStep {
  id: string;
  name: string;
  description: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  steps: PipelineStep[];
}

export interface Reviewer {
  id: string;
  name: string;
  initials: string;
  color: string; // tailwind bg color class e.g. "bg-blue-500"
}

export interface Candidate {
  id: string;
  programId: string;
  name: string;
  email: string;
  status: CandidateStatus;
  matchedKeywords: number; // 0-100
  groupLabel: GroupLabel;
  bookedDate: string | null; // "HH:mm, YYYY-MM-DD"
  testResult: string | null; // e.g. "Passed", "Failed", "Unfinished", null
  stageId: string;
  stepId: string;
  reviewers: Reviewer[];
  note?: string;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "preliminary-test",
    name: "Preliminary Test",
    steps: [
      {
        id: "contact-schedule",
        name: "Contact & schedule date",
        description: "Reach out to candidates and schedule their preliminary test date and time.",
      },
      {
        id: "send-confirmation-email",
        name: "Send confirmation email",
        description: "Send a confirmation email with test details, date, and instructions to the candidate.",
      },
      {
        id: "testing",
        name: "Testing",
        description: "Candidate completes the preliminary test under the designated conditions.",
      },
      {
        id: "test-result-review",
        name: "Test result review",
        description: "Reviewers evaluate the candidate's test results against criteria.",
      },
      {
        id: "send-result-to-applicants",
        name: "Send result to applicants",
        description: "Notify candidates of their test result outcome via email.",
      },
    ],
  },
  {
    id: "cv-review",
    name: "CV Review",
    steps: [
      {
        id: "senior-cv-review",
        name: "Senior CV Review",
        description: "Senior team members conduct an in-depth review of the candidate's CV.",
      },
      {
        id: "preliminary-cv-review",
        name: "Preliminary CV Review",
        description: "Initial screening of CV for minimum qualifications and red flags.",
      },
    ],
  },
  {
    id: "interview",
    name: "Interview",
    steps: [
      {
        id: "interview-contact-schedule",
        name: "Contact & schedule date",
        description: "Reach out to candidates to schedule their interview date and time.",
      },
      {
        id: "interview-session",
        name: "Interview",
        description: "Conduct the structured interview session with the candidate.",
      },
      {
        id: "interview-result-review",
        name: "Interview result review",
        description: "Interviewers consolidate feedback and assess the candidate's performance.",
      },
    ],
  },
  {
    id: "review-conclusion",
    name: "Review & Conclusion",
    steps: [
      {
        id: "final-review",
        name: "Final review",
        description: "Cross-functional team meets to finalize candidate evaluation.",
      },
      {
        id: "send-offer",
        name: "Send offer",
        description: "Prepare and dispatch the formal job offer to selected candidates.",
      },
    ],
  },
];

export const REVIEWERS: Reviewer[] = [
  { id: "rv-1", name: "An Nguyen", initials: "AN", color: "bg-blue-500" },
  { id: "rv-2", name: "Minh Tran", initials: "MT", color: "bg-green-500" },
  { id: "rv-3", name: "Linh Pham", initials: "LP", color: "bg-purple-500" },
  { id: "rv-4", name: "Bao Le", initials: "BL", color: "bg-orange-500" },
  { id: "rv-5", name: "Thu Vu", initials: "TV", color: "bg-pink-500" },
];

export const candidates: Candidate[] = [
  // 1. Tran Gia Bao – cv-review / senior-cv-review
  {
    id: "cand-001",
    programId: "prog-001",
    name: "Tran Gia Bao",
    email: "trangb@example.com",
    status: "on-going",
    matchedKeywords: 92,
    groupLabel: "high-priority",
    bookedDate: "09:00, 2026-01-25",
    testResult: null,
    stageId: "cv-review",
    stepId: "senior-cv-review",
    reviewers: [REVIEWERS[0], REVIEWERS[2]],
    note: "Strong marketing background. Fast-tracked for senior review.",
  },
  // 2. Nguyen Thi Mai – cv-review / preliminary-cv-review
  {
    id: "cand-002",
    programId: "prog-001",
    name: "Nguyen Thi Mai",
    email: "mainguyen.dev@gmail.com",
    status: "on-going",
    matchedKeywords: 78,
    groupLabel: "",
    bookedDate: null,
    testResult: null,
    stageId: "cv-review",
    stepId: "preliminary-cv-review",
    reviewers: [REVIEWERS[1]],
  },
  // 3. Le Hoang Nam – preliminary-test / contact-schedule
  {
    id: "cand-003",
    programId: "prog-001",
    name: "Le Hoang Nam",
    email: "nam.lehoang@yahoo.com",
    status: "on-going",
    matchedKeywords: 88,
    groupLabel: "high-priority",
    bookedDate: "14:30, 2026-03-28",
    testResult: null,
    stageId: "preliminary-test",
    stepId: "contact-schedule",
    reviewers: [REVIEWERS[0], REVIEWERS[3]],
    note: "Highly recommended by referral.",
  },
  // 4. Pham Van Kien – preliminary-test / test-result-review
  {
    id: "cand-004",
    programId: "prog-001",
    name: "Pham Van Kien",
    email: "kienpv_99@outlook.com",
    status: "on-going",
    matchedKeywords: 45,
    groupLabel: "low-priority",
    bookedDate: null,
    testResult: "Unfinished",
    stageId: "preliminary-test",
    stepId: "test-result-review",
    reviewers: [REVIEWERS[1]],
  },
  // 5. Vu Thi Huong – interview / contact-schedule
  {
    id: "cand-005",
    programId: "prog-001",
    name: "Vu Thi Huong",
    email: "huongvu.design@gmail.com",
    status: "on-going",
    matchedKeywords: 95,
    groupLabel: "high-priority",
    bookedDate: null,
    testResult: "Passed",
    stageId: "interview",
    stepId: "interview-contact-schedule",
    reviewers: [REVIEWERS[0], REVIEWERS[2], REVIEWERS[4]],
    note: "Top scorer on preliminary test.",
  },
  // 6. Doan Tuan Anh – interview / interview-result-review
  {
    id: "cand-006",
    programId: "prog-001",
    name: "Doan Tuan Anh",
    email: "tuandoan.anh@gmail.com",
    status: "on-going",
    matchedKeywords: 60,
    groupLabel: "mid-priority",
    bookedDate: "10:00, 2026-03-26",
    testResult: "Passed",
    stageId: "interview",
    stepId: "interview-result-review",
    reviewers: [REVIEWERS[3]],
  },
  // 7. Elena Rostova – interview / interview-session
  {
    id: "cand-007",
    programId: "prog-001",
    name: "Elena Rostova",
    email: "elena.r@international.com",
    status: "on-going",
    matchedKeywords: 30,
    groupLabel: "",
    bookedDate: null,
    testResult: "Passed",
    stageId: "interview",
    stepId: "interview-session",
    reviewers: [REVIEWERS[2]],
  },
  // 8. Hoang Minh Khoa – preliminary-test / testing
  {
    id: "cand-008",
    programId: "prog-001",
    name: "Hoang Minh Khoa",
    email: "khoahmk@example.com",
    status: "on-going",
    matchedKeywords: 72,
    groupLabel: "mid-priority",
    bookedDate: "13:00, 2026-03-30",
    testResult: null,
    stageId: "preliminary-test",
    stepId: "testing",
    reviewers: [REVIEWERS[1], REVIEWERS[4]],
  },
  // 9. Thi Bich Ngoc – preliminary-test / send-confirmation-email
  {
    id: "cand-009",
    programId: "prog-001",
    name: "Thi Bich Ngoc",
    email: "ngocbich.thi@gmail.com",
    status: "on-going",
    matchedKeywords: 65,
    groupLabel: "mid-priority",
    bookedDate: "09:30, 2026-04-02",
    testResult: null,
    stageId: "preliminary-test",
    stepId: "send-confirmation-email",
    reviewers: [REVIEWERS[0]],
  },
  // 10. Carlos Reyes – preliminary-test / testing
  {
    id: "cand-010",
    programId: "prog-001",
    name: "Carlos Reyes",
    email: "carlos.reyes@workmail.com",
    status: "on-going",
    matchedKeywords: 55,
    groupLabel: "low-priority",
    bookedDate: "15:00, 2026-04-01",
    testResult: null,
    stageId: "preliminary-test",
    stepId: "testing",
    reviewers: [REVIEWERS[3]],
  },
];
