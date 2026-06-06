"use client";

import { useHydrated } from "@/lib/useHydrated";
import D3Visualization from "./visualizations/D3Visualization";

interface Props {
  algorithmId: string;
}

export default function AlgorithmVisualization({ algorithmId }: Props) {
  const isHydrated = useHydrated();

  if (!isHydrated) {
    return (
      <div
        className="min-h-[450px] animate-pulse border border-outline bg-surface-container-low sm:min-h-[550px]"
        data-testid="visualization-loading"
        aria-label="Loading interactive visualization"
        aria-busy="true"
      />
    );
  }

  return <D3Visualization algorithmId={algorithmId} />;
}
