import type { ScorecardTemplate } from "../model/types";

const templates: ScorecardTemplate[] = [
  {
    id: "scorecard-tech-interview",
    name: "Technical Interview (Engineering)",
    description: "Coding ability, system design, communication.",
    criteria: [
      { id: "c-coding", name: "Coding ability", weight: 5, description: "Writes correct, readable code under time pressure." },
      { id: "c-problem-solving", name: "Problem solving", weight: 4, description: "Decomposes problems and reasons about edge cases." },
      { id: "c-system-design", name: "System design", weight: 4 },
      { id: "c-communication", name: "Communication", weight: 3, description: "Explains decisions clearly." },
    ],
  },
  {
    id: "scorecard-cultural-fit",
    name: "Cultural Fit",
    description: "Values, collaboration, growth mindset.",
    criteria: [
      { id: "c-values", name: "Alignment with values", weight: 4 },
      { id: "c-collab", name: "Collaboration", weight: 4 },
      { id: "c-growth", name: "Growth mindset", weight: 3 },
    ],
  },
  {
    id: "scorecard-marketing-portfolio",
    name: "Marketing Portfolio Review",
    description: "Creativity, brand sense, results.",
    criteria: [
      { id: "c-creativity", name: "Creativity", weight: 5 },
      { id: "c-brand", name: "Brand sense", weight: 4 },
      { id: "c-results", name: "Results delivered", weight: 4 },
    ],
  },
];

export function listScorecardTemplates(): ScorecardTemplate[] {
  return templates;
}

export function getScorecardTemplate(id: string): ScorecardTemplate | undefined {
  return templates.find((t) => t.id === id);
}
