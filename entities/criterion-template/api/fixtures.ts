import type { BehavioralGuideline, CriterionTemplate } from "../model/types";

/** Generic fall-back behavioural guideline used by every criterion that
 *  hasn't had a custom one written yet. Keeps the wireframe-grade
 *  Digital Marketing example specific, but every other row at least
 *  shows something non-empty. */
const GENERIC_GUIDELINE: BehavioralGuideline = {
  poor: "Lacks basic skills or knowledge. Cannot perform tasks. Requires complete retraining.",
  novice:
    "Has basic understanding but lacks practical application. Requires constant supervision and guidance.",
  intermediate:
    "Meets baseline requirements. Handles routine tasks independently but needs help with complex issues.",
  good: "Proficient and proactive. Independently solves complex problems and delivers effective solutions.",
  expert:
    "Exceptional mastery. Optimizes systems, drives strategy, and actively mentors others.",
};

const NOW = "2026-05-08T00:00:00Z";

const items: CriterionTemplate[] = [
  // ---- Tech ----
  {
    id: "ct-system-architecture",
    name: "System Architecture",
    weight: 5,
    categories: ["Tech"],
    description:
      "Evaluates the ability to design scalable, resilient, and maintainable systems for production workloads.",
    guideline: GENERIC_GUIDELINE,
    updatedAtISO: NOW,
  },
  {
    id: "ct-code-quality",
    name: "Code Quality & Clean Code",
    weight: 4,
    categories: ["Tech"],
    description:
      "Assesses adherence to coding standards, readability, and maintainable abstractions.",
    guideline: GENERIC_GUIDELINE,
  },
  {
    id: "ct-algorithms",
    name: "Algorithms & Data Structures",
    weight: 5,
    categories: ["Tech"],
    guideline: GENERIC_GUIDELINE,
  },
  {
    id: "ct-devops",
    name: "DevOps & Infrastructure (IaC)",
    weight: 4,
    categories: ["Tech", "DevOps", "Operations"],
    guideline: GENERIC_GUIDELINE,
  },
  {
    id: "ct-database-mgmt",
    name: "Database Management & Optimization",
    weight: 4,
    categories: ["Tech"],
    guideline: GENERIC_GUIDELINE,
  },
  {
    id: "ct-cybersecurity",
    name: "Cybersecurity Fundamentals",
    weight: 4,
    categories: ["Tech", "Security"],
    guideline: GENERIC_GUIDELINE,
  },
  {
    id: "ct-api-design",
    name: "API Design & Integration",
    weight: 4,
    categories: ["Tech", "Backend"],
    description:
      "Evaluates the ability to design clean, versioned APIs and integrate downstream services.",
    guideline: GENERIC_GUIDELINE,
  },
  {
    id: "ct-react-ecosystem",
    name: "React Ecosystem",
    weight: 4,
    categories: ["Tech", "Frontend"],
    guideline: GENERIC_GUIDELINE,
  },
  {
    id: "ct-coding-ability",
    name: "Coding Ability",
    weight: 5,
    categories: ["Tech"],
    guideline: GENERIC_GUIDELINE,
  },
  {
    id: "ct-database-design",
    name: "Database Design",
    weight: 4,
    categories: ["Tech", "Product"],
    guideline: GENERIC_GUIDELINE,
  },
  {
    id: "ct-code-review",
    name: "Code Review",
    weight: 3,
    categories: ["Tech", "Soft"],
    guideline: GENERIC_GUIDELINE,
  },
  {
    id: "ct-data-modeling",
    name: "Data Modeling",
    weight: 4,
    categories: ["Tech", "Cognitive"],
    guideline: GENERIC_GUIDELINE,
  },
  {
    id: "ct-testing-discipline",
    name: "Testing Discipline",
    weight: 3,
    categories: ["Tech"],
    guideline: GENERIC_GUIDELINE,
  },

  // ---- Process / Soft ----
  {
    id: "ct-agile-scrum",
    name: "Agile & Scrum Methodologies",
    weight: 3,
    categories: ["Soft", "Teamwork"],
    description: "Assesses understanding of Agile frameworks and Scrum ceremonies.",
    guideline: {
      poor: "Unfamiliar with Agile/Scrum concepts. Prefers rigid, waterfall-style tasks. Struggles with daily updates or iterative changes.",
      novice:
        "Knows the terminology (Sprint, Backlog) but relies on others to drive the process. Participates in rituals passively.",
      intermediate:
        "Understands their role in a Sprint. Attends stand-ups and completes tasks, but rarely proposes process improvements.",
      good: "Strong Agile mindset. Proposes refinements, mentors peers on Scrum events, and unblocks the team.",
      expert:
        "Coaches the org on Agile principles, tunes ceremonies to outcomes, and drives delivery predictability.",
    },
  },
  {
    id: "ct-ux-mindset",
    name: "User Experience (UX) Mindset",
    weight: 3,
    categories: ["Product", "Frontend", "Soft"],
    guideline: GENERIC_GUIDELINE,
  },

  // ---- Cognitive ----
  {
    id: "ct-problem-solving",
    name: "Problem Solving",
    weight: 5,
    categories: ["Cognitive"],
    guideline: GENERIC_GUIDELINE,
  },
  {
    id: "ct-analytical-thinking",
    name: "Analytical Thinking",
    weight: 4,
    categories: ["Cognitive"],
    guideline: GENERIC_GUIDELINE,
  },
  {
    id: "ct-creativity",
    name: "Creativity",
    weight: 4,
    categories: ["Cognitive", "Product"],
    guideline: GENERIC_GUIDELINE,
  },

  // ---- Soft ----
  {
    id: "ct-communication",
    name: "Communication",
    weight: 4,
    categories: ["Soft"],
    guideline: GENERIC_GUIDELINE,
  },
  {
    id: "ct-collaboration",
    name: "Collaboration",
    weight: 4,
    categories: ["Soft"],
    guideline: GENERIC_GUIDELINE,
  },
  {
    id: "ct-presentation",
    name: "Presentation Skills",
    weight: 3,
    categories: ["Soft"],
    guideline: GENERIC_GUIDELINE,
  },
  {
    id: "ct-leadership",
    name: "Leadership",
    weight: 4,
    categories: ["Soft", "Behavioral"],
    guideline: GENERIC_GUIDELINE,
  },

  // ---- Behavioral ----
  {
    id: "ct-ownership",
    name: "Ownership",
    weight: 4,
    categories: ["Behavioral"],
    guideline: GENERIC_GUIDELINE,
  },
  {
    id: "ct-growth-mindset",
    name: "Growth Mindset",
    weight: 3,
    categories: ["Behavioral"],
    guideline: GENERIC_GUIDELINE,
  },
  {
    id: "ct-values-alignment",
    name: "Alignment with Values",
    weight: 4,
    categories: ["Behavioral"],
    guideline: GENERIC_GUIDELINE,
  },

  // ---- Product ----
  {
    id: "ct-customer-focus",
    name: "Customer Focus",
    weight: 4,
    categories: ["Product", "Soft"],
    guideline: GENERIC_GUIDELINE,
  },
  {
    id: "ct-product-sense",
    name: "Product Sense",
    weight: 4,
    categories: ["Product"],
    guideline: GENERIC_GUIDELINE,
  },
  {
    id: "ct-brand-sense",
    name: "Brand Sense",
    weight: 3,
    categories: ["Product"],
    guideline: GENERIC_GUIDELINE,
  },
  {
    id: "ct-domain-knowledge",
    name: "Domain Knowledge",
    weight: 4,
    categories: ["Product"],
    guideline: GENERIC_GUIDELINE,
  },
  {
    id: "ct-results-delivered",
    name: "Results Delivered",
    weight: 4,
    categories: ["Product"],
    guideline: GENERIC_GUIDELINE,
  },
  {
    id: "ct-digital-marketing",
    name: "Digital Marketing Strategy",
    weight: 4,
    categories: ["Product"],
    description:
      "Evaluates competence in building multi-channel growth plans, budget allocation, and aligning marketing goals with sales KPIs.",
    guideline: {
      poor: "Lacks basic understanding of digital channels. Proposes fragmented tactics without any clear objective or target audience.",
      novice:
        "Familiar with tools (Ads, SEO) but cannot link them into a cohesive strategy. Struggles with data analysis and ROI tracking.",
      intermediate:
        "Can plan standard campaigns. Understands customer journeys but relies on basic optimization techniques without deep insights.",
      good: "Develops data-driven strategies. Proactively optimizes funnels based on performance metrics and demonstrates strong market intuition.",
      expert:
        "Master strategist. Demonstrates exceptional ability to scale brands globally, leverage AI/Automation, and deliver industry-leading ROI.",
    },
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __artMockCriterionTemplatesStore: CriterionTemplate[] | undefined;
}

function store(): CriterionTemplate[] {
  if (!globalThis.__artMockCriterionTemplatesStore) {
    globalThis.__artMockCriterionTemplatesStore = [...items];
  }
  return globalThis.__artMockCriterionTemplatesStore;
}

export function listCriterionTemplates(): CriterionTemplate[] {
  return [...store()];
}

export function getCriterionTemplate(id: string): CriterionTemplate | undefined {
  return store().find((c) => c.id === id);
}

export function createCriterionTemplate(
  input: Omit<CriterionTemplate, "id" | "updatedAtISO"> & { id?: string }
): CriterionTemplate {
  const id =
    input.id ?? `ct-custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const fresh: CriterionTemplate = {
    ...input,
    id,
    updatedAtISO: new Date().toISOString(),
  };
  store().unshift(fresh);
  return fresh;
}

export function updateCriterionTemplate(
  id: string,
  patch: Partial<CriterionTemplate>
): CriterionTemplate | undefined {
  const all = store();
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return undefined;
  all[idx] = { ...all[idx], ...patch, updatedAtISO: new Date().toISOString() };
  return all[idx];
}

export function deleteCriterionTemplate(id: string): boolean {
  const all = store();
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  all.splice(idx, 1);
  return true;
}

export function resetCriterionTemplatesStore(): CriterionTemplate[] {
  globalThis.__artMockCriterionTemplatesStore = [...items];
  return globalThis.__artMockCriterionTemplatesStore;
}
