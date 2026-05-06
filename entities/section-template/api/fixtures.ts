import type { ProfileField } from "@/entities/program";
import type { SectionTemplateRecord } from "../model/types";

/**
 * Mock section-library seed — the 9 sections from the wireframe.
 * Backed by globalThis so writes persist across Next.js per-route bundles.
 */

const NOW = Date.now();
const MIN = 60 * 1000;

function fid(prefix: string, label: string): string {
  return `${prefix}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function field(
  prefix: string,
  label: string,
  type: ProfileField["type"],
  extra: Partial<ProfileField> = {}
): ProfileField {
  return {
    id: fid(prefix, label),
    label,
    type,
    required: false,
    ...extra,
  };
}

const SEED: SectionTemplateRecord[] = [
  {
    id: "sec-general",
    name: "General Information",
    description: "Identity + contact basics for every applicant.",
    type: "system",
    tags: ["Pre-screening"],
    repeatable: false,
    fields: [
      field("gen", "Full Name", "text", { required: true, system: true }),
      field("gen", "Email Address", "email", { required: true, system: true }),
      field("gen", "Source", "radio", {
        options: ["LinkedIn", "Facebook", "Tiktok", "Gmail", "Referral"],
      }),
      field("gen", "Phone Number", "phone", { required: true }),
      field("gen", "Date of Birth", "date"),
      field("gen", "Location", "text"),
      field("gen", "Resume/CV (PDF, DOCX < 5MB)", "file", {
        required: true,
        system: true,
        allowedFileTypes: ["pdf", "docx"],
        maxFiles: 1,
        maxFileSizeMB: 10,
      }),
    ],
    layout: [
      ["gen-full-name"],
      ["gen-email-address"],
      ["gen-source", "gen-phone-number", "gen-date-of-birth"],
      ["gen-location"],
      ["gen-resume-cv-pdf-docx-5mb"],
    ],
    dateModifiedISO: new Date(NOW - 1 * MIN).toISOString(),
  },
  {
    id: "sec-skills",
    name: "Skills",
    description: "Master-library skill picker, scoped to the program.",
    type: "system",
    tags: ["Assessment"],
    repeatable: false,
    fields: [],
    dateModifiedISO: new Date(NOW - 6 * 60 * MIN).toISOString(),
  },
  {
    id: "sec-education",
    name: "Education",
    description: "Schools, degrees and majors.",
    type: "custom",
    tags: ["Assessment"],
    repeatable: true,
    fields: [
      field("edu", "School/Institution", "text", { required: true }),
      field("edu", "Degree/Level", "text"),
      field("edu", "Major", "text"),
      field("edu", "Duration", "text"),
    ],
    layout: [
      ["edu-school-institution"],
      ["edu-degree-level", "edu-major"],
      ["edu-duration"],
    ],
    dateModifiedISO: new Date(NOW - 2 * 24 * 60 * MIN).toISOString(),
  },
  {
    id: "sec-experiences",
    name: "Experiences",
    description: "Past projects, companies and responsibilities.",
    type: "custom",
    tags: ["Assessment"],
    repeatable: true,
    fields: [
      field("exp", "Project Name", "text", { required: true }),
      field("exp", "Company/Organization", "text"),
      field("exp", "Role", "text"),
      field("exp", "Start Date", "date"),
      field("exp", "End Date", "date"),
      field("exp", "Description", "textarea"),
    ],
    layout: [
      ["exp-project-name"],
      ["exp-company-organization", "exp-role"],
      ["exp-start-date", "exp-end-date"],
      ["exp-description"],
    ],
    dateModifiedISO: new Date(NOW - 5 * 24 * 60 * MIN).toISOString(),
  },
  {
    id: "sec-certificate",
    name: "Certificate",
    description: "Professional certifications and credentials.",
    type: "custom",
    tags: ["Assessment"],
    repeatable: true,
    fields: [
      field("cert", "Certificate Name", "text", { required: true }),
      field("cert", "Issuer", "text"),
      field("cert", "Date Issued", "date"),
      field("cert", "Credential URL", "url"),
    ],
    layout: [
      ["cert-certificate-name"],
      ["cert-issuer", "cert-date-issued"],
      ["cert-credential-url"],
    ],
    dateModifiedISO: new Date(NOW - 9 * 24 * 60 * MIN).toISOString(),
  },
  {
    id: "sec-expected-salary",
    name: "Expected Salary",
    description: "Compensation expectations.",
    type: "custom",
    tags: ["Pre-screening"],
    repeatable: false,
    fields: [
      field("sal", "Min Expected", "number"),
      field("sal", "Max Expected", "number"),
      field("sal", "Currency", "select", {
        options: ["USD", "EUR", "VND", "SEK"],
      }),
      field("sal", "Period", "select", {
        options: ["per month", "per year"],
      }),
    ],
    layout: [
      ["sal-min-expected", "sal-max-expected"],
      ["sal-currency", "sal-period"],
    ],
    dateModifiedISO: new Date(NOW - 14 * 24 * 60 * MIN).toISOString(),
  },
  {
    id: "sec-visa-status",
    name: "Visa Status",
    description: "Work-permit details.",
    type: "custom",
    tags: ["Pre-screening"],
    repeatable: false,
    fields: [
      field("visa", "Citizenship", "text"),
      field("visa", "Visa Required", "radio", { options: ["Yes", "No"] }),
      field("visa", "Sponsorship Needed", "radio", {
        options: ["Yes", "No"],
      }),
    ],
    layout: [
      ["visa-citizenship"],
      ["visa-visa-required", "visa-sponsorship-needed"],
    ],
    dateModifiedISO: new Date(NOW - 18 * 24 * 60 * MIN).toISOString(),
  },
  {
    id: "sec-languages",
    name: "Languages",
    description: "Spoken / written languages and proficiency.",
    type: "custom",
    tags: ["Assessment"],
    repeatable: true,
    fields: [
      field("lang", "Language", "text", { required: true }),
      field("lang", "Proficiency", "select", {
        options: ["Basic", "Conversational", "Fluent", "Native"],
      }),
    ],
    layout: [["lang-language", "lang-proficiency"]],
    dateModifiedISO: new Date(NOW - 25 * 24 * 60 * MIN).toISOString(),
  },
  {
    id: "sec-references",
    name: "References",
    description: "Professional references.",
    type: "custom",
    tags: [],
    repeatable: true,
    fields: [
      field("ref", "Reference Name", "text", { required: true }),
      field("ref", "Relationship", "text"),
      field("ref", "Email", "email"),
      field("ref", "Phone", "phone"),
    ],
    layout: [
      ["ref-reference-name", "ref-relationship"],
      ["ref-email", "ref-phone"],
    ],
    dateModifiedISO: new Date(NOW - 40 * 24 * 60 * MIN).toISOString(),
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __artMockSectionTemplatesStore: SectionTemplateRecord[] | undefined;
}

function store(): SectionTemplateRecord[] {
  if (!globalThis.__artMockSectionTemplatesStore) {
    globalThis.__artMockSectionTemplatesStore = SEED.map((s) => ({
      ...s,
      fields: s.fields.map((f) => ({ ...f })),
    }));
  }
  return globalThis.__artMockSectionTemplatesStore;
}

export function listSectionTemplates(): SectionTemplateRecord[] {
  return [...store()];
}

export function getSectionTemplate(
  id: string
): SectionTemplateRecord | undefined {
  return store().find((s) => s.id === id);
}

export function addSectionTemplate(
  s: SectionTemplateRecord
): SectionTemplateRecord {
  store().unshift(s);
  return s;
}

export function updateSectionTemplate(
  id: string,
  patch: Partial<SectionTemplateRecord>
): SectionTemplateRecord | undefined {
  const all = store();
  const idx = all.findIndex((s) => s.id === id);
  if (idx === -1) return undefined;
  // System templates cannot have type changed; protect that.
  const existing = all[idx];
  const safe = { ...patch };
  if (existing.type === "system") {
    delete safe.type;
  }
  all[idx] = {
    ...existing,
    ...safe,
    dateModifiedISO: new Date().toISOString(),
  };
  return all[idx];
}

export function deleteSectionTemplate(id: string): {
  ok: boolean;
  error?: string;
} {
  const all = store();
  const idx = all.findIndex((s) => s.id === id);
  if (idx === -1) return { ok: false, error: "Not found" };
  if (all[idx].type === "system") {
    return { ok: false, error: "System sections cannot be deleted." };
  }
  all.splice(idx, 1);
  return { ok: true };
}

export function deleteSectionTemplates(ids: string[]): {
  removed: number;
  rejected: string[];
} {
  let removed = 0;
  const rejected: string[] = [];
  for (const id of ids) {
    const res = deleteSectionTemplate(id);
    if (res.ok) removed++;
    else rejected.push(id);
  }
  return { removed, rejected };
}
