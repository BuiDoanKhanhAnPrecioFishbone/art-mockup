import type { ProgramEmail } from "../model/types";

/**
 * Seed program-email logs — drawn from the wireframe so the demo shows
 * realistic activity. Backed by globalThis so writes persist across
 * Next.js per-route bundles.
 */

const SEED: ProgramEmail[] = [
  {
    id: "pem-1",
    programId: "*",
    logName: "Reviewer assignment — CV round",
    subject: "[Need processed] Assign evaluation of applications",
    body:
      "Dear Reviewer,\n\nA new batch of CVs has been assigned to you for screening. Please open the program's CV Review stage to begin evaluating applicants.\n\nTarget completion: end of week.\n\nThanks,\nQ1 Hiring",
    sendType: "single",
    receiverType: "reviewers",
    recipients: [
      {
        id: "u-amelia",
        name: "Amelia Reviewer",
        email: "amelia@preciofishbone.com",
        kind: "reviewers",
      },
    ],
    fromEmail: "nguyenvana@gmail.com",
    stageId: "smp-stage-screen",
    stepId: "smp-step-cv",
    stageName: "CV Review",
    stepName: "Preliminary CV Review",
    sentAtISO: "2025-10-15T03:32:00Z",
    tracking: { trackOpens: true, trackReplies: true, trackClicks: false },
    delivery: { delivered: 1, skipped: 0, failed: 0 },
    performance: { openRate: 100, replyRate: 0 },
  },
  {
    id: "pem-2",
    programId: "*",
    logName: "Reviewer batch — CV round",
    subject: "[Need processed] Assign evaluation of applications",
    body:
      "Dear Reviewers,\n\nThree new applicants have been assigned for the Preliminary CV Review step. Please complete your scorecards before the next stand-up.",
    sendType: "bulk",
    receiverType: "reviewers",
    recipients: [
      {
        id: "u-amelia",
        name: "Amelia Reviewer",
        email: "amelia@preciofishbone.com",
        kind: "reviewers",
      },
      {
        id: "u-marcus",
        name: "Marcus Lead",
        email: "marcus@preciofishbone.com",
        kind: "reviewers",
      },
      {
        id: "u-priya",
        name: "Priya Senior",
        email: "priya@preciofishbone.com",
        kind: "reviewers",
      },
    ],
    fromEmail: "nguyenvana@gmail.com",
    stageId: "smp-stage-screen",
    stepId: "smp-step-cv",
    stageName: "CV Review",
    stepName: "Preliminary CV Review",
    sentAtISO: "2025-10-14T09:15:00Z",
    tracking: { trackOpens: true, trackReplies: true, trackClicks: false },
    delivery: { delivered: 3, skipped: 0, failed: 0 },
    performance: { openRate: 66.6, replyRate: 33.3 },
  },
  {
    id: "pem-3",
    programId: "*",
    logName: "Technical Test invite",
    subject: "[Action Required] Technical Test at Precio Fishbone",
    body:
      "Hi {CandidateName},\n\nYou're invited to take our short technical assessment. Click the link in the next email to start. The test takes ~45 minutes and you can pause once.\n\nGood luck!\nHiring Team",
    sendType: "bulk",
    receiverType: "candidates",
    recipients: Array.from({ length: 50 }, (_, i) => ({
      id: `cand-${i}`,
      name: `Candidate ${i + 1}`,
      email: `candidate${i + 1}@example.com`,
      kind: "candidates" as const,
    })),
    fromEmail: "hiring_manager@preciofishbone.com",
    stageId: "smp-stage-inbox",
    stepId: "smp-step-test",
    stageName: "Preliminary test",
    stepName: "Contact applicants and schedule date",
    sentAtISO: "2025-10-10T02:00:00Z",
    tracking: { trackOpens: true, trackReplies: false, trackClicks: true },
    delivery: { delivered: 45, skipped: 3, failed: 2 },
    performance: { openRate: 45, clickRate: 12 },
  },
  {
    id: "pem-4",
    programId: "*",
    logName: "Office relocation announcement",
    subject: "[Important] Change to the new office location",
    body:
      "Dear all,\n\nPlease note our hiring office is moving to the new address starting next month. Interview rooms, parking and reception details below.\n\nIf you have an upcoming on-site interview, your invite will be re-sent with the updated location.",
    sendType: "bulk",
    receiverType: "candidates",
    recipients: Array.from({ length: 100 }, (_, i) => ({
      id: `cand-bulk-${i}`,
      name: `Recipient ${i + 1}`,
      email: `recipient${i + 1}@example.com`,
      kind: "candidates" as const,
    })),
    fromEmail: "hiring_manager@preciofishbone.com",
    sentAtISO: "2025-10-05T03:00:00Z",
    // No stage/step — cross-stage bulk send. Per the wireframe sticky, this
    // intentionally won't be tracked in the stage-step column.
    tracking: { trackOpens: false, trackReplies: false, trackClicks: false },
    delivery: { delivered: 70, skipped: 20, failed: 10 },
    performance: {},
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __artMockProgramEmailsStore: ProgramEmail[] | undefined;
}

function store(): ProgramEmail[] {
  if (!globalThis.__artMockProgramEmailsStore) {
    globalThis.__artMockProgramEmailsStore = [...SEED];
  }
  return globalThis.__artMockProgramEmailsStore;
}

export function listProgramEmails(programId: string): ProgramEmail[] {
  return store()
    .filter((e) => e.programId === programId || e.programId === "*")
    .sort(
      (a, b) =>
        Date.parse(b.sentAtISO) - Date.parse(a.sentAtISO)
    );
}

export function getProgramEmail(id: string): ProgramEmail | undefined {
  return store().find((e) => e.id === id);
}

export function addProgramEmail(e: ProgramEmail): ProgramEmail {
  store().unshift(e);
  return e;
}
