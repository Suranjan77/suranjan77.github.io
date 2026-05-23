import Link from "next/link";
import AlgorithmVisualization from "@/components/ui/AlgorithmVisualization";
import LogicContent from "@/components/ui/LogicContent";
import { type Algorithm } from "@/data/algorithms";
import {
  getAccentClasses,
  getCategoryColor,
  getCategoryLabel,
  getCategoryRoute,
} from "@/lib/algorithmPresentation";

interface FoundationViewProps {
  algorithm: Algorithm;
  supportSections: {
    assumptions: string[];
    references: { title: string; url?: string; source: string }[];
  };
}

export default function FoundationView({
  algorithm,
  supportSections,
}: FoundationViewProps) {
  const categoryRoute = getCategoryRoute(algorithm.category);
  const categoryLabel = getCategoryLabel(algorithm.category);
  const accent = getAccentClasses(getCategoryColor(algorithm.category));

  return (
    <div className="relative px-5 py-8 sm:px-8 lg:px-12">
      <section className="relative z-10 mx-auto max-w-6xl">
        {/* Breadcrumb navigation */}
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-on-surface-variant/70">
          <Link href="/" className="transition-colors hover:text-primary">
            Home
          </Link>
          <span className="text-outline-variant">›</span>
          <Link
            href={categoryRoute}
            className="transition-colors hover:text-primary"
          >
            {categoryLabel}
          </Link>
          <span className="text-outline-variant">›</span>
          <span className="font-medium text-on-surface-variant">
            {algorithm.title}
          </span>
        </nav>

        {/* Page header */}
        <div className="mb-10 border border-outline bg-surface-container-low p-6 sm:p-8 lg:p-10">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div
              className={`inline-flex items-center px-4 py-1.5 text-xs font-medium tracking-wide ${accent.badge}`}
            >
              Machine Learning Foundation
            </div>
          </div>

          <h1 className="mb-5 max-w-4xl text-balance font-headline text-4xl font-semibold tracking-normal text-on-surface sm:text-5xl lg:text-6xl">
            {algorithm.title}
          </h1>
          <div className="max-w-auto sm:text-lg">
            <LogicContent content={algorithm.fullDescription} />
          </div>
        </div>
      </section>

      {/* Full-width stacked content sections */}
      <section className="relative z-10 mx-auto max-w-6xl space-y-8">
        {/* Intuition + Visualization — full width */}
        <div className="overflow-hidden border border-outline bg-surface-container-low">
          <div className="border-b border-outline px-6 py-5 sm:px-8">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border border-tertiary/30 bg-tertiary/12 text-lg font-semibold text-tertiary">
                i
              </div>
              <div>
                <h2 className="font-headline text-xl font-semibold tracking-normal text-on-surface sm:text-2xl">
                  Intuition
                </h2>
                <p className="text-xs text-on-surface-variant/70">
                  How to think conceptually about this mathematics
                </p>
              </div>
            </div>
            <div className="mt-4">
              <LogicContent content={algorithm.intuition} />
            </div>
          </div>

          <div className="p-3 sm:p-6">
            <div className="min-h-[380px]">
              <AlgorithmVisualization algorithmId={algorithm.id} />
            </div>
          </div>
        </div>

        {/* The Logic — full width */}
        <div className="overflow-hidden border border-outline bg-surface-container-low">
          <div className="border-b border-outline px-6 py-5 sm:px-8">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border border-primary/30 bg-primary/12 text-lg text-primary">
                ∑
              </div>
              <div>
                <h2 className="font-headline text-xl font-semibold tracking-normal text-on-surface sm:text-2xl">
                  Core Mathematics
                </h2>
                <p className="text-xs text-on-surface-variant/70">
                  Fundamental theorems and formulations
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 sm:px-8 sm:py-7">
            <LogicContent content={algorithm.mathematics} />
          </div>
        </div>

        {/* Properties & Challenges — side by side */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="overflow-hidden border border-outline bg-surface-container-low">
            <div className="px-6 py-6 sm:px-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center border border-primary/30 bg-primary/12 text-sm font-bold text-primary">
                  ✓
                </div>
                <h2 className="font-headline text-xl font-bold text-on-surface">
                  Key Properties & Applications
                </h2>
              </div>

              <ul className="space-y-3">
                {algorithm.pros.map((pro, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 bg-surface-container px-4 py-3 accent-left-primary"
                  >
                    <div className="w-full text-sm leading-7 text-on-surface-variant">
                      <LogicContent content={pro} size="sm" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="overflow-hidden border border-outline bg-surface-container-low">
            <div className="px-6 py-6 sm:px-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center border border-error/30 bg-error/12 text-sm font-bold text-error">
                  !
                </div>
                <h2 className="font-headline text-xl font-bold text-on-surface">
                  Constraints & Challenges
                </h2>
              </div>

              <ul className="space-y-3">
                {algorithm.cons.map((con, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 bg-surface-container px-4 py-3 accent-left-error"
                  >
                    <div className="w-full text-sm leading-7 text-on-surface-variant">
                      <LogicContent content={con} size="sm" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* References */}
        {supportSections.references.length > 0 && (
          <div className="flex flex-col gap-6">
            <div className="overflow-hidden border border-outline bg-surface-container-low">
              <div className="border-b border-outline px-6 py-5 sm:px-8">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center border border-outline bg-surface-container-highest text-sm font-bold text-on-surface">
                    R
                  </div>
                  <div>
                    <h2 className="font-headline text-xl font-semibold text-on-surface">
                      References
                    </h2>
                    <p className="text-xs text-on-surface-variant/70">
                      Standardized citations for further reading
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-6 sm:px-8">
                <ul className="space-y-4">
                  {supportSections.references.map((reference, index) => (
                    <li
                      key={index}
                      className="rounded-lg border border-outline bg-surface-container p-4"
                    >
                      <p className="mt-1 text-sm leading-6 text-on-surface-variant/90">
                        {reference.source}
                      </p>
                      {reference.url ? (
                        <a
                          href={reference.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex text-sm font-medium text-primary transition-colors hover:text-primary/80"
                        >
                          Open reference
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </section>

      <footer className="relative z-10 mx-auto mt-16 flex max-w-6xl flex-col gap-4 border-t border-outline pt-8 text-sm text-on-surface-variant/70 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 Learning AI & ML</p>
        <div className="flex flex-wrap gap-4 sm:gap-6">
          <Link
            href={categoryRoute}
            className="transition-colors hover:text-primary"
          >
            Back to Curriculum
          </Link>
          <Link
            href="/playground"
            className="transition-colors hover:text-primary"
          >
            Open Playground
          </Link>
          <Link href="/" className="transition-colors hover:text-primary">
            Home
          </Link>
        </div>
      </footer>
    </div>
  );
}
