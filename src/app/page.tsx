"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import AlgorithmCard from "@/components/ui/AlgorithmCard";
import { algorithms } from "@/data/algorithms";
import {
  getCategoryColor,
  getAlgorithmIcon,
  getFormulaPreview,
} from "@/lib/algorithmPresentation";

const featuredTracks = [
  {
    title: "Supervised Learning",
    description:
      "Start with regression, classification, trees, and ensemble methods.",
    href: "/algorithms/supervised",
    accent: "primary" as const,
    count: algorithms.filter((a) => a.category === "Supervised").length,
  },
  {
    title: "Unsupervised Learning",
    description:
      "Explore clustering, density estimation, and dimensionality reduction.",
    href: "/algorithms/unsupervised",
    accent: "secondary" as const,
    count: algorithms.filter((a) => a.category === "Unsupervised").length,
  },
  {
    title: "Deep Learning",
    description:
      "Study multilayer networks, CNNs, RNNs, and representation learning.",
    href: "/algorithms/deep-learning",
    accent: "tertiary" as const,
    count: algorithms.filter((a) => a.category === "Deep Learning").length,
  },
] as const;

const heroStats = [
  { label: "Tracks", value: "3" },
  { label: "Algorithms", value: `${algorithms.length}` },
  { label: "Interactive Labs", value: "1" },
] as const;

const accentBorderMap = {
  primary: "border-l-primary hover:shadow-[0_2px_16px_-4px_rgba(173,198,255,0.12)]",
  secondary: "border-l-secondary hover:shadow-[0_2px_16px_-4px_rgba(208,188,255,0.12)]",
  tertiary: "border-l-tertiary hover:shadow-[0_2px_16px_-4px_rgba(123,208,255,0.12)]",
} as const;

const accentBadgeMap = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  tertiary: "bg-tertiary/10 text-tertiary",
} as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const stagger: Variants = {
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative overflow-hidden px-6 py-14 sm:px-8 lg:px-12 lg:py-20">
        {/* Decorative gradient orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="hero-gradient-orb hero-gradient-orb--primary" />
          <div className="hero-gradient-orb hero-gradient-orb--secondary" />
          <div className="hero-gradient-orb hero-gradient-orb--tertiary" />
        </div>

        <div className="relative z-10 mr-auto grid max-w-[1400px] gap-10 xl:grid-cols-[minmax(0,1.08fr)_320px] xl:items-end">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-primary">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              Interactive ML curriculum
            </div>

            <h1 className="max-w-4xl font-headline text-4xl font-bold leading-[1.05] tracking-tight text-on-surface sm:text-5xl lg:text-6xl xl:text-7xl">
              Understand AI,{" "}
              <span className="bg-gradient-to-r from-primary via-tertiary to-secondary bg-clip-text text-transparent">
                Mathematically
              </span>{" "}
              & Intuitively
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-on-surface-variant sm:text-lg">
              Explore machine learning algorithms through concise explanations,
              polished visual intuition, readable mathematical logic, code
              examples, and a browser-based neural playground you can manipulate
              yourself.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/algorithms/supervised"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-on-primary transition-all duration-200 hover:brightness-110 hover:shadow-lg hover:shadow-primary/20 sm:px-8 sm:text-base"
              >
                Start Learning
              </Link>

              <Link
                href="/algorithms/deep-learning"
                className="inline-flex items-center justify-center rounded-xl border border-outline-variant/50 bg-surface-container-high px-6 py-3.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-highest sm:px-8 sm:text-base"
              >
                Explore Curriculum
              </Link>

              <Link
                href="/playground"
                className="inline-flex items-center justify-center rounded-xl border border-tertiary/30 bg-tertiary/8 px-6 py-3.5 text-sm font-semibold text-tertiary transition-colors hover:bg-tertiary/12 sm:px-8 sm:text-base"
              >
                Open Playground
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-outline-variant/30 bg-surface-container-high/80 p-4 backdrop-blur-sm"
              >
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant/60">
                  {stat.label}
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-on-surface">
                  {stat.value}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Learning tracks */}
      <section className="px-6 pb-16 sm:px-8 lg:px-12 lg:pb-20">
        <div className="mr-auto max-w-[1400px]">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/60">
                Curriculum
              </p>
              <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
                Structured learning tracks
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-on-surface-variant sm:text-base">
                Move through the curriculum by category, then drill into each
                algorithm for intuition, logic, code, strengths, and
                limitations.
              </p>
            </div>

            <Link
              href="/algorithms/supervised"
              className="inline-flex w-fit items-center justify-center rounded-full bg-surface-container-high px-4 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
            >
              View all topics
            </Link>
          </div>

          <motion.div
            className="grid grid-cols-1 gap-4 lg:grid-cols-3"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            {featuredTracks.map((track, i) => (
              <motion.div key={track.title} variants={fadeUp} custom={i}>
                <Link
                  href={track.href}
                  className={`group flex h-full flex-col rounded-xl border-l-[3px] border border-outline-variant/30 bg-surface-container-high p-5 transition-all duration-300 hover:bg-surface-container-highest hover:-translate-y-0.5 ${accentBorderMap[track.accent]}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${accentBadgeMap[track.accent]}`}
                    >
                      {track.title}
                    </div>
                    <span className="text-xs font-medium text-on-surface-variant/50">
                      {track.count} topics
                    </span>
                  </div>
                  <p className="mt-4 flex-1 text-sm leading-7 text-on-surface-variant">
                    {track.description}
                  </p>
                  <div className="mt-5 text-sm font-semibold text-on-surface-variant transition-colors group-hover:text-primary">
                    Open track →
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* All algorithms grid */}
      <section className="px-6 pb-20 sm:px-8 lg:px-12 lg:pb-24">
        <div className="mr-auto max-w-[1400px]">
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/60">
                Foundations
              </p>
              <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">
                Core Foundations
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-on-surface-variant sm:text-base">
                Master the algorithms that shape modern machine learning
                systems, from classical models to deep learning architectures.
              </p>
            </div>

            <div className="hidden rounded-full border border-outline-variant/30 bg-surface-container-high/80 px-4 py-2 text-sm font-medium text-on-surface-variant md:inline-flex">
              {algorithms.length} topics available
            </div>
          </div>

          <motion.div
            className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
          >
            {algorithms.map((algorithm, i) => (
              <motion.div key={algorithm.id} variants={fadeUp} custom={i}>
                <AlgorithmCard
                  title={algorithm.title}
                  description={algorithm.shortDescription}
                  formula={getFormulaPreview(algorithm.mathematics)}
                  icon={getAlgorithmIcon(algorithm.id)}
                  slug={algorithm.id}
                  color={getCategoryColor(algorithm.category)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Playground CTA */}
      <section className="px-6 pb-24 sm:px-8 lg:px-12 lg:pb-32">
        <div className="mr-auto max-w-[1400px]">
          <div className="shimmer-border rounded-2xl">
            <div className="rounded-2xl bg-surface-container p-8 sm:p-10 lg:p-12">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-tertiary/20 bg-tertiary/8 px-3 py-1 text-xs font-bold uppercase tracking-wider text-tertiary">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-tertiary" />
                    Interactive Lab
                  </div>
                  <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">
                    Neural Network Playground
                  </h2>
                  <p className="mt-4 text-base leading-8 text-on-surface-variant">
                    Build classification datasets, tune model settings, and watch
                    a real neural network learn a decision boundary in your
                    browser. Full backpropagation, no shortcuts.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/playground"
                    className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-on-primary transition-all duration-200 hover:brightness-110 hover:shadow-lg hover:shadow-primary/20"
                  >
                    Open Playground
                  </Link>
                  <Link
                    href="/algorithms/neural-networks"
                    className="inline-flex items-center justify-center rounded-xl border border-outline-variant/50 bg-surface-container-high px-6 py-3.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-highest"
                  >
                    Neural Networks Lesson
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
