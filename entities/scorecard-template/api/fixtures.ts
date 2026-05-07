import type { ScorecardTemplate } from "../model/types";

const templates: ScorecardTemplate[] = [
  {
    id: "scorecard-tech-interview",
    name: "Technical Interview (Engineering)",
    description: "Coding ability, system design, communication.",
    criteria: [
      {
        id: "ct-coding-ability",
        name: "Coding Ability",
        weight: 5,
        description: "Writes correct, readable code under time pressure.",
        categories: ["Tech"],
      },
      {
        id: "ct-problem-solving",
        name: "Problem Solving",
        weight: 4,
        description: "Decomposes problems and reasons about edge cases.",
        categories: ["Cognitive"],
      },
      {
        id: "ct-system-architecture",
        name: "System Architecture",
        weight: 4,
        categories: ["Tech"],
      },
      {
        id: "ct-communication",
        name: "Communication",
        weight: 3,
        description: "Explains decisions clearly.",
        categories: ["Soft"],
      },
    ],
  },
  {
    id: "scorecard-cultural-fit",
    name: "Cultural Fit",
    description: "Values, collaboration, growth mindset.",
    criteria: [
      {
        id: "ct-values-alignment",
        name: "Alignment with Values",
        weight: 4,
        categories: ["Behavioral"],
      },
      {
        id: "ct-collaboration",
        name: "Collaboration",
        weight: 4,
        categories: ["Soft"],
      },
      {
        id: "ct-growth-mindset",
        name: "Growth Mindset",
        weight: 3,
        categories: ["Behavioral"],
      },
    ],
  },
  {
    id: "scorecard-marketing-portfolio",
    name: "Marketing Portfolio Review",
    description: "Creativity, brand sense, results.",
    criteria: [
      {
        id: "ct-creativity",
        name: "Creativity",
        weight: 5,
        categories: ["Cognitive", "Product"],
      },
      {
        id: "ct-brand-sense",
        name: "Brand Sense",
        weight: 4,
        categories: ["Product"],
      },
      {
        id: "ct-results-delivered",
        name: "Results Delivered",
        weight: 4,
        categories: ["Product"],
      },
    ],
  },
];

export function listScorecardTemplates(): ScorecardTemplate[] {
  return templates;
}

export function getScorecardTemplate(id: string): ScorecardTemplate | undefined {
  return templates.find((t) => t.id === id);
}
