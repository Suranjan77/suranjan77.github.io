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
  {
    id: "computer-vision",
    title: "Computer Vision",
    description:
      "Go from convolutions to detection, segmentation, vision transformers, and diffusion-based image generation — the modern visual-understanding stack.",
  },
];

export function getTrackAnchor(trackId: TrackId) {
  return `track-${trackId}`;
}
