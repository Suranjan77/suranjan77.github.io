import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { TrackId } from '@/data/algorithms_content';
import { getTrackModules } from '@/lib/prerequisiteGraph';

const trackMetadata: Record<TrackId, { title: string; description: string }> = {
  foundations: {
    title: 'Mathematical Foundations',
    description: 'Core mathematics for machine learning: calculus, linear algebra, probability, and statistical inference.',
  },
  practitioner: {
    title: 'ML Practitioner',
    description: 'Classical machine learning algorithms: regression, classification, clustering, and model evaluation.',
  },
  'modern-ai': {
    title: 'Modern AI',
    description: 'Deep learning, transformers, large language models, and modern AI systems.',
  },
};

interface TrackPageProps {
  params: Promise<{ trackId: string }>;
}

export function generateStaticParams() {
  return [
    { trackId: 'foundations' },
    { trackId: 'practitioner' },
    { trackId: 'modern-ai' },
  ];
}

export async function generateMetadata({ params }: TrackPageProps): Promise<Metadata> {
  const { trackId } = await params;
  const meta = trackMetadata[trackId as TrackId];

  if (!meta) {
    return {
      title: 'Track Not Found | ML Learn',
      description: 'The requested learning track could not be found.',
    };
  }

  return {
    title: `${meta.title} | ML Learn`,
    description: meta.description,
  };
}

export default async function TrackDetailPage({ params }: TrackPageProps) {
  const { trackId } = await params;

  // Validate trackId
  if (trackId !== 'foundations' && trackId !== 'practitioner' && trackId !== 'modern-ai') {
    notFound();
  }

  const track = trackId as TrackId;
  const meta = trackMetadata[track];
  const modules = getTrackModules(track);

  return (
    <div className="mx-auto max-w-[1360px] px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
      <div className="mb-12">
        <Link
          href="/tracks"
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary hover:underline"
        >
          ← Back to Tracks
        </Link>
        <h1 className="mt-4 font-headline text-4xl font-medium leading-tight text-on-surface sm:text-5xl">
          {meta.title}
        </h1>
        <p className="mt-4 max-w-2xl text-base font-medium leading-8 text-on-surface-variant">
          {meta.description}
        </p>
      </div>

      <div className="space-y-4">
        {modules.map((mod, index) => (
          <Link
            key={mod.id}
            href={`/algorithms/${mod.id}`}
            className="group flex flex-col justify-between border border-outline bg-surface p-6 transition-colors hover:border-primary sm:flex-row sm:items-center"
          >
            <div className="flex-1 pr-6">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="font-mono text-xs text-on-surface-variant">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h2 className="font-headline text-xl font-medium text-on-surface group-hover:text-primary">
                  {mod.title}
                </h2>
                <span className="border border-outline bg-surface-container-high px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-on-surface">
                  {mod.category}
                </span>
              </div>
              <p className="mt-2 text-sm font-medium leading-6 text-on-surface-variant">
                {mod.shortDescription}
              </p>
            </div>

            <div className="mt-4 flex shrink-0 items-center gap-6 sm:mt-0">
              {mod.estimatedMinutes && (
                <span className="font-mono text-xs text-on-surface-variant">
                  {mod.estimatedMinutes} min
                </span>
              )}
              {mod.difficulty && (
                <div className="flex gap-1" aria-label={`Difficulty ${mod.difficulty} of 4`}>
                  {[1, 2, 3, 4].map((dot) => (
                    <span
                      key={dot}
                      className={`h-1.5 w-1.5 ${
                        dot <= (mod.difficulty || 1) ? 'bg-on-surface-variant' : 'bg-outline'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
