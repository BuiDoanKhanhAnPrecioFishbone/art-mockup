/** Five-band behavioural guideline for a criterion. Each band describes
 *  the candidate behaviour the rater should look for when scoring at
 *  that level. Used by the Interview Criteria Template editor and by
 *  the runtime scorecard during interviews. */
export interface BehavioralGuideline {
  /** 1-2: Poor / "Lacks basic skills". */
  poor: string;
  /** 3-4: Novice. */
  novice: string;
  /** 5-6: Intermediate. */
  intermediate: string;
  /** 7-8: Good. */
  good: string;
  /** 9-10: Expert. */
  expert: string;
}

/** A standalone criterion in the library — picked one-off into an interview
 *  step's scorecard, independent of any scorecard template. */
export interface CriterionTemplate {
  id: string;
  name: string;
  weight: number;
  description?: string;
  /** Tags shown on the criterion row to indicate what skill areas this
   *  criterion measures. A criterion can belong to multiple categories
   *  (e.g. "Database Design" → ["Tech", "Product"]). */
  categories: string[];
  /** Behaviour-anchored rating scale used during scoring. Optional —
   *  older criteria may not have one until the recruiter fills it in. */
  guideline?: BehavioralGuideline;
  /** ISO timestamp the criterion was last edited. Powers the "Date
   *  Modified" column in the template manager. */
  updatedAtISO?: string;
}
