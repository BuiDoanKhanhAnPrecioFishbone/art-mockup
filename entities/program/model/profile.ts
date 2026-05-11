/**
 * Per-program candidate profile configuration.
 *
 * Tab 2 ("Candidate Profile") defines what data is collected for each
 * candidate. Tab 3 ("Public Form") will later overlay a visibility config on
 * top of this — i.e. "which of these fields should appear on the public
 * application form" — so we deliberately do NOT model UI visibility here.
 */

export type ProfileFieldType =
  | "text"
  | "textarea"
  | "email"
  | "phone"
  | "date"
  | "url"
  | "number"
  | "select"
  | "file"
  | "radio"
  | "checkbox"
  | "time";

/** Display label per field type. Labels match the wireframe's Components
 *  toolbox so users see the same names everywhere. */
export const FIELD_TYPE_LABEL: Record<ProfileFieldType, string> = {
  text: "Short answer",
  textarea: "Paragraph",
  email: "Email",
  phone: "Phone",
  date: "Date",
  url: "URL",
  number: "Number",
  select: "Dropdown",
  file: "File upload",
  radio: "Radio button",
  checkbox: "Checkbox",
  time: "Time",
};

/** Field types offered in the Components toolbox (drag/click to add).
 *  Excludes types that only make sense for system fields (Email, Phone, URL, Number). */
export const TOOLBOX_FIELD_TYPES: ProfileFieldType[] = [
  "text",
  "textarea",
  "radio",
  "checkbox",
  "select",
  "file",
  "date",
  "time",
];

export interface ProfileField {
  id: string;
  /** Doc 08 §8.1 — auto-generated `snake_case` form of the initial
   *  label. Used as the field's API key; immutable after creation.
   *  Optional on the type so legacy seeds without it still parse;
   *  newly-minted fields always have one (see `newCustomField`). */
  name?: string;
  label: string;
  type: ProfileFieldType;
  required: boolean;
  /** True for the protected fields shipped with default sections (Full Name,
   *  Email, Resume). Type is locked and the field cannot be deleted, but
   *  label and `required` can be changed. */
  system?: boolean;
  /** Choice options for type ∈ {radio, checkbox, select}. */
  options?: string[];
  /** File upload constraints. Only meaningful when type === 'file'. */
  allowedFileTypes?: string[];
  maxFiles?: number;
  maxFileSizeMB?: number;
}

/** Convert a free-text label into a snake_case identifier used as the
 *  immutable field `name`. Strips diacritics, collapses runs of
 *  non-alphanumerics to a single underscore, and trims leading /
 *  trailing underscores. Doc 08 §8.1. */
export function slugifyFieldName(label: string): string {
  return label
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 64);
}

/** Validation check for a single ProfileField. Returns the list of
 *  problems (empty when the field is well-formed). Doc 08 §8.1
 *  requires choice components (radio / checkbox / dropdown) to have
 *  at least 2 options. */
export function validateProfileField(f: ProfileField): string[] {
  const issues: string[] = [];
  if (!f.label.trim()) issues.push("Label is required.");
  if (f.type === "radio" || f.type === "checkbox" || f.type === "select") {
    const opts = (f.options ?? []).map((o) => o.trim()).filter(Boolean);
    if (opts.length < 2) {
      issues.push(
        `${FIELD_TYPE_LABEL[f.type]} fields need at least 2 options.`
      );
    }
  }
  return issues;
}

export type ProfileSectionKind = "general" | "skills" | "custom";

export interface ProfileSection {
  id: string;
  name: string;
  kind: ProfileSectionKind;
  fields: ProfileField[];
  /** 2D array of field IDs grouping fields into rows. Within a row fields
   *  auto-split width equally. If missing, each field renders one-per-row
   *  in `fields` order (back-compat default). */
  layout?: string[][];
  /** When true, candidates can fill in this section multiple times (e.g.
   *  multiple Education entries). Default false. */
  repeatable?: boolean;
}

/** Resolve a section's row layout — uses `layout` if present, otherwise
 *  defaults to one field per row in `fields` order. Filters out any IDs
 *  that no longer exist (defensive against drift) and appends any
 *  field-without-a-row at the end. */
export function getSectionRows(section: ProfileSection): string[][] {
  const validIds = new Set(section.fields.map((f) => f.id));
  const layout = section.layout;
  if (!layout) return section.fields.map((f) => [f.id]);

  const rows: string[][] = [];
  const seen = new Set<string>();
  for (const row of layout) {
    const cleaned = row.filter((id) => validIds.has(id));
    if (cleaned.length === 0) continue;
    cleaned.forEach((id) => seen.add(id));
    rows.push(cleaned);
  }
  // Append any fields that aren't represented in the layout.
  for (const f of section.fields) {
    if (!seen.has(f.id)) rows.push([f.id]);
  }
  return rows;
}

export interface CandidateProfile {
  sections: ProfileSection[];
}

/* -------------------------------------------------------------- */
/* Defaults                                                       */
/* -------------------------------------------------------------- */

export function defaultCandidateProfile(): CandidateProfile {
  return {
    sections: [
      {
        id: "general",
        name: "General Information",
        kind: "general",
        fields: [
          { id: "full-name", label: "Full Name", type: "text", required: true, system: true },
          { id: "email", label: "Email Address", type: "email", required: true, system: true },
          {
            id: "resume",
            label: "Resume / CV",
            type: "file",
            required: true,
            system: true,
            allowedFileTypes: ["pdf", "docx"],
            maxFiles: 1,
            maxFileSizeMB: 10,
          },
        ],
        // Full Name + Email share row 1; Resume sits on its own row.
        layout: [["full-name", "email"], ["resume"]],
      },
      {
        id: "skills",
        name: "Skills",
        kind: "skills",
        fields: [],
      },
    ],
  };
}

/* -------------------------------------------------------------- */
/* Section templates — what's offered in the "Add Section" picker  */
/* -------------------------------------------------------------- */

/** Definition of a single field as it appears in a section template. The
 *  template's `rows` reference these by index — each row is an array of
 *  indices into `fields`. Fields in the same row auto-split width. */
export interface SectionTemplate {
  id: string;
  name: string;
  description: string;
  fields: Omit<ProfileField, "id">[];
  /** Optional row groupings — each inner array is a row of field-indices.
   *  If omitted, every field gets its own row. */
  rows?: number[][];
}

export const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    id: "education",
    name: "Education",
    description: "Schools, degrees and majors.",
    fields: [
      { label: "School / Institution", type: "text", required: true },
      { label: "Degree / Level", type: "text", required: false },
      { label: "Major", type: "text", required: false },
      { label: "Duration", type: "text", required: false },
    ],
    // School full row; Degree + Major split row 2; Duration full row 3.
    rows: [[0], [1, 2], [3]],
  },
  {
    id: "experiences",
    name: "Experiences",
    description: "Past roles and responsibilities.",
    fields: [
      { label: "Company", type: "text", required: true },
      { label: "Position", type: "text", required: true },
      { label: "Start Date", type: "date", required: false },
      { label: "End Date", type: "date", required: false },
      { label: "Description", type: "textarea", required: false },
    ],
    rows: [[0, 1], [2, 3], [4]],
  },
  {
    id: "certificate",
    name: "Certificate",
    description: "Professional certifications and credentials.",
    fields: [
      { label: "Certificate Name", type: "text", required: true },
      { label: "Issuer", type: "text", required: false },
      { label: "Date Issued", type: "date", required: false },
      { label: "Credential URL", type: "url", required: false },
    ],
    rows: [[0], [1, 2], [3]],
  },
  {
    id: "expected-salary",
    name: "Expected Salary",
    description: "Compensation expectations.",
    fields: [
      { label: "Currency", type: "select", required: false, options: ["USD", "EUR", "VND", "SEK"] },
      { label: "Amount", type: "number", required: false },
      { label: "Period", type: "select", required: false, options: ["per month", "per year"] },
    ],
    // Three thirds — Currency / Amount / Period split a single row.
    rows: [[0, 1, 2]],
  },
  {
    id: "visa-status",
    name: "Visa Status",
    description: "Work-permit details.",
    fields: [
      { label: "Citizenship", type: "text", required: false },
      { label: "Visa Required", type: "radio", required: false, options: ["Yes", "No"] },
      { label: "Sponsorship Needed", type: "radio", required: false, options: ["Yes", "No"] },
    ],
    rows: [[0], [1, 2]],
  },
  {
    id: "languages",
    name: "Languages",
    description: "Spoken / written languages and proficiency.",
    fields: [
      { label: "Language", type: "text", required: true },
      {
        label: "Proficiency",
        type: "select",
        required: false,
        options: ["Basic", "Conversational", "Fluent", "Native"],
      },
    ],
    rows: [[0, 1]],
  },
  {
    id: "references",
    name: "References",
    description: "Professional references.",
    fields: [
      { label: "Reference Name", type: "text", required: true },
      { label: "Relationship", type: "text", required: false },
      { label: "Email", type: "email", required: false },
      { label: "Phone", type: "phone", required: false },
    ],
    rows: [[0, 1], [2, 3]],
  },
  {
    id: "custom",
    name: "Custom (empty)",
    description: "Start with no fields and build it yourself.",
    fields: [],
  },
];

export function instantiateSection(template: SectionTemplate): ProfileSection {
  const ts = Date.now();
  const fields: ProfileField[] = template.fields.map((f, i) => ({
    ...f,
    id: `${template.id}-f${i}-${ts}`,
  }));
  // Build the layout from the template's rows-of-indices, defaulting to
  // one-field-per-row when not specified.
  const layout: string[][] = template.rows
    ? template.rows
        .map((row) =>
          row.map((idx) => fields[idx]?.id).filter((id): id is string => Boolean(id))
        )
        .filter((row) => row.length > 0)
    : fields.map((f) => [f.id]);
  return {
    id: `${template.id}-${ts}`,
    name: template.name,
    kind: "custom",
    fields,
    layout,
  };
}

export function newCustomField(type: ProfileFieldType = "text"): ProfileField {
  const label = defaultLabelForType(type);
  // Pre-seed at least 2 options for choice components so they pass
  // validation right out of the toolbox (Doc 08 §8.1 requires min 2).
  const options =
    type === "radio" || type === "checkbox" || type === "select"
      ? ["Option 1", "Option 2"]
      : undefined;
  return {
    id: `field-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: slugifyFieldName(label),
    label,
    type,
    required: false,
    options,
  };
}

export function defaultLabelForType(type: ProfileFieldType): string {
  switch (type) {
    case "text":
      return "Short answer field";
    case "textarea":
      return "Paragraph field";
    case "radio":
      return "Pick one";
    case "checkbox":
      return "Pick many";
    case "select":
      return "Dropdown";
    case "file":
      return "Upload file";
    case "date":
      return "Date";
    case "time":
      return "Time";
    case "email":
      return "Email";
    case "phone":
      return "Phone";
    case "number":
      return "Number";
    case "url":
      return "URL";
  }
}
