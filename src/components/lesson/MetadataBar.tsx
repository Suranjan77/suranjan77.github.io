import React from 'react';
import { Difficulty, TrackId } from '@/data/algorithms_content/learningModuleTypes';

interface MetadataBarProps {
  difficulty: Difficulty | undefined;
  estimatedMinutes: number | undefined;
  tracks: TrackId[] | undefined;
}

export default function MetadataBar({ difficulty, estimatedMinutes, tracks }: MetadataBarProps) {
  if (difficulty === undefined && estimatedMinutes === undefined && (!tracks || tracks.length === 0)) {
    return null;
  }

  const getDifficultyLabel = (diff: Difficulty) => {
    switch (diff) {
      case 1:
        return 'Beginner';
      case 2:
        return 'Intermediate';
      case 3:
        return 'Advanced';
      case 4:
        return 'Expert';
      default:
        return '';
    }
  };

  const getDifficultyClass = (diff: Difficulty) => {
    switch (diff) {
      case 1:
        return 'bg-success/10 text-success border border-success/20';
      case 2:
        return 'bg-primary/10 text-primary border border-primary/20';
      case 3:
        return 'bg-warning/10 text-warning border border-warning/20';
      case 4:
        return 'bg-error/10 text-error border border-error/20';
      default:
        return '';
    }
  };

  const formatTrackLabel = (track: TrackId) => {
    switch (track) {
      case 'practitioner':
        return 'Practitioner';
      case 'modern-ai':
        return 'Modern AI';
      default:
        return track;
    }
  };

  return (
    <div className="mb-6 flex flex-wrap gap-4 border-b border-outline/30 pb-4 text-xs font-mono">
      {difficulty !== undefined && (
        <div className="flex items-center gap-1.5">
          <span className="text-on-surface-variant/65">Difficulty:</span>
          <span className={`rounded px-2 py-0.5 font-bold uppercase ${getDifficultyClass(difficulty)}`}>
            {getDifficultyLabel(difficulty)}
          </span>
        </div>
      )}

      {estimatedMinutes !== undefined && (
        <div className="flex items-center gap-1.5">
          <span className="text-on-surface-variant/65">Reading Time:</span>
          <span className="rounded bg-outline/10 text-on-surface border border-outline/20 px-2 py-0.5 font-bold">
            {estimatedMinutes} min
          </span>
        </div>
      )}

      {tracks && tracks.length > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="text-on-surface-variant/65">Track:</span>
          <div className="flex gap-1">
            {tracks.map(t => (
              <span key={t} className="rounded bg-tertiary/10 text-tertiary border border-tertiary/20 px-2 py-0.5 font-bold uppercase">
                {formatTrackLabel(t)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
