import AlgorithmCard from "@/components/ui/AlgorithmCard";
import { Algorithm, AlgorithmCategory } from "@/data/algorithms";

interface AlgorithmCategoryPageProps {
  title: string;
  eyebrow: string;
  description: string;
  category: AlgorithmCategory;
  algorithms: Algorithm[];
}

const categoryColors: Record<
  AlgorithmCategory,
  {
    accent: "primary" | "secondary" | "tertiary";
    badge: string;
    badgeText: string;
    statLabel: string;
    orbClass: string;
  }
> = {
  Supervised: {
    accent: "primary",
    badge: "bg-primary/10",
    badgeText: "text-primary",
    statLabel: "Labelled data",
    orbClass: "hero-gradient-orb--primary",
  },
  Unsupervised: {
    accent: "secondary",
    badge: "bg-secondary/10",
    badgeText: "text-secondary",
    statLabel: "Hidden structure",
    orbClass: "hero-gradient-orb--secondary",
  },
  "Deep Learning": {
    accent: "tertiary",
    badge: "bg-tertiary/10",
    badgeText: "text-tertiary",
    statLabel: "Representation learning",
    orbClass: "hero-gradient-orb--tertiary",
  },
};

function getFormulaPreview(math: string): string {
  const match = math.match(/\$\$([\s\S]*?)\$\$/);
  return match ? match[1].replace(/\s+/g, " ").trim() : "f(x) = ...";
}

function getCategoryStats(category: AlgorithmCategory, count: number) {
  switch (category) {
    case "Supervised":
      return [
        { label: "Track size", value: `${count} algorithms`, icon: "📊" },
        { label: "Best for", value: "Prediction & classification", icon: "🎯" },
        { label: "Signal", value: "Inputs paired with labels", icon: "🏷️" },
      ];
    case "Unsupervised":
      return [
        { label: "Track size", value: `${count} algorithms`, icon: "📊" },
        { label: "Best for", value: "Clustering & compression", icon: "🔬" },
        { label: "Signal", value: "Patterns without labels", icon: "🧩" },
      ];
    case "Deep Learning":
      return [
        { label: "Track size", value: `${count} algorithms`, icon: "📊" },
        { label: "Best for", value: "Vision, language, sequence tasks", icon: "🧠" },
        { label: "Signal", value: "Layered feature learning", icon: "⚡" },
      ];
    default:
      return [
        { label: "Track size", value: `${count} algorithms`, icon: "📊" },
        { label: "Best for", value: "Core ML concepts", icon: "🎯" },
        { label: "Signal", value: "Model intuition", icon: "💡" },
      ];
  }
}

export default function AlgorithmCategoryPage({
  title,
  eyebrow,
  description,
  category,
  algorithms,
}: AlgorithmCategoryPageProps) {
  const theme = categoryColors[category];
  const stats = getCategoryStats(category, algorithms.length);

  return (
    <div className="relative min-h-screen px-6 py-10 sm:px-8 lg:px-12">
      {/* Decorative gradient orb */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={`hero-gradient-orb ${theme.orbClass}`} />
      </div>

      <section className="relative z-10 mx-auto mb-12 max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div
            className={`inline-flex items-center rounded-full border border-current/15 px-3 py-1 text-xs font-bold uppercase tracking-wider ${theme.badge} ${theme.badgeText}`}
          >
            {eyebrow}
          </div>
          <div className="inline-flex items-center rounded-full bg-surface-container-high/80 px-3 py-1 text-xs font-medium text-on-surface-variant/70">
            {theme.statLabel}
          </div>
        </div>

        <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <h1 className="mb-5 font-headline text-4xl font-bold tracking-tight text-on-surface sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="max-w-3xl text-base leading-8 text-on-surface-variant sm:text-lg">
              {description}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-outline-variant/30 bg-surface-container-high/80 p-4 backdrop-blur-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{stat.icon}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant/60">
                    {stat.label}
                  </span>
                </div>
                <div className="mt-2 text-sm font-semibold leading-6 text-on-surface">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant/40">
              In this track
            </p>
            <h2 className="font-headline text-2xl font-semibold text-on-surface sm:text-3xl">
              Algorithms
            </h2>
          </div>

          <div className="hidden rounded-full border border-outline-variant/30 bg-surface-container-high/80 px-4 py-2 text-sm font-medium text-on-surface-variant md:inline-flex">
            {algorithms.length} topics
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {algorithms.map((algorithm) => (
            <AlgorithmCard
              key={algorithm.id}
              title={algorithm.title}
              description={algorithm.shortDescription}
              formula={getFormulaPreview(algorithm.mathematics)}
              icon={"data_object"}
              slug={algorithm.id}
              color={theme.accent}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
