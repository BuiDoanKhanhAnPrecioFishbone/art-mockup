import type { CVRecord } from "../model/types";

/**
 * Mock CV-records seed — names + filenames mirror the wireframe so the
 * demo feels real. Programs without specific data still see this seed
 * thanks to the "*" wildcard programId.
 *
 * Backed by globalThis so writes are shared across Next.js per-route
 * bundles — same pattern as the candidates store.
 */

const NOW = Date.now();
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const SEED: CVRecord[] = [
  {
    id: "cv-bao",
    programId: "*",
    fileName: "CV_Tran_Gia_Bao_Marketing_Executive.pdf",
    fileSizeKB: 1820,
    type: "auto-sync",
    source: "LinkedIn",
    addedAtISO: new Date(NOW - 4 * HOUR).toISOString(),
    status: "done",
    parsedName: "Tran Gia Bao",
    parsedEmail: "trangb@example.com",
    parsedPhone: "+84 909 111 222",
    skills: [
      { name: "Marketing Strategy", inProgramSkillSet: true },
      { name: "SEO", inProgramSkillSet: true },
      { name: "Google Analytics", skillId: "sk-50", inProgramSkillSet: true },
      { name: "Copywriting", inProgramSkillSet: false },
      { name: "Brand Management", inProgramSkillSet: false },
      { name: "Content Strategy", inProgramSkillSet: false },
      { name: "Social Media", inProgramSkillSet: false },
      { name: "Adobe Analytics", inProgramSkillSet: false },
      { name: "HubSpot", inProgramSkillSet: false },
      { name: "Mailchimp", inProgramSkillSet: false },
      { name: "Influencer Marketing", inProgramSkillSet: false },
      { name: "PPC", inProgramSkillSet: false },
    ],
  },
  {
    id: "cv-mai",
    programId: "*",
    fileName: "Nguyen_Thi_Mai_CV_English.pdf",
    fileSizeKB: 990,
    type: "auto-sync",
    source: "LinkedIn",
    addedAtISO: new Date(NOW - 5 * HOUR).toISOString(),
    status: "done",
    parsedName: "Nguyen Thi Mai",
    parsedEmail: "mainguyen.dev@gmail.com",
    parsedPhone: "+84 901 234 567",
    skills: [
      { name: "ReactJS", skillId: "sk-1", inProgramSkillSet: true },
      { name: "TypeScript", skillId: "sk-2", inProgramSkillSet: true },
      { name: "Node.js", skillId: "sk-3", inProgramSkillSet: true },
      { name: "GraphQL", inProgramSkillSet: false },
      { name: "REST APIs", inProgramSkillSet: false },
      { name: "Tailwind CSS", inProgramSkillSet: false },
      { name: "Jest", inProgramSkillSet: false },
      { name: "Docker", inProgramSkillSet: false },
    ],
  },
  {
    id: "cv-nam",
    programId: "*",
    fileName: "Le_Hoang_Nam_CV_2024.docx",
    fileSizeKB: 470,
    type: "auto-sync",
    source: "Facebook",
    addedAtISO: new Date(NOW - 6 * HOUR).toISOString(),
    status: "duplicate",
    parsedName: "Le Hoang Nam",
    parsedEmail: "nam.lehoang@yahoo.com",
    skills: [],
    duplicateOfCandidateId: "cnd-nam",
  },
  {
    id: "cv-kien",
    programId: "*",
    fileName: "CV_Pham_Van_Kien_Ban_Full.pdf",
    fileSizeKB: 2110,
    type: "auto-sync",
    source: "LinkedIn",
    addedAtISO: new Date(NOW - 7 * HOUR).toISOString(),
    status: "extracting",
    skills: [],
  },
  {
    id: "cv-huong",
    programId: "*",
    fileName: "Vu_Thi_Huong_CV_Thiet_ke.pdf",
    fileSizeKB: 1340,
    type: "manual",
    source: "Tiktok",
    addedAtISO: new Date(NOW - 1 * DAY - 4 * HOUR).toISOString(),
    status: "extracting",
    skills: [],
  },
  {
    id: "cv-tuananh",
    programId: "*",
    fileName: "DoanTuanAnhCV.pdf",
    fileSizeKB: 730,
    type: "manual",
    source: "Gmail",
    addedAtISO: new Date(NOW - 2 * DAY).toISOString(),
    status: "needs-review",
    parsedName: "Doan Tuan Anh",
    parsedEmail: "",
    parsedPhone: "0978 555 333",
    skills: [
      { name: "Project Management", inProgramSkillSet: false },
      { name: "Agile", inProgramSkillSet: true },
      { name: "JIRA", inProgramSkillSet: false },
      { name: "Scrum", inProgramSkillSet: false },
      { name: "Stakeholder Management", inProgramSkillSet: false },
    ],
  },
  {
    id: "cv-elena",
    programId: "*",
    fileName: "Elena_Rostova_Resume_International.pdf",
    fileSizeKB: 1680,
    type: "auto-sync",
    source: "LinkedIn",
    addedAtISO: new Date(NOW - 3 * DAY).toISOString(),
    status: "error",
    parsedName: "Elena Rostova",
    parsedEmail: "elena.r@international.com",
    skills: [],
    errorReason: "Could not extract content — file is encrypted.",
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __artMockCvRecordsStore: CVRecord[] | undefined;
}

function store(): CVRecord[] {
  if (!globalThis.__artMockCvRecordsStore) {
    globalThis.__artMockCvRecordsStore = [...SEED];
  }
  return globalThis.__artMockCvRecordsStore;
}

export function listCVRecords(programId: string): CVRecord[] {
  return store().filter(
    (c) => c.programId === programId || c.programId === "*"
  );
}

export function getCVRecord(id: string): CVRecord | undefined {
  return store().find((c) => c.id === id);
}

export function addCVRecord(c: CVRecord): CVRecord {
  store().push(c);
  return c;
}

export function updateCVRecord(
  id: string,
  patch: Partial<CVRecord>
): CVRecord | undefined {
  const all = store();
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return undefined;
  all[idx] = { ...all[idx], ...patch };
  return all[idx];
}

export function deleteCVRecord(id: string): boolean {
  const all = store();
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  all.splice(idx, 1);
  return true;
}

export function deleteCVRecords(ids: string[]): number {
  const all = store();
  let removed = 0;
  for (const id of ids) {
    const idx = all.findIndex((c) => c.id === id);
    if (idx !== -1) {
      all.splice(idx, 1);
      removed++;
    }
  }
  return removed;
}
