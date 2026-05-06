/**
 * Section Template — a reusable group of fields that programs can drop into
 * a candidate profile. The library page (/templates/sections) is a CRUD UI
 * over these records; programs reference them when designing their
 * candidate-profile form.
 */

import type {
  ProfileField,
  ProfileFieldType,
} from "@/entities/program";

export type SectionTemplateType = "system" | "custom";

export const SECTION_TEMPLATE_TAGS = [
  "Pre-screening",
  "Assessment",
] as const;
export type SectionTemplateTag = (typeof SECTION_TEMPLATE_TAGS)[number];

export interface SectionTemplateRecord {
  id: string;
  name: string;
  description?: string;
  /** "system" cannot be deleted; only `name`/order tweaks are allowed.
   *  "custom" supports full editing and deletion. */
  type: SectionTemplateType;
  /** Free-form tags surfaced as filter pills on the library list. */
  tags: SectionTemplateTag[];
  repeatable: boolean;
  fields: ProfileField[];
  /** Same convention as ProfileSection.layout — 2D array of field IDs
   *  defining row groupings. Optional; defaults to one field per row. */
  layout?: string[][];
  dateModifiedISO: string;
}

/** Re-export so consumers don't need a second import. */
export type { ProfileField, ProfileFieldType };

/** A short, comma-truncated preview of the contained field labels — used
 *  in the table's "Contains" column. */
export function containsPreview(s: SectionTemplateRecord, max = 3): string {
  if (s.fields.length === 0) return "";
  const names = s.fields.slice(0, max).map((f) => f.label);
  const more = s.fields.length > max;
  return more ? `${names.join(", ")}, ...` : names.join(", ");
}

/** "Just now" / "5 mins ago" / "Apr 12, 2026" depending on age. */
export function formatRelative(iso: string, now = Date.now()): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  const diff = now - t;
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min} min${min === 1 ? "" : "s"} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} day${day === 1 ? "" : "s"} ago`;
  return new Date(t).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}
