"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import type {
  LearningModule,
  TrackId,
} from "@/data/algorithms_content";
import { getTrackAnchor, learningTracks } from "@/lib/tracks";
import CurriculumExplorer from "./CurriculumExplorer";

interface TrackCurriculumExplorerProps {
  algorithms: LearningModule[];
}

export default function TrackCurriculumExplorer({
  algorithms,
}: TrackCurriculumExplorerProps) {
  const [openTracks, setOpenTracks] = useState<Set<TrackId>>(
    () => new Set(["foundations"]),
  );

  useEffect(() => {
    const openHashTrack = () => {
      const track = learningTracks.find(
        ({ id }) => `#${getTrackAnchor(id)}` === window.location.hash,
      );
      if (!track) return;

      setOpenTracks((current) => new Set(current).add(track.id));
    };

    openHashTrack();
    window.addEventListener("hashchange", openHashTrack);
    return () => window.removeEventListener("hashchange", openHashTrack);
  }, []);

  const toggleTrack = (trackId: TrackId) => {
    setOpenTracks((current) => {
      const next = new Set(current);
      if (next.has(trackId)) next.delete(trackId);
      else next.add(trackId);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {learningTracks.map((track, trackIndex) => {
        const modules = algorithms.filter((algorithm) =>
          algorithm.tracks?.includes(track.id),
        );
        const isOpen = openTracks.has(track.id);
        const panelId = `${getTrackAnchor(track.id)}-modules`;

        return (
          <section
            key={track.id}
            id={getTrackAnchor(track.id)}
            className="scroll-mt-28 border border-outline bg-surface"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggleTrack(track.id)}
              className="group grid w-full gap-5 px-5 py-6 text-left transition-colors hover:bg-surface-container-low focus-visible:outline-primary sm:grid-cols-[48px_minmax(0,1fr)_auto] sm:items-center sm:px-7"
            >
              <span className="font-mono text-[11px] text-on-surface-variant">
                {String(trackIndex + 1).padStart(2, "0")}
              </span>
              <span>
                <span className="block font-headline text-2xl font-medium text-on-surface group-hover:text-primary sm:text-3xl">
                  {track.title}
                </span>
                <span className="mt-2 block max-w-3xl text-sm font-medium leading-6 text-on-surface-variant">
                  {track.description}
                </span>
              </span>
              <span className="flex items-center justify-between gap-5 sm:justify-end">
                <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
                  {modules.length} modules
                </span>
                <ChevronDown
                  size={19}
                  aria-hidden="true"
                  className={`shrink-0 text-primary transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </span>
            </button>

            {isOpen && (
              <div id={panelId} className="border-t border-outline p-3 sm:p-5">
                <CurriculumExplorer
                  algorithms={modules}
                  defaultExpanded={track.id === "foundations"}
                />
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
