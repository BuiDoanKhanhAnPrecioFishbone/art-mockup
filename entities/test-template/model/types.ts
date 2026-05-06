export interface TestTemplate {
  id: string;
  name: string;
  /** Approx duration in minutes. */
  durationMinutes: number;
  /** Question count, for the picker summary. */
  questionCount: number;
  category: string;
}
