"use client";

import D3Visualization from "./visualizations/D3Visualization";

interface Props {
  algorithmId: string;
}

export default function AlgorithmVisualization({ algorithmId }: Props) {
  return <D3Visualization algorithmId={algorithmId} />;
}
