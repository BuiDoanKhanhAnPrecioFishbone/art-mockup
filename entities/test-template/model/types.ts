export interface TestTemplate {
  id: string;
  name: string;
  /** Approx duration in minutes. */
  durationMinutes: number;
  /** Question count, for the picker summary. */
  questionCount: number;
  category: string;
  /** Skill tags surfaced as chips in the workflow Test pool — preferred
   *  to the question-count + duration summary per the wireframe. */
  tags: string[];
}
