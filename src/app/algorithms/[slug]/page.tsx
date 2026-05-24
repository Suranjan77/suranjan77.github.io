import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { algorithms } from "@/data/algorithms";
import { algorithmSupplemental } from "@/data/algorithmSupplemental";
import AlgorithmVisualization from "@/components/ui/AlgorithmVisualization";
import CodeBlock from "@/components/ui/CodeBlock";
import LogicContent from "@/components/ui/LogicContent";
import {
  getAccentClasses,
  getAlgorithmBySlug,
  getCategoryColor,
  getCategoryLabel,
  getCategoryRoute,
} from "@/lib/algorithmPresentation";
import FoundationView from "./FoundationView";

function inferCodeLabel(code: string, title: string) {
  const normalized = code.toLowerCase();

  if (normalized.includes("torch") || normalized.includes("nn.module")) {
    return `${title.toLowerCase().replace(/\s+/g, "_")}.py · pytorch example`;
  }

  if (normalized.includes("sklearn")) {
    return `${title.toLowerCase().replace(/\s+/g, "_")}.py · scikit-learn example`;
  }

  return `${title.toLowerCase().replace(/\s+/g, "_")}.py · reference implementation`;
}

function getSummaryCards(pros: string[], cons: string[]) {
  return {
    bestUse:
      pros[0] ??
      "Works well when you need a practical, understandable baseline.",
    watchOut:
      cons[0] ??
      "Be careful about assumptions, data quality, and generalization.",
  };
}

function getSupportSections(slug: string) {
  const supplemental = algorithmSupplemental[slug];

  return {
    assumptions: supplemental?.assumptions ?? [],
    references: supplemental?.references ?? [],
  };
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const algorithm = getAlgorithmBySlug(resolvedParams.slug);

  if (!algorithm) {
    return {
      title: "Algorithm Not Found",
    };
  }

  return {
    title: algorithm.title,
    description: algorithm.shortDescription,
  };
}

export async function generateStaticParams() {
  return algorithms.map((algorithm) => ({
    slug: algorithm.id,
  }));
}

export default async function AlgorithmPage({ params }: PageProps) {
  const resolvedParams = await params;
  const algorithm = getAlgorithmBySlug(resolvedParams.slug);

  if (!algorithm) {
    notFound();
  }

  const categoryRoute = getCategoryRoute(algorithm.category);
  const categoryLabel = getCategoryLabel(algorithm.category);
  const accent = getAccentClasses(getCategoryColor(algorithm.category));
  const summary = getSummaryCards(algorithm.pros, algorithm.cons);
  const codeLabel = inferCodeLabel(algorithm.codeSnippet, algorithm.title);
  const supportSections = getSupportSections(algorithm.id);

  const isFoundation = [
    "Calculus",
    "Linear Algebra",
    "Probability Theory",
  ].includes(algorithm.category);
  if (isFoundation) {
    return (
      <FoundationView algorithm={algorithm} supportSections={supportSections} />
    );
  }

  return (
    <div className="relative px-4 py-6 sm:px-8 sm:py-8 lg:px-12">
      <section className="relative z-10 mx-auto max-w-6xl">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-[15px] text-on-surface-variant/70 sm:mb-8 sm:text-sm">
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

        <div className="mb-8 border border-outline bg-surface-container-low p-5 sm:mb-10 sm:p-8 lg:p-10">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div
              className={`inline-flex items-center px-4 py-2 text-sm font-medium tracking-wide sm:py-1.5 sm:text-xs ${accent.badge}`}
            >
              {categoryLabel}
            </div>
          </div>

          <h1 className="mb-5 max-w-4xl text-balance font-headline text-[2.35rem] font-semibold leading-tight tracking-normal text-on-surface sm:text-5xl lg:text-6xl">
            {algorithm.title}
          </h1>
          <div className="max-w-auto sm:text-lg">
            <LogicContent content={algorithm.fullDescription} />
          </div>
        </div>

        <div className="mb-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-outline bg-surface-container accent-left-success p-5">
            <div className="text-sm font-medium tracking-wide text-on-surface-variant/90 sm:text-[11px]">
              Best use
            </div>
            <div className="mt-3">
              <LogicContent content={summary.bestUse} size="sm" />
            </div>
          </div>

          <div className="rounded-lg border border-outline bg-surface-container accent-left-error p-5">
            <div className="text-sm font-medium tracking-wide text-on-surface-variant/90 sm:text-[11px]">
              Watch out for
            </div>
            <div className="mt-3">
              <LogicContent content={summary.watchOut} size="sm" />
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl space-y-8">
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
                <p className="text-sm text-on-surface-variant/70 sm:text-xs">
                  How to think about this algorithm
                </p>
              </div>
            </div>
            <div className="mt-4">
              <LogicContent content={algorithm.intuition} />
            </div>
          </div>

          <div className="p-2 sm:p-6">
            <div className="min-h-[380px]">
              <AlgorithmVisualization algorithmId={algorithm.id} />
            </div>
          </div>
        </div>

        <div className="overflow-hidden border border-outline bg-surface-container-low">
          <div className="border-b border-outline px-6 py-5 sm:px-8">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border border-primary/30 bg-primary/12 text-lg text-primary">
                ∑
              </div>
              <div>
                <h2 className="font-headline text-xl font-semibold tracking-normal text-on-surface sm:text-2xl">
                  The Logic
                </h2>
                <p className="text-sm text-on-surface-variant/70 sm:text-xs">
                  Mathematical core for {algorithm.title.toLowerCase()}
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 sm:px-8 sm:py-7">
            <LogicContent content={algorithm.mathematics} />
          </div>
        </div>

        <div className="overflow-hidden border border-outline bg-surface-container-lowest">
          <div className="flex flex-col gap-3 border-b border-outline bg-surface-container-low px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <p className="text-sm font-medium tracking-wide text-on-surface-variant/80 sm:text-[11px]">
                Code Example
              </p>
              <p className="mt-1 text-[15px] text-on-surface-variant sm:text-sm">
                {codeLabel}
              </p>
            </div>
          </div>

          <div className="p-0">
            <CodeBlock code={algorithm.codeSnippet} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="overflow-hidden border border-outline bg-surface-container-low">
            <div className="px-6 py-6 sm:px-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center border border-primary/30 bg-primary/12 text-sm font-bold text-primary">
                  ✓
                </div>
                <h2 className="font-headline text-xl font-bold text-on-surface">
                  Strengths
                </h2>
              </div>

              <ul className="space-y-3">
                {algorithm.pros.map((pro, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 bg-surface-container px-4 py-3 accent-left-primary"
                  >
                    <div className="w-full text-[15px] leading-7 text-on-surface-variant sm:text-sm">
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
                  Limitations
                </h2>
              </div>

              <ul className="space-y-3">
                {algorithm.cons.map((con, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 bg-surface-container px-4 py-3 accent-left-error"
                  >
                    <div className="w-full text-[15px] leading-7 text-on-surface-variant sm:text-sm">
                      <LogicContent content={con} size="sm" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Assumptions & References — stacked in rows*/}
        <div className="flex flex-col gap-6">
          <div className="overflow-hidden border border-outline bg-surface-container-low">
            <div className="border-b border-outline px-6 py-5 sm:px-8">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center border border-outline bg-surface-container-highest text-sm font-bold text-on-surface">
                  A
                </div>
                <div>
                  <h2 className="font-headline text-xl font-semibold text-on-surface">
                    Key Assumptions
                  </h2>
                  <p className="text-sm text-on-surface-variant/70 sm:text-xs">
                    Scope conditions and interpretation notes
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-6 sm:px-8">
              <ul className="space-y-3">
                {supportSections.assumptions.map((assumption, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 bg-surface-container px-4 py-3"
                  >
                    <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center bg-surface-container-highest text-xs font-bold text-on-surface-variant sm:h-5 sm:w-5 sm:text-[10px]">
                      {index + 1}
                    </span>
                    <div className="w-full text-[15px] leading-7 text-on-surface-variant sm:text-sm">
                      <LogicContent content={assumption} size="sm" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

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
                  <p className="text-sm text-on-surface-variant/70 sm:text-xs">
                    Books and papers for deeper study
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
                    <p className="mt-1 text-[15px] leading-7 text-on-surface-variant/90 sm:text-sm sm:leading-6">
                      {reference.source}
                    </p>
                    {reference.url ? (
                      <a
                        href={reference.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex text-[15px] font-medium text-primary transition-colors hover:text-primary/80 sm:text-sm"
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
      </section>

      <footer className="relative z-10 mx-auto mt-16 flex max-w-6xl flex-col gap-4 border-t border-outline pt-8 text-[15px] text-on-surface-variant/70 sm:flex-row sm:items-center sm:justify-between sm:text-sm">
        <p>© 2026 Learning AI & ML</p>
        <div className="flex flex-wrap gap-4 sm:gap-6">
          <Link
            href={categoryRoute}
            className="transition-colors hover:text-primary"
          >
            Back to {categoryLabel}
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
