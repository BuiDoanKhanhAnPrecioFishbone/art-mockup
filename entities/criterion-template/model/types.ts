/** A standalone criterion in the library — picked one-off into an interview
 *  step's scorecard, independent of any scorecard template. */
export interface CriterionTemplate {
  id: string;
  name: string;
  weight: number;
  description?: string;
  category?: string;
}
