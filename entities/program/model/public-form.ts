/**
 * Per-program public-form settings.
 *
 * The public form is the externally-shareable page candidates use to apply.
 * Its field set is a *visibility overlay* on top of the program's
 * candidateProfile (Tab 2): sections and fields exist there, this tab
 * just decides which ones appear on the form.
 *
 * Defaults: form is enabled, follows the program's recruitment period,
 * everything from the candidate profile is visible.
 */

export interface PublicFormSettings {
  /** Master switch — when false the public URL returns "applications closed". */
  enabled: boolean;
  /** Inclusive open date. Empty string means "use the program's start date". */
  startDate: string;
  /** Inclusive close date. Empty string means "use the program's end date". */
  endDate: string;
  /** IDs of profile sections hidden on the public form. */
  hiddenSectionIds: string[];
  /** IDs of profile fields hidden on the public form. */
  hiddenFieldIds: string[];
  /** URL-safe slug. Empty means "use the program id". */
  slug: string;
}

export function defaultPublicFormSettings(): PublicFormSettings {
  return {
    enabled: true,
    startDate: "",
    endDate: "",
    hiddenSectionIds: [],
    hiddenFieldIds: [],
    slug: "",
  };
}

/** Field IDs that must always be on the public form — without these the form
 *  cannot collect a usable application (no name → can't address, no email →
 *  can't reply, no CV → no resume to parse). */
export const PROTECTED_FIELD_IDS = new Set(["full-name", "email", "resume"]);

/** Origin used to render mock public/embed URLs. In a real app this would
 *  come from env or request headers; for the mockup a constant is fine. */
export const PUBLIC_FORM_ORIGIN = "https://apply.art.example.com";

export function publicFormUrl(programId: string, settings: PublicFormSettings): string {
  const slug = settings.slug.trim() || programId;
  return `${PUBLIC_FORM_ORIGIN}/${slug}`;
}

export function publicFormEmbedCode(
  programId: string,
  settings: PublicFormSettings
): string {
  const url = publicFormUrl(programId, settings);
  return `<iframe src="${url}?embed=1" width="100%" height="900" frameborder="0" style="border:0;border-radius:12px"></iframe>`;
}
