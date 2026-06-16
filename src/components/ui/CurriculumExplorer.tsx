"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import katex from "katex";
import ReactMarkdown from "react-markdown";
import { markdownRehypePlugins, markdownRemarkPlugins } from "@/lib/markdown";
import type { Algorithm } from "@/data/algorithms";
import { formatLogicContent, getFormulaPreview } from "@/lib/algorithmPresentation";
import { useReducedMotion } from "@/lib/useReducedMotion";
import AlgorithmCard from "./AlgorithmCard";

interface CurriculumExplorerProps {
  algorithms: Algorithm[];
  defaultExpanded?: boolean;
}

const foundationCategories = new Set([
  "Calculus",
  "Linear Algebra",
  "Probability Theory",
]);

const deepCategories = new Set([
  "Neural Networks / Deep Learning",
  "Convolutional Neural Networks",
  "Computer Vision",
  "Natural Language Processing",
  "Autoencoders",
  "Transformers",
  "Large Language Models",
]);

function getDifficulty(category: Algorithm["category"]): 1 | 2 | 3 {
  if (foundationCategories.has(category)) return 1;
  if (deepCategories.has(category)) return 3;
  return 2;
}

function useColumnCount() {
  const [columns, setColumns] = useState(1);

  useEffect(() => {
    const update = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        setColumns(3);
      } else if (window.matchMedia("(min-width: 640px)").matches) {
        setColumns(2);
      } else {
        setColumns(1);
      }
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return columns;
}

function chunkAlgorithms(algorithms: Algorithm[], columns: number) {
  const rows: Algorithm[][] = [];
  for (let i = 0; i < algorithms.length; i += columns) {
    rows.push(algorithms.slice(i, i + columns));
  }
  return rows;
}

function ExpandedPanel({ algorithm }: { algorithm: Algorithm }) {
  const mathRef = useRef<HTMLDivElement>(null);
  const formula = getFormulaPreview(algorithm.mathematics);
  const previewContent = formatLogicContent(algorithm.fullDescription);

  useEffect(() => {
    if (!mathRef.current) return;

    try {
      katex.render(formula, mathRef.current, {
        displayMode: true,
        throwOnError: false,
      });
    } catch {
      mathRef.current.textContent = formula;
    }
  }, [formula]);

  return (
    <div className="border-x border-b border-outline bg-border">
      <div className="grid gap-px lg:grid-cols-[170px_minmax(0,1fr)_360px]">
        <aside className="bg-surface-container-low p-5 sm:p-6">
          <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-primary">
            Module
          </p>
          <div className="mt-8 space-y-5">
            <div>
              <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
                Level
              </p>
              <div className="mt-2 flex gap-1.5" aria-label={`Difficulty ${getDifficulty(algorithm.category)} of 3`}>
                {[1, 2, 3].map((dot) => (
                  <span
                    key={dot}
                    className={dot <= getDifficulty(algorithm.category) ? "h-1.5 w-1.5 bg-primary" : "h-1.5 w-1.5 bg-outline-dark"}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
                Category
              </p>
              <p className="mt-2 text-sm font-medium leading-6 text-on-surface">
                {algorithm.category}
              </p>
            </div>
          </div>
        </aside>

        <section className="bg-surface p-5 sm:p-7">
          <p className="mb-3 font-mono text-[12px] uppercase tracking-[0.08em] text-primary">
            Preview
          </p>
          <h3 className="max-w-3xl font-headline text-2xl font-medium leading-tight text-on-surface sm:text-3xl">
            {algorithm.title}
          </h3>
          <div className="mt-5 max-w-3xl text-sm font-medium leading-7 text-on-surface-variant sm:text-[15px]">
            <ReactMarkdown
              remarkPlugins={markdownRemarkPlugins}
              rehypePlugins={markdownRehypePlugins}
              components={{
                p: ({ children }) => (
                  <p className="mb-3 text-sm font-medium leading-7 text-on-surface-variant last:mb-0 sm:text-[15px]">
                    {children}
                  </p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-on-surface">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="text-on-surface">{children}</em>
                ),
                ul: ({ children }) => (
                  <ul className="my-3 ml-4 list-disc space-y-1 marker:text-primary">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="my-3 ml-4 list-decimal space-y-1 marker:text-primary">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-sm leading-7 text-on-surface-variant sm:text-[15px]">
                    {children}
                  </li>
                ),
                code: ({ children }) => (
                  <code className="border border-outline bg-surface-container-high px-1.5 py-0.5 font-mono text-[0.9em] text-primary">
                    {children}
                  </code>
                ),
              }}
            >
              {previewContent}
            </ReactMarkdown>
          </div>
        </section>

        <section className="bg-surface-container-low p-5 sm:p-7">
          <div className="crop-marks relative flex min-h-full flex-col border border-outline bg-surface">
            <div className="border-b border-outline px-4 py-3">
              <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
                Key Equation
              </p>
            </div>
            <div
              ref={mathRef}
              className="flex min-h-[150px] flex-1 items-center overflow-x-auto px-4 py-6 font-mono text-sm text-on-surface"
            >
              {formula}
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-px border-t border-outline bg-border sm:grid-cols-[1fr_auto]">
        <div className="bg-surface-container-low px-5 py-4 sm:px-7">
          <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-on-surface-variant">
            Continue when ready for intuition, math, code, and interactive diagrams.
          </p>
        </div>
        <div className="bg-surface px-5 py-4 sm:px-7">
          <Link
            href={`/algorithms/${algorithm.id}`}
            className="inline-flex w-full justify-center border border-on-surface bg-on-surface px-5 py-3 font-mono text-[12px] uppercase tracking-[0.08em] text-background hover:bg-primary sm:w-auto"
          >
            Open Full Study
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CurriculumExplorer({
  algorithms,
  defaultExpanded = true,
}: CurriculumExplorerProps) {
  const columns = useColumnCount();
  const reducedMotion = useReducedMotion();
  const [selectedId, setSelectedId] = useState(
    defaultExpanded ? (algorithms[0]?.id ?? "") : "",
  );
  const rows = useMemo(() => chunkAlgorithms(algorithms, columns), [algorithms, columns]);

  const handleSelect = (algoId: string) => {
    const isOpening = selectedId !== algoId;
    setSelectedId(isOpening ? algoId : "");
    
    if (isOpening) {
      setTimeout(() => {
        const el = document.getElementById(`card-${algoId}`);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({
            top: y,
            behavior: reducedMotion ? "auto" : "smooth",
          });
        }
      }, 100);
    }
  };

  return (
    <div className="space-y-px">
      {rows.map((row) => {
        const selectedInRow = row.find((algorithm) => algorithm.id === selectedId);
        const panelId = selectedInRow
          ? `preview-${selectedInRow.id}`
          : undefined;

        return (
          <div key={row.map((algorithm) => algorithm.id).join("-")}>
            <div className="grid grid-cols-1 gap-px border-x border-t border-outline bg-border sm:grid-cols-2 lg:grid-cols-3">
              {row.map((algo) => (
                <AlgorithmCard
                  key={algo.id}
                  id={`card-${algo.id}`}
                  index={algorithms.findIndex((item) => item.id === algo.id)}
                  title={algo.title}
                  description={algo.shortDescription}
                  category={foundationCategories.has(algo.category) ? "Foundation" : deepCategories.has(algo.category) ? "Advanced" : "Method"}
                  difficulty={getDifficulty(algo.category)}
                  active={selectedId === algo.id}
                  controls={
                    selectedId === algo.id ? `preview-${algo.id}` : undefined
                  }
                  onClick={() => handleSelect(algo.id)}
                />
              ))}
            </div>
            {selectedInRow ? (
              <div id={panelId}>
                <ExpandedPanel algorithm={selectedInRow} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
