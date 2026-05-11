export interface ScorecardCriterionTemplate {
  id: string;
  name: string;
  weight: number;
  description?: string;
  /** Categories shown as tags on the criterion row. When a scorecard
   *  template is applied, these are copied verbatim onto the resulting
   *  ScorecardCriterion so the row-tags persist after the link to the
   *  scorecard template is gone. */
  categories?: string[];
}

export interface ScorecardTemplate {
  id: string;
  name: string;
  description: string;
  criteria: ScorecardCriterionTemplate[];
  /** ISO timestamp the scorecard was last edited. Powers the "Date
   *  Modified" column in the Interview Criteria Template manager. */
  updatedAtISO?: string;
}
