import type { TrackId } from "@/data/algorithms_content";

export interface LearningTrack {
  id: TrackId;
  title: string;
  description: string;
}

export const learningTracks: LearningTrack[] = [
  {
    id: "practitioner",
    title: "ML Practitioner",
    description:
      "Learn how to prepare data, train classical models, evaluate results, and diagnose where machine-learning systems fail.",
  },
  {
    id: "modern-ai",
    title: "Modern AI Systems",
    description:
      "Follow the path from neural networks and backpropagation to transformers, retrieval, fine-tuning, evaluation, and inference.",
  },
];

export function getTrackAnchor(trackId: TrackId) {
  return `track-${trackId}`;
}
