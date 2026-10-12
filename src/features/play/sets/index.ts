import type { QuestionSet } from "../types";
import {
  creatingAssets,
  cssLayout,
  cssStyling,
  htmlContentForms,
  htmlStructure,
  jsComponents,
  jsFilterSearchCart,
  jsImagesMotion,
  motionDynamicSeo,
  navigationContent,
  pageLayout,
  planningBrief,
  purposesAudiences,
  siteMaps,
  sourcingAssets,
  standardsPublishing,
  testingReview,
  userExperience,
  visualStyle,
  wireframing,
} from "./aaq-u3";

/** In teaching order: one set per weekly session of Unit 3. */
export const questionSets: readonly QuestionSet[] = [
  purposesAudiences,
  pageLayout,
  navigationContent,
  userExperience,
  motionDynamicSeo,
  planningBrief,
  siteMaps,
  wireframing,
  visualStyle,
  creatingAssets,
  sourcingAssets,
  htmlStructure,
  htmlContentForms,
  cssStyling,
  cssLayout,
  jsComponents,
  jsImagesMotion,
  jsFilterSearchCart,
  standardsPublishing,
  testingReview,
];

export function findSet(id: string): QuestionSet | undefined {
  return questionSets.find((set) => set.id === id);
}
