import type { TestTemplate } from "../model/types";

const items: TestTemplate[] = [
  {
    id: "test-coding-basics",
    name: "Coding Basics — JS/TS",
    durationMinutes: 45,
    questionCount: 10,
    category: "Engineering",
    tags: ["JavaScript", "TypeScript", "Algorithms"],
  },
  {
    id: "test-coding-algorithms",
    name: "Algorithms & Data Structures",
    durationMinutes: 60,
    questionCount: 6,
    category: "Engineering",
    tags: ["Algorithms", "Data Structures", "Big-O"],
  },
  {
    id: "test-system-design",
    name: "System Design Take-home",
    durationMinutes: 120,
    questionCount: 1,
    category: "Engineering",
    tags: ["System Design", "Architecture", "Scalability"],
  },
  {
    id: "test-frontend",
    name: "Frontend Fundamentals",
    durationMinutes: 50,
    questionCount: 12,
    category: "Engineering",
    tags: ["HTML", "CSS", "React", "Accessibility"],
  },
  {
    id: "test-marketing-quiz",
    name: "Marketing Fundamentals",
    durationMinutes: 30,
    questionCount: 20,
    category: "Marketing",
    tags: ["SEO", "Content", "Analytics"],
  },
  {
    id: "test-aptitude",
    name: "General Aptitude",
    durationMinutes: 40,
    questionCount: 30,
    category: "General",
    tags: ["Logic", "Numerical", "Verbal"],
  },
  {
    id: "test-english-comprehension",
    name: "English Comprehension",
    durationMinutes: 25,
    questionCount: 25,
    category: "General",
    tags: ["Reading", "Vocabulary", "Grammar"],
  },
];

export function listTestTemplates(): TestTemplate[] {
  return items;
}
