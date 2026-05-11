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
              { criterionId: "smp-c-storytelling", name: "Storytelling", score: 7 },
              { criterionId: "smp-c-strategy", name: "Strategic Thinking", score: 6 },
              { criterionId: "smp-c-craft", name: "Craft & Execution", score: 8, note: "Clean output, attention to detail." },
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
              { criterionId: "smp-c-storytelling", name: "Storytelling", score: 8 },
              { criterionId: "smp-c-strategy", name: "Strategic Thinking", score: 7 },
              { criterionId: "smp-c-craft", name: "Craft & Execution", score: 7 },
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
              { criterionId: "smp-c-storytelling", name: "Storytelling", score: 2, note: "Lost the thread several times." },
              { criterionId: "smp-c-strategy", name: "Strategic Thinking", score: 4 },
              { criterionId: "smp-c-craft", name: "Craft & Execution", score: 5 },
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
  // ============================================================
  // Reviewer-flow demo profiles — each one demonstrates a state
  // the Reviewer's Pipeline & Review tab needs to render:
  //
  //   - cnd-huong: interview step where Marcus (the demo
  //                "current reviewer") is assigned but HASN'T
  //                reviewed yet → the "Add my Review" path.
  //   - cnd-kien : test step linked to a graded submission so
  //                the "Go to Test Submission" link surfaces real
  //                question results.
  //   - cnd-mai  : full history — interview + test steps
  //                already reviewed by Marcus, candidate is now
  //                on the Offer step. Demos the "view-only"
  //                history flow per Doc 02 §2.5.
  //
  // Doc 08.2: interview reviews use 1-10 per-criterion scores
  // bucketed into 5 behavioural bands (1-2 / 3-4 / 5-6 / 7-8 /
  // 9-10). The scorecard for smp-step-portfolio is
  // `scorecard-marketing-portfolio` with three criteria —
  // Creativity / Brand Sense / Results Delivered (see
  // entities/program/model/sample-workflow.ts).
  // ============================================================
  {
    candidateId: "cnd-huong",
    general: {
      fullName: "Vu Thi Huong",
      email: "huongvu.design@gmail.com",
      source: "Referral",
      phone: "+84 91 555 0123",
      location: "Da Nang, Vietnam",
    },
    skills: [],
    missingSkills: [],
    unselectedSkills: [],
    education: [],
    experience: [],
    pipeline: [
      {
        stepId: "smp-step-cv",
        stageId: "smp-stage-inbox",
        reviewerIds: ["u-amelia"],
        stepResult: "Passed",
        reviews: [
          {
            id: "rv-huong-cv-1",
            reviewerId: "u-amelia",
            reviewerEmail: "amelia@art.com",
            submittedAtISO: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            note: "Strong design portfolio attached. Worth a screening call.",
          },
        ],
      },
      {
        stepId: "smp-step-call",
        stageId: "smp-stage-screen",
        bookedDateISO: "2026-05-04",
        bookedTimeLabel: "10:00",
        reviewerIds: ["u-amelia"],
        stepResult: "Passed",
        reviews: [
          {
            id: "rv-huong-call-1",
            reviewerId: "u-amelia",
            reviewerEmail: "amelia@art.com",
            submittedAtISO: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            note: "Solid screening call. Strong communicator, motivated.",
          },
        ],
      },
      {
        // Test step — linked to her existing submission so the
        // TestStepReviews block surfaces real score / integrity.
        stepId: "smp-step-test",
        stageId: "smp-stage-screen",
        bookedDateISO: "2026-05-08",
        bookedTimeLabel: "09:00",
        reviewerIds: ["u-marcus", "u-priya"],
        submissionId: "sub-bd-huong",
        stepResult: "Considered",
        reviews: [
          {
            id: "rv-huong-test-1",
            reviewerId: "u-priya",
            reviewerEmail: "priya@art.com",
            submittedAtISO: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
            note: "Score is at threshold but multiple tab-switches flagged. Recommend live coding before deciding.",
          },
        ],
      },
      {
        // Interview step — DEMO TARGET for "Add my Review". Marcus
        // is on the reviewer list but hasn't submitted his review
        // yet; Sofia + Jonas already have. Per Doc 02 §2.5's
        // blind-review rule, Marcus can't see their notes until he
        // submits his own — which is what the UI gates.
        stepId: "smp-step-portfolio",
        stageId: "smp-stage-onsite",
        bookedDateISO: "2026-05-11",
        bookedTimeLabel: "14:00",
        reviewerIds: ["u-sofia", "u-jonas", "u-marcus"],
        notifyReviewers: true,
        reviews: [
          {
            id: "rv-huong-port-1",
            reviewerId: "u-sofia",
            reviewerEmail: "sofia@art.com",
            submittedAtISO: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            verdict: "Pass",
            overallScore: 8,
            note: "Exceptional design instinct. Walked through 3 case studies — clear narrative, strong outcomes. Brand thinking is a step above what we usually see at this level.",
            criterionScores: [
              { criterionId: "smp-c-creativity", name: "Creativity", score: 9, note: "Surfaced unconventional angles repeatedly." },
              { criterionId: "smp-c-brand", name: "Brand Sense", score: 8 },
              { criterionId: "smp-c-storytelling", name: "Storytelling", score: 9, note: "Walked through case studies like a film — beginning, conflict, resolution." },
              { criterionId: "smp-c-strategy", name: "Strategic Thinking", score: 7 },
              { criterionId: "smp-c-craft", name: "Craft & Execution", score: 8 },
              { criterionId: "smp-c-results", name: "Results Delivered", score: 7 },
            ],
          },
          {
            id: "rv-huong-port-2",
            reviewerId: "u-jonas",
            reviewerEmail: "jonas@art.com",
            submittedAtISO: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            verdict: "Pass",
            overallScore: 7,
            note: "Strong overall. The results section was slightly soft on numbers — would push for more rigour in the next round.",
            criterionScores: [
              { criterionId: "smp-c-creativity", name: "Creativity", score: 7 },
              { criterionId: "smp-c-brand", name: "Brand Sense", score: 8 },
              { criterionId: "smp-c-storytelling", name: "Storytelling", score: 7 },
              { criterionId: "smp-c-strategy", name: "Strategic Thinking", score: 8, note: "Picks the right battles when scoping campaigns." },
              { criterionId: "smp-c-craft", name: "Craft & Execution", score: 7 },
              { criterionId: "smp-c-results", name: "Results Delivered", score: 6, note: "More quantitative proof would help." },
            ],
          },
          // Marcus (u-marcus) is NOT in this list yet — that's the
          // demo: he should see the "Add my Review" CTA, and the
          // existing two reviews stay locked behind the blind-
          // review veil until he submits his own.
        ],
        // stepResult intentionally not set — pending Marcus's
        // review before HR can issue the verdict.
      },
    ],
  },
  {
    candidateId: "cnd-kien",
    general: {
      fullName: "Pham Van Kien",
      email: "kienpv_99@outlook.com",
      source: "LinkedIn",
      location: "Ho Chi Minh City, Vietnam",
    },
    skills: [],
    missingSkills: [],
    unselectedSkills: [],
    education: [],
    experience: [],
    pipeline: [
      {
        stepId: "smp-step-cv",
        stageId: "smp-stage-inbox",
        reviewerIds: ["u-amelia"],
        stepResult: "Passed",
        reviews: [
          {
            id: "rv-kien-cv-1",
            reviewerId: "u-amelia",
            reviewerEmail: "amelia@art.com",
            submittedAtISO: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            note: "CV looks fine. Move to screening — let's confirm the year of experience claim.",
          },
        ],
      },
      {
        stepId: "smp-step-call",
        stageId: "smp-stage-screen",
        bookedDateISO: "2026-05-06",
        bookedTimeLabel: "11:00",
        reviewerIds: ["u-amelia"],
        stepResult: "Considered",
        reviews: [
          {
            id: "rv-kien-call-1",
            reviewerId: "u-amelia",
            reviewerEmail: "amelia@art.com",
            submittedAtISO: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            note: "Self-assessed experience runs ahead of what the CV proves. Move to test — score will be the deciding signal.",
          },
        ],
      },
      {
        // Test step — DEMO TARGET for "Go to Test Submission"
        // path. Linked to sub-bd-kien which is already graded
        // (81% / Passed), so the per-question review surfaces a
        // populated TestStepReviews + clickable link.
        stepId: "smp-step-test",
        stageId: "smp-stage-screen",
        bookedDateISO: "2026-05-08",
        bookedTimeLabel: "08:30",
        reviewerIds: ["u-marcus"],
        notifyReviewers: true,
        submissionId: "sub-bd-kien",
        reviews: [
          {
            id: "rv-kien-test-1",
            reviewerId: "u-marcus",
            reviewerEmail: "marcus@art.com",
            submittedAtISO: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            note: "81% across the board. Clean async usage; some inefficiency on the LINQ aggregation but nothing blocking. Recommend pass.",
            verdict: "Pass",
            overallScore: 8,
          },
        ],
        stepResult: "Passed",
      },
    ],
  },
  {
    candidateId: "cnd-mai",
    general: {
      fullName: "Nguyen Thi Mai",
      email: "mainguyen.dev@gmail.com",
      source: "Referral",
      location: "Ho Chi Minh City, Vietnam",
    },
    skills: [],
    missingSkills: [],
    unselectedSkills: [],
    education: [],
    experience: [],
    pipeline: [
      {
        stepId: "smp-step-cv",
        stageId: "smp-stage-inbox",
        reviewerIds: ["u-amelia"],
        stepResult: "Passed",
        reviews: [
          {
            id: "rv-mai-cv-1",
            reviewerId: "u-amelia",
            reviewerEmail: "amelia@art.com",
            submittedAtISO: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
            note: "Top-of-stack CV. Fast-track recommended.",
          },
        ],
      },
      {
        stepId: "smp-step-call",
        stageId: "smp-stage-screen",
        bookedDateISO: "2026-04-25",
        bookedTimeLabel: "10:00",
        reviewerIds: ["u-amelia"],
        stepResult: "Passed",
        reviews: [
          {
            id: "rv-mai-call-1",
            reviewerId: "u-amelia",
            reviewerEmail: "amelia@art.com",
            submittedAtISO: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            note: "Excellent communicator, deep async understanding, ready for the take-home.",
          },
        ],
      },
      {
        stepId: "smp-step-test",
        stageId: "smp-stage-screen",
        bookedDateISO: "2026-04-28",
        bookedTimeLabel: "09:00",
        reviewerIds: ["u-marcus", "u-priya"],
        submissionId: "sub-bd-mai",
        stepResult: "Passed",
        reviews: [
          {
            id: "rv-mai-test-1",
            reviewerId: "u-marcus",
            reviewerEmail: "marcus@art.com",
            submittedAtISO: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
            note: "94% with no integrity events. Promote on score alone.",
            verdict: "Pass",
            overallScore: 9,
          },
        ],
      },
      {
        // Interview step — fully reviewed by all 3 reviewers
        // including Marcus. Demos the "edit my review" / "view
        // all reviews" path.
        stepId: "smp-step-portfolio",
        stageId: "smp-stage-onsite",
        bookedDateISO: "2026-05-02",
        bookedTimeLabel: "14:00",
        reviewerIds: ["u-sofia", "u-jonas", "u-marcus"],
        notifyReviewers: true,
        stepResult: "Passed",
        reviews: [
          {
            id: "rv-mai-port-1",
            reviewerId: "u-sofia",
            reviewerEmail: "sofia@art.com",
            submittedAtISO: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
            verdict: "Pass",
            overallScore: 9,
            note: "Polished portfolio with measurable outcomes across all three case studies. Promote.",
            criterionScores: [
              { criterionId: "smp-c-creativity", name: "Creativity", score: 9 },
              { criterionId: "smp-c-brand", name: "Brand Sense", score: 9 },
              { criterionId: "smp-c-storytelling", name: "Storytelling", score: 8 },
              { criterionId: "smp-c-strategy", name: "Strategic Thinking", score: 9, note: "Clear framework for picking what to ship vs. cut." },
              { criterionId: "smp-c-craft", name: "Craft & Execution", score: 9 },
              { criterionId: "smp-c-results", name: "Results Delivered", score: 8 },
            ],
          },
          {
            id: "rv-mai-port-2",
            reviewerId: "u-jonas",
            reviewerEmail: "jonas@art.com",
            submittedAtISO: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
            verdict: "High Priority",
            overallScore: 9,
            note: "Best portfolio walkthrough we've had this cycle. Recommend High Priority + fast-track to offer.",
            criterionScores: [
              { criterionId: "smp-c-creativity", name: "Creativity", score: 10 },
              { criterionId: "smp-c-brand", name: "Brand Sense", score: 9 },
              { criterionId: "smp-c-storytelling", name: "Storytelling", score: 10, note: "Best narrative arc this cycle." },
              { criterionId: "smp-c-strategy", name: "Strategic Thinking", score: 9 },
              { criterionId: "smp-c-craft", name: "Craft & Execution", score: 9 },
              { criterionId: "smp-c-results", name: "Results Delivered", score: 9 },
            ],
          },
          {
            id: "rv-mai-port-3",
            reviewerId: "u-marcus",
            reviewerEmail: "marcus@art.com",
            submittedAtISO: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            verdict: "Pass",
            overallScore: 8,
            note: "Strong work. Some over-claiming on the SaaS case but the data backs most of it. Pass with confidence.",
            criterionScores: [
              { criterionId: "smp-c-creativity", name: "Creativity", score: 8 },
              { criterionId: "smp-c-brand", name: "Brand Sense", score: 8 },
              { criterionId: "smp-c-storytelling", name: "Storytelling", score: 7 },
              { criterionId: "smp-c-strategy", name: "Strategic Thinking", score: 8 },
              { criterionId: "smp-c-craft", name: "Craft & Execution", score: 9, note: "Tight, polished output even on the side projects." },
              { criterionId: "smp-c-results", name: "Results Delivered", score: 8 },
            ],
          },
        ],
        aiReviewerSummary:
          "All three reviewers Pass / High-Priority. Consistent strong signals across Creativity (8-10), Brand Sense (8-9), Storytelling (7-10), Strategic Thinking (8-9), Craft (9), and Results (8-9). Recommended: advance to Offer without further interviews.",
      },
      {
        stepId: "smp-step-offer",
        stageId: "smp-stage-offer",
        reviewerIds: ["u-amelia"],
        reviews: [],
        // Currently in flight on the Offer step — no review yet.
      },
    ],
  },
  // ============================================================
  // Compare-Hub demo profiles — wireframe 3228:224894 needs a
  // dense pool of candidates with reviews on the SAME interview
  // step so the side-by-side radar + score table render with
  // meaningful contrast.
  //
  // Existing candidates with portfolio (smp-step-portfolio)
  // reviews: cnd-bao (3 reviews), cnd-huong (2 reviews), cnd-mai
  // (3 reviews). Below we add three more so the modal's candidate
  // picker has six pickable rows — enough to demo 2-way, 3-way,
  // and "no comparable peers" empty-state transitions.
  //
  // The personas are deliberately divergent so the radar chart
  // separates clearly:
  //   - cnd-nam  : strategy / craft / results strong, creativity low
  //                → mirrors the wireframe's "Le Hoang Nam" foil.
  //   - cnd-anh  : middle-of-the-pack, no standout — demonstrates
  //                what an "average overlap" looks like.
  //   - cnd-bao-final ("James O'Brien", hired) : top-tier scores
  //                across the board — the "benchmark" row.
  // ============================================================
  {
    candidateId: "cnd-nam",
    general: {
      fullName: "Le Hoang Nam",
      email: "nam.lehoang@yahoo.com",
      source: "Job Board",
      location: "Hanoi, Vietnam",
    },
    skills: [],
    missingSkills: [],
    unselectedSkills: [],
    education: [],
    experience: [],
    pipeline: [
      {
        stepId: "smp-step-portfolio",
        stageId: "smp-stage-onsite",
        bookedDateISO: "2026-04-22",
        bookedTimeLabel: "11:00",
        reviewerIds: ["u-sofia", "u-jonas"],
        stepResult: "Considered",
        reviews: [
          {
            id: "rv-nam-port-1",
            reviewerId: "u-sofia",
            reviewerEmail: "sofia@art.com",
            submittedAtISO: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            verdict: "Consider",
            overallScore: 7,
            note: "Heavy on numbers and frameworks — light on the visual / narrative side. Will compete with creative-led candidates.",
            criterionScores: [
              { criterionId: "smp-c-creativity", name: "Creativity", score: 5 },
              { criterionId: "smp-c-brand", name: "Brand Sense", score: 6 },
              { criterionId: "smp-c-storytelling", name: "Storytelling", score: 5 },
              { criterionId: "smp-c-strategy", name: "Strategic Thinking", score: 9, note: "Clear, defensible framework for every decision." },
              { criterionId: "smp-c-craft", name: "Craft & Execution", score: 8 },
              { criterionId: "smp-c-results", name: "Results Delivered", score: 9 },
            ],
          },
          {
            id: "rv-nam-port-2",
            reviewerId: "u-jonas",
            reviewerEmail: "jonas@art.com",
            submittedAtISO: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
            verdict: "Pass",
            overallScore: 7,
            note: "An operator. Solid systems-thinker. Pairs well with a creative lead.",
            criterionScores: [
              { criterionId: "smp-c-creativity", name: "Creativity", score: 6 },
              { criterionId: "smp-c-brand", name: "Brand Sense", score: 6 },
              { criterionId: "smp-c-storytelling", name: "Storytelling", score: 6 },
              { criterionId: "smp-c-strategy", name: "Strategic Thinking", score: 9 },
              { criterionId: "smp-c-craft", name: "Craft & Execution", score: 8 },
              { criterionId: "smp-c-results", name: "Results Delivered", score: 9, note: "Receipts everywhere — every claim sourced." },
            ],
          },
        ],
      },
    ],
  },
  {
    candidateId: "cnd-anh",
    general: {
      fullName: "Doan Tuan Anh",
      email: "tuandoan.anh@gmail.com",
      source: "LinkedIn",
      location: "Ho Chi Minh City, Vietnam",
    },
    skills: [],
    missingSkills: [],
    unselectedSkills: [],
    education: [],
    experience: [],
    pipeline: [
      {
        // Test step — DEMO TARGET for the wireframe's 3/3 "Failed"
        // state (wireframe 3228:225272, bottom row). All 3
        // reviewers submitted. Linked to sub-bd-anh (48% / Failed,
        // 1 leaving-tab integrity flag) so the TestStepReviews
        // block surfaces real Question Breakdown numbers and the
        // Final Review banner shows a Fail verdict alongside the
        // reviewer chips.
        stepId: "smp-step-test",
        stageId: "smp-stage-screen",
        bookedDateISO: "2026-05-01",
        bookedTimeLabel: "09:00",
        reviewerIds: ["u-amelia", "u-marcus", "u-priya"],
        submissionId: "sub-bd-anh",
        stepResult: "Failed",
        reviews: [
          {
            id: "rv-anh-test-1",
            reviewerId: "u-amelia",
            reviewerEmail: "amelia@art.com",
            submittedAtISO: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            verdict: "Fail",
            overallScore: 4,
            note: "Below the 70% bar on every difficulty band. The async question essay was generic and the LINQ answer didn't compile. Recommend Fail.",
          },
          {
            id: "rv-anh-test-2",
            reviewerId: "u-marcus",
            reviewerEmail: "marcus@art.com",
            submittedAtISO: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
            verdict: "Fail",
            overallScore: 4,
            note: "Tab-switch event flagged during the LINQ section. Even setting integrity aside, the raw score doesn't clear the bar. Fail.",
          },
          {
            id: "rv-anh-test-3",
            reviewerId: "u-priya",
            reviewerEmail: "priya@art.com",
            submittedAtISO: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            verdict: "Fail",
            overallScore: 3,
            note: "Strong on Easy, collapsed on Medium and Hard. Not ready for this role. Concur with Fail.",
          },
        ],
        aiReviewerSummary:
          "Unanimous Fail. Score 48% (below the 70% threshold). One tab-switch event flagged. Recommended: reject and send template rejection email.",
      },
      {
        stepId: "smp-step-portfolio",
        stageId: "smp-stage-onsite",
        bookedDateISO: "2026-04-18",
        bookedTimeLabel: "15:00",
        reviewerIds: ["u-sofia", "u-marcus"],
        stepResult: "Passed",
        reviews: [
          {
            id: "rv-anh-port-1",
            reviewerId: "u-sofia",
            reviewerEmail: "sofia@art.com",
            submittedAtISO: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            verdict: "Pass",
            overallScore: 7,
            note: "Even across the board. No flashy peaks but no gaps either. Safe hire for the team.",
            criterionScores: [
              { criterionId: "smp-c-creativity", name: "Creativity", score: 7 },
              { criterionId: "smp-c-brand", name: "Brand Sense", score: 7 },
              { criterionId: "smp-c-storytelling", name: "Storytelling", score: 7 },
              { criterionId: "smp-c-strategy", name: "Strategic Thinking", score: 7 },
              { criterionId: "smp-c-craft", name: "Craft & Execution", score: 7 },
              { criterionId: "smp-c-results", name: "Results Delivered", score: 7 },
            ],
          },
          {
            id: "rv-anh-port-2",
            reviewerId: "u-marcus",
            reviewerEmail: "marcus@art.com",
            submittedAtISO: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
            verdict: "Pass",
            overallScore: 7,
            note: "Reliable second-chair candidate. Push to HM round to verify ownership instincts.",
            criterionScores: [
              { criterionId: "smp-c-creativity", name: "Creativity", score: 6 },
              { criterionId: "smp-c-brand", name: "Brand Sense", score: 7 },
              { criterionId: "smp-c-storytelling", name: "Storytelling", score: 7 },
              { criterionId: "smp-c-strategy", name: "Strategic Thinking", score: 8 },
              { criterionId: "smp-c-craft", name: "Craft & Execution", score: 7 },
              { criterionId: "smp-c-results", name: "Results Delivered", score: 7 },
            ],
          },
        ],
      },
    ],
  },
  {
    candidateId: "cnd-bao-final",
    general: {
      fullName: "James O'Brien",
      email: "james.obrien@example.com",
      source: "Referral",
      location: "Singapore",
    },
    skills: [],
    missingSkills: [],
    unselectedSkills: [],
    education: [],
    experience: [],
    pipeline: [
      {
        // Benchmark "what good looks like" row in the Compare Hub —
        // he was eventually hired, so his portfolio interview was
        // strong across the board.
        stepId: "smp-step-portfolio",
        stageId: "smp-stage-onsite",
        bookedDateISO: "2026-03-15",
        bookedTimeLabel: "10:00",
        reviewerIds: ["u-sofia", "u-jonas", "u-marcus"],
        stepResult: "Passed",
        reviews: [
          {
            id: "rv-james-port-1",
            reviewerId: "u-sofia",
            reviewerEmail: "sofia@art.com",
            submittedAtISO: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
            verdict: "High Priority",
            overallScore: 9,
            note: "Reference-quality portfolio walkthrough. Promote immediately.",
            criterionScores: [
              { criterionId: "smp-c-creativity", name: "Creativity", score: 9 },
              { criterionId: "smp-c-brand", name: "Brand Sense", score: 9 },
              { criterionId: "smp-c-storytelling", name: "Storytelling", score: 9 },
              { criterionId: "smp-c-strategy", name: "Strategic Thinking", score: 8 },
              { criterionId: "smp-c-craft", name: "Craft & Execution", score: 10, note: "Best craft we've seen this year." },
              { criterionId: "smp-c-results", name: "Results Delivered", score: 9 },
            ],
          },
          {
            id: "rv-james-port-2",
            reviewerId: "u-jonas",
            reviewerEmail: "jonas@art.com",
            submittedAtISO: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString(),
            verdict: "Pass",
            overallScore: 8,
            note: "Strong all-rounder. No concerns.",
            criterionScores: [
              { criterionId: "smp-c-creativity", name: "Creativity", score: 8 },
              { criterionId: "smp-c-brand", name: "Brand Sense", score: 9 },
              { criterionId: "smp-c-storytelling", name: "Storytelling", score: 8 },
              { criterionId: "smp-c-strategy", name: "Strategic Thinking", score: 9 },
              { criterionId: "smp-c-craft", name: "Craft & Execution", score: 9 },
              { criterionId: "smp-c-results", name: "Results Delivered", score: 8 },
            ],
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
