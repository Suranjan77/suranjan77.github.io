import Link from 'next/link';
import { TrackId, algorithmsList } from '@/data/algorithms_content';

const tracks = [
  { id: 'foundations' as TrackId, title: 'Mathematical Foundations', description: 'Core mathematics for machine learning: calculus, linear algebra, probability, and statistical inference.' },
  { id: 'practitioner' as TrackId, title: 'ML Practitioner', description: 'Classical machine learning algorithms: regression, classification, clustering, and model evaluation.' },
  { id: 'modern-ai' as TrackId, title: 'Modern AI', description: 'Deep learning, transformers, large language models, and modern AI systems.' },
];

export const metadata = {
  title: "Learning Tracks",
  description: "Structured paths from math foundations to modern AI systems.",
};

export default function TracksPage() {
  return (
    <div className="mx-auto max-w-[1360px] px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
      <div className="mb-12">
        <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.24em] text-on-surface-variant">
          Learning Paths
        </p>
        <h1 className="font-headline text-4xl font-medium leading-tight text-on-surface sm:text-5xl">
          Curated Learning Tracks
        </h1>
        <p className="mt-4 max-w-2xl text-base font-medium leading-8 text-on-surface-variant">
          Choose a path optimized for your goals. Follow a coherent sequence from the absolute fundamentals to state-of-the-art architectures.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tracks.map((track) => {
          // Count modules in track
          const count = algorithmsList.filter(m => m.tracks?.includes(track.id)).length;

          return (
            <Link
              key={track.id}
              href={`/tracks/${track.id}`}
              className="group flex flex-col justify-between border border-outline bg-surface p-6 transition-colors hover:border-primary sm:p-8"
            >
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
                  Track
                </span>
                <h2 className="mt-4 font-headline text-2xl font-medium leading-tight text-on-surface group-hover:text-primary">
                  {track.title}
                </h2>
                <p className="mt-4 text-sm font-medium leading-7 text-on-surface-variant">
                  {track.description}
                </p>
              </div>

              <div className="mt-8">
                <div className="mb-3 h-px bg-outline" />
                <span className="font-mono text-xs text-on-surface-variant">
                  {count} {count === 1 ? 'module' : 'modules'}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
