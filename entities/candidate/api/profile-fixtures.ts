import type { CandidateProfileData } from "../model/profile";

/** Seed profile records — only a handful of the pipeline candidates
 *  have rich profile data. The rest fall back to a synthesised
 *  "minimal" profile generated from their pipeline row at read time. */

const SEED: CandidateProfileData[] = [
  {
    candidateId: "cnd-bao",
    general: {
      fullName: "Tran Gia Bao",
      email: "trangb@example.com",
      source: "LinkedIn",
      dateOfBirth: "1999-08-12",
      phone: "+84 90 123 4567",
      location: "Ho Chi Minh City, Vietnam",
      portfolio: "tim-cooke-portfolio-2k20",
    },
    skills: [
      { id: "sk-react", name: "ReactJS", tier: "must-have", score: 4 },
      { id: "sk-ts", name: "TypeScript", tier: "must-have", score: 4 },
      { id: "sk-py", name: "Python", tier: "must-have", score: 3 },
      { id: "sk-sql", name: "SQL", tier: "nice-to-have", score: 3 },
      { id: "sk-knockout", name: "Knockout", tier: "nice-to-have", score: 2 },
      { id: "sk-laravel", name: "Laravel", tier: "nice-to-have", score: 2 },
      { id: "sk-php", name: "PHP", tier: "nice-to-have", score: 0 },
      { id: "sk-cms", name: "CMS", tier: "nice-to-have", score: 0 },
      { id: "sk-html", name: "HTML", tier: "bonus", score: 5 },
      { id: "sk-maya", name: "Maya", tier: "bonus", score: 1 },
    ],
    missingSkills: [
      { name: "Django", tier: "must-have" },
      { name: "Tech XYZ", tier: "must-have" },
      { name: "Ruby (Junior)", tier: "must-have" },
      { name: "Mongo DB", tier: "must-have" },
      { name: "SQL", tier: "bonus" },
    ],
    unselectedSkills: [
      "Microsoft Information Service",
      "GraphQL",
      "GitLab",
      "Git Sub Module",
      "Kotlin",
      "AOS",
      "ASP",
      "SVG",
      "HTML",
      "Adobe",
      "Blender",
      "AWS",
      "Cosmos DB",
    ],
    education: [
      {
        id: "ed-1",
        institution: "Industrial University of Ho Chi Minh City",
        degreeLevel: "Bachelor",
        major: "Software Engineer",
        startDate: "2022-03-24",
        endDate: "2026-04-30",
        link: "",
        description:
          "Contributing to the open-source organization Young Monkeys in Vietnam through the EzyPlatform project, enabling users to build software with minimal programming by integrating plugins.",
      },
    ],
    experience: [
      {
        id: "ex-1",
        projectName: "Quick Quan Management System",
        company: "TechStars Solutions",
        role: "Software Engineer",
        location: "Ho Chi Minh City, Vietnam",
        headcount: 6,
        startDate: "2024-04-01",
        endDate: "2024-09-30",
        link: "",
        description:
          "Contributing to the open-source organization Young Monkeys in Vietnam through the EzyPlatform project, enabling users to build software with minimal programming by integrating plugins.",
      },
    ],
    cvUrl: "/cv/tran-gia-bao.pdf",
    pipeline: [
      {
        // Step 1 — CV Review (default, completed)
        stepId: "smp-step-cv",
        stageId: "smp-stage-inbox",
        bookedDateISO: undefined,
        reviewerIds: ["u-amelia", "u-marcus", "u-priya"],
        notifyReviewers: true,
        stepResult: "Passed",
        reviews: [
          {
            id: "rv-cv-1",
            reviewerId: "u-amelia",
            reviewerEmail: "amelia@art.com",
            submittedAtISO: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            note: "Strong CV — 3 production-ready React projects with measurable impact. Worth advancing.",
          },
          {
            id: "rv-cv-2",
            reviewerId: "u-marcus",
            reviewerEmail: "marcus@art.com",
            submittedAtISO: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            note: "Solid open-source contributions. Want to probe ownership of complex systems in the call.",
          },
        ],
      },
      {
        // Step 2 — Screening Call (default, in progress; Bao currently sits here)
        stepId: "smp-step-call",
        stageId: "smp-stage-screen",
        bookedDateISO: "2026-05-14",
        bookedTimeLabel: "10:00",
        reviewerIds: ["u-amelia", "u-marcus", "u-priya"],
        notifyReviewers: true,
        reviews: [
          {
            id: "rv-call-1",
            reviewerId: "u-amelia",
            reviewerEmail: "amelia@art.com",
            submittedAtISO: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            editedAtISO: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            note: "Project A is quite good and demonstrates ReactJS skills that fit the company, but the candidate's short job tenures mean we should carefully consider their long-term commitment.",
          },
        ],
      },
      {
        // Step 3 — Coding Test (test, scheduled)
        stepId: "smp-step-test",
        stageId: "smp-stage-screen",
        bookedDateISO: "2026-03-30",
        bookedTimeLabel: "08:30",
        reviewerIds: ["u-amelia", "u-marcus", "u-priya"],
        submissionId: "sub-1",
        reviews: [],
      },
      {
        // Step 4 — Portfolio / Tech Review (interview, with scorecard)
        stepId: "smp-step-portfolio",
        stageId: "smp-stage-onsite",
        bookedDateISO: "2026-04-10",
        bookedTimeLabel: "14:00",
        reviewerIds: ["u-sofia", "u-jonas", "u-marcus"],
        reviews: [
          {
            id: "rv-port-1",
            reviewerId: "u-sofia",
            reviewerEmail: "sofia@art.com",
            submittedAtISO: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            verdict: "Pass",
            overallScore: 6,
            note: "Excellent system design skills. Candidate has a clear and logical mindset.",
            criterionScores: [
              { criterionId: "smp-c-creativity", name: "Creativity", score: 8, note: "Strong design instinct." },
              { criterionId: "smp-c-brand", name: "Brand Sense", score: 6 },
              { criterionId: "smp-c-results", name: "Results Delivered", score: 7 },
            ],
          },
          {
            id: "rv-port-2",
            reviewerId: "u-jonas",
            reviewerEmail: "jonas@art.com",
            submittedAtISO: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            verdict: "Pass",
            overallScore: 7,
            note: "Good React code but lacks deep system knowledge. Do not agree with the requested salary.",
            criterionScores: [
              { criterionId: "smp-c-creativity", name: "Creativity", score: 9 },
              { criterionId: "smp-c-brand", name: "Brand Sense", score: 6 },
              { criterionId: "smp-c-results", name: "Results Delivered", score: 7 },
            ],
          },
          {
            id: "rv-port-3",
            reviewerId: "u-marcus",
            reviewerEmail: "marcus@art.com",
            submittedAtISO: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            verdict: "Fail",
            overallScore: 3,
            note: "Very poor communication skills; struggles to express ideas clearly.",
            criterionScores: [
              { criterionId: "smp-c-creativity", name: "Creativity", score: 4 },
              { criterionId: "smp-c-brand", name: "Brand Sense", score: 3 },
              { criterionId: "smp-c-results", name: "Results Delivered", score: 3 },
            ],
          },
        ],
        stepResult: "Considered",
        aiReviewerSummary:
          "Mixed signals across reviewers. Strong on system design and creativity (Sofia, Jonas) but flagged for poor communication and salary mismatch (Marcus). Consider a follow-up culture-fit conversation before moving forward.",
      },
    ],
    emailThreads: [
      {
        // Long thread initiated by HR — Technical Test invite + replies.
        id: "thr-tech-test",
        subject: "[Action Required] Technical Test for Tran Gia Bao",
        contextLabel: "Technical Test",
        contextHref: "#",
        stepId: "smp-step-test",
        messages: [
          {
            id: "msg-tt-1",
            from: "nguyenvana@gmail.com",
            fromVia: "precio-hr@preciofishbone.se",
            to: ["Precio test 's applications"],
            bcc: ["hiring_manager@preciofishbone.com"],
            sentAtISO: "2026-03-24T09:15:00.000Z",
            direction: "sent",
            body:
              "Hello candidate,\n\nPlease take the following engineering test using this link: https://link.com/123\n\nShould you have a viable connection, kindly call me.\n\nKind regards,\nNguyen Van A",
          },
          {
            id: "msg-tt-2",
            from: "trangb@example.com",
            to: ["nguyenvana@gmail.com"],
            sentAtISO: "2026-03-25T17:00:00.000Z",
            direction: "received",
            body:
              "Hello team,\n\nI have completed the assignment as instructed. I have attached the test results and the source code in this email. Please let me know if you need anything further from my side.\n\nThanks,\nGia Bao",
            attachments: [
              {
                name: "TestCaseTimeFormA_3232.png",
                size: "1.2 MB",
                type: "img",
              },
              {
                name: "Assignment.pdf",
                size: "2.8 MB",
                type: "pdf",
              },
            ],
          },
          {
            id: "msg-tt-3",
            from: "hiring_manager@preciofishbone.com",
            fromVia: "precio-hr@preciofishbone.se",
            to: ["trangb@example.com"],
            sentAtISO: "2026-03-26T07:30:00.000Z",
            direction: "sent",
            body:
              "Thanks for submitting the assignment. We will review and revert shortly.",
          },
        ],
      },
      {
        // Internal HR thread — discussing the candidate.
        id: "thr-discuss-health",
        subject: "Discussing the candidate Tran Gia Bao's health record issue",
        messages: [
          {
            id: "msg-dh-1",
            from: "amelia@art.com",
            to: ["marcus@art.com", "sofia@art.com"],
            sentAtISO: "2026-03-22T11:00:00.000Z",
            direction: "sent",
            body:
              "Bao mentioned a recurring health condition. Want to align on whether we need any accommodations for the onsite round.",
          },
          {
            id: "msg-dh-2",
            from: "marcus@art.com",
            to: ["amelia@art.com", "sofia@art.com"],
            sentAtISO: "2026-03-22T13:20:00.000Z",
            direction: "sent",
            body:
              "Sounds reasonable. I'll prep an alternative remote option as fallback.",
          },
        ],
      },
      {
        // Short thread — change of location.
        id: "thr-change-location",
        subject: "Change Location",
        contextLabel: "Change Location",
        messages: [
          {
            id: "msg-cl-1",
            from: "trangb@example.com",
            to: ["amelia@art.com"],
            sentAtISO: "2026-03-20T10:00:00.000Z",
            direction: "received",
            body:
              "Hi Amelia, would it be possible to move the onsite to your Hanoi office? My commute changed.",
          },
        ],
      },
      {
        // Inbox-only thread from candidate.
        id: "thr-cand-followup",
        subject: "Quick follow-up on Marketing Research Test",
        messages: [
          {
            id: "msg-fu-1",
            from: "trangb@example.com",
            to: ["precio-hr@preciofishbone.se"],
            sentAtISO: "2026-03-25T17:00:00.000Z",
            direction: "received",
            body:
              "Dear Marcus Petherson,\n\nI am writing back about the assignment regarding the Marketing Research Test. Let me know if you need the supporting documents shared in this email.\n\nBest regards,\nGia Bao",
          },
        ],
      },
    ],
    applicationHistory: [
      {
        id: "app-net-2023",
        programName: ".NET Fullstack Developer Hiring",
        jobTitle: ".NET Fullstack Developer",
        jobLevel: "Fresher",
        startDate: "2023-07-05",
        endDate: "2023-08-17",
        outcome: "Rejected",
        finalStep: "Interview - Technical Interview",
        reason:
          "The candidate did not meet the required standards during the technical interview, as evidenced by their performance on the technical test, which resulted in a failure to demonstrate the necessary skills and knowledge.",
        detailsHref: "#",
        aiInsight:
          "In 2023, candidate applied for a .NET Fullstack Developer role and failed the technical round due to critical gaps in System Design and Microservices architecture. Now re-applying 2 years later after a career pivot to Cloud Solutions Architect. Early screening indicates they have actively addressed these infrastructure gaps in their recent roles. Recommend the technical panel focus on real-world scaling scenarios to deeply validate this growth.",
        stageFeedback: [
          {
            stageName: "Senior CV Review",
            summary:
              "CV shows solid .NET fundamentals. Moving to technical round.",
          },
          {
            stageName: "Technical Interview",
            headlineScore: "4.5/10",
            summary:
              "Basic CRUD and .NET MVC are okay, but struggled heavily with distributed caching and microservices separation.",
            ratings: [
              { name: "React Ecosystem", value: "2/10", tone: "bad" },
              { name: "Microservices", value: "3/10", tone: "bad" },
              { name: "Database Design", value: "5.5/10", tone: "ok" },
              { name: "Communication", value: "6/10", tone: "ok" },
              { name: "Problem Solving", value: "5.5/10", tone: "ok" },
              { name: "System Architecture", value: "1.5/10", tone: "bad" },
            ],
            failureReason:
              "Failed technical criteria: Insufficient System Design and Architecture depth for the required level",
          },
        ],
      },
      {
        id: "app-react-2021",
        programName: "Precio Seed - 2022",
        jobTitle: "ReactJS Frontend",
        jobLevel: "Intern",
        startDate: "2021-12-12",
        endDate: "2022-01-10",
        outcome: "Withdrawn",
        finalStep: "Preliminary Test - Testing",
        reason:
          "The candidate has withdrawn their application and will not attend the interview.",
        detailsHref: "#",
        aiInsight:
          "Candidate withdrew at the preliminary stage citing scheduling conflicts. No technical signal recorded — treat as unevaluated.",
        stageFeedback: [
          {
            stageName: "Preliminary Test",
            summary:
              "Test invitation sent. Candidate did not start the test before the deadline.",
          },
        ],
      },
      {
        id: "app-cloud-current",
        programName: "Cloud Solutions Architect Hiring 2026",
        jobTitle: "Cloud Solutions Architect",
        jobLevel: "Senior",
        startDate: "2026-03-10",
        outcome: "On-going",
        finalStep: "Onsite - Portfolio / Tech Review",
        reason:
          "Currently progressing — sat the portfolio interview last week, awaiting hiring-manager round.",
        detailsHref: "#",
        aiInsight:
          "Candidate is a verified alumni of the .NET hiring round. Now re-applying for a Senior position after pivoting heavily to Cloud Infrastructure (AWS/Azure). Historical data confirms a strong work ethic; recommend fast-tracking to system-design rounds to assess architectural growth over the last 2 years.",
        stageFeedback: [
          {
            stageName: "Senior CV Review",
            summary:
              "Candidate has pivoted heavily to Cloud Infrastructure (AWS/Azure) in their recent job. Highly motivated to demonstrate their architectural growth.",
          },
          {
            stageName: "HR Phone Screen",
            headlineScore: "8/10",
            summary:
              "Candidate had a great 1-year run with us previously before leaving for a startup. Excited to return.",
            ratings: [
              { name: "Motivation", value: "9/10", tone: "good" },
              { name: "Expectation Alignment", value: "7/10", tone: "good" },
              { name: "Job Impact", value: "5.5/10", tone: "ok" },
            ],
            outcomeChip: "Passed",
          },
          {
            stageName: "Test",
            headlineScore: "Passed",
            summary:
              "Candidate cleared the architecture diagnostic with strong scores across the board.",
            ratings: [{ name: "Bot Pre-Test Q1", value: "74/100", tone: "good" }],
            outcomeChip: "Passed",
          },
        ],
      },
    ],
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __artMockCandidateProfilesStore: CandidateProfileData[] | undefined;
}

function store(): CandidateProfileData[] {
  if (!globalThis.__artMockCandidateProfilesStore) {
    globalThis.__artMockCandidateProfilesStore = [...SEED];
  }
  return globalThis.__artMockCandidateProfilesStore;
}

export function getCandidateProfile(
  candidateId: string
): CandidateProfileData | undefined {
  return store().find((p) => p.candidateId === candidateId);
}

export function upsertCandidateProfile(
  data: CandidateProfileData
): CandidateProfileData {
  const all = store();
  const idx = all.findIndex((p) => p.candidateId === data.candidateId);
  if (idx === -1) {
    all.push(data);
  } else {
    all[idx] = data;
  }
  return data;
}

/** Synthesise a minimal profile from the pipeline row when no rich
 *  profile has been seeded — keeps the detail page from 404'ing on
 *  every other candidate in the demo. */
export function defaultProfileFor(
  candidateId: string,
  name: string,
  email: string
): CandidateProfileData {
  return {
    candidateId,
    general: { fullName: name, email },
    skills: [],
    missingSkills: [],
    unselectedSkills: [],
    education: [],
    experience: [],
  };
}
