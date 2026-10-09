import type { QuestionSet } from "../types";
import { htmlStructure, pageLayout, userExperience } from "./aaq-u3";

export const questionSets: readonly QuestionSet[] = [pageLayout, userExperience, htmlStructure];

export function findSet(id: string): QuestionSet | undefined {
  return questionSets.find((set) => set.id === id);
}
