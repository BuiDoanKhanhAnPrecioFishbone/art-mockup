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
}
