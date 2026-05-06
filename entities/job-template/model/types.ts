import type { ProgramLevel } from "@/entities/program";

export interface Skill {
  id: string;
  name: string;
}

export interface JobTemplate {
  id: string;
  name: string;
  position: string;
  level: ProgramLevel;
  description: string;
  skills: Skill[];
  labels: string[];
}
