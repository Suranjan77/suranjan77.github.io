"use client";

import Link from "next/link";
import CurriculumExplorer from "@/components/ui/CurriculumExplorer";
import { algorithms } from "@/data/algorithms";

const heroStats = [
  { label: "Modules", value: "13" },
  { label: "Interactive Lab", value: "1" },
] as const;

const pillars = [
  {
    glyph: "∂",
    title: "Mathematical Rigor",
    text: "Every concept grounded in formal theory. Proofs, derivations, and precise notation throughout.",
  },
  {
    glyph: "◎",
    title: "Visual Intuition",
    text: "Abstract ideas rendered geometrically. Diagrams, animations, and spatial reasoning before algebra.",
  },
  {
    glyph: "⌗",
    title: "Code-Oriented Thinking",
    text: "Algorithms expressed as executable logic. From pseudocode to working implementations.",
  },
] as const;

function HeroLossSurface() {
  return (
    <svg
      viewBox="0 0 420 260"
      role="img"
      aria-label="Contour diagram showing a gradient descent path"
      className="h-auto w-full"
    >
      <text x="50" y="46" className="fill-outline-dark font-mono text-[10px]">
        L(theta)
      </text>
      <g transform="translate(218 130) rotate(-3)">
        {[124, 100, 78, 58, 40, 24].map((rx) => (
          <ellipse
            key={rx}
            cx="0"
            cy="0"
            rx={rx}
            ry={rx * 0.42}
            fill="none"
            stroke="var(--color-outline)"
            strokeWidth="1"
          />
        ))}
      </g>
      <path
        d="M318 72 L286 98 L260 113 L236 126 L218 132"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="1.4"
        strokeDasharray="6 7"
      />
      {[
        [318, 72, 4.5],
        [286, 98, 3],
        [260, 113, 3],
        [236, 126, 2.8],
        [218, 132, 4.5],
      ].map(([cx, cy, r], index) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r={r}
          fill={index === 4 ? "var(--color-background)" : "var(--color-primary)"}
          stroke="var(--color-primary)"
          strokeWidth="1.3"
        />
      ))}
      <text x="230" y="124" className="fill-primary font-mono text-[9px]">
        min
      </text>
      <text x="262" y="226" className="fill-on-surface-variant font-mono text-[9px] tracking-[0.18em]">
        gradient descent
      </text>
      <text x="326" y="204" className="fill-outline-dark font-mono text-[9px]">
        theta
      </text>
    </svg>
  );
}

function NetworkDiagram() {
  const layers = [
    [[80, 85], [80, 205]],
    [[205, 85], [205, 145], [205, 205]],
    [[330, 85], [330, 145], [330, 205]],
    [[455, 145]],
  ];

  return (
    <svg viewBox="0 0 540 290" className="h-full min-h-[290px] w-full" aria-hidden="true">
      {layers.slice(0, -1).flatMap((layer, layerIndex) =>
        layer.flatMap(([x1, y1]) =>
          layers[layerIndex + 1].map(([x2, y2], index) => (
            <line
              key={`${layerIndex}-${x1}-${y1}-${index}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="var(--color-primary)"
              strokeOpacity={index % 2 === 0 ? 0.42 : 0.16}
              strokeWidth="1"
            />
          )),
        ),
      )}
      {layers.flatMap((layer, layerIndex) =>
        layer.map(([cx, cy], index) => (
          <circle
            key={`${layerIndex}-${index}`}
            cx={cx}
            cy={cy}
            r={layerIndex === 3 ? 10 : 8}
            fill="var(--color-background)"
            stroke={layerIndex === 3 ? "var(--color-primary)" : "var(--color-outline-dark)"}
            strokeWidth="1.5"
          />
        )),
      )}
      {["input", "hidden", "hidden", "output"].map((label, index) => (
        <text
          key={label + index}
          x={layers[index][0][0]}
          y="245"
          textAnchor="middle"
          className="fill-on-surface-variant font-mono text-[9px]"
        >
          {label}
        </text>
      ))}
    </svg>
  );
}

export default function Home() {
  const filteredAlgorithms = algorithms.filter(
    (a) => !a.id.includes("reinforcement") && !a.id.includes("generative"),
  );

  return (
    <div className="min-h-screen">
      <section className="border-b border-outline px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto grid max-w-[1360px] gap-10 lg:grid-cols-[minmax(0,520px)_360px] xl:grid-cols-[minmax(0,560px)_400px] lg:items-center lg:justify-between">
          <div className="flex flex-col items-start">
            <div className="mb-7 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.22em] text-on-surface-variant sm:text-[11px]">
              <span className="h-px w-8 bg-outline-dark" />
              {heroStats.map((stat) => (
                <span key={stat.label}>
                  {stat.value} {stat.label}
                </span>
              ))}
            </div>
            <h1 className="w-full max-w-full text-balance font-headline text-[2.75rem] font-medium leading-[1.04] tracking-normal text-on-surface sm:max-w-[520px] sm:text-[4.05rem] lg:text-[4rem] xl:text-[4.35rem]">
              Understand AI, Mathematically <span className="text-on-surface-variant">& Intuitively.</span>
            </h1>
            <p className="mt-8 w-full max-w-full text-base font-medium leading-8 text-on-surface-variant sm:max-w-2xl sm:text-[17px]">
              A structured curriculum that teaches machine learning through mathematical foundations, visual intuition, and code-oriented thinking from calculus through modern models.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/algorithms/calculus"
                className="inline-flex min-h-10 items-center justify-center border border-on-surface bg-on-surface px-8 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-background hover:bg-primary"
              >
                Begin Curriculum
              </Link>
              <Link
                href="/playground"
                className="inline-flex min-h-10 items-center justify-center border border-transparent px-8 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-primary hover:border-outline"
              >
                Open Playground →
              </Link>
            </div>
          </div>

          <div className="hidden w-full max-w-[380px] justify-self-end lg:block">
            <HeroLossSurface />
          </div>
        </div>
      </section>

      <section id="philosophy" className="border-b border-outline bg-surface-dim px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
        <div className="mx-auto max-w-[1360px] border border-outline bg-border">
          <div className="grid gap-px md:grid-cols-3">
            {pillars.map((pillar) => (
              <article key={pillar.title} className="bg-surface px-7 py-9 sm:px-9 sm:py-10">
                <div className="mb-7 font-headline text-3xl text-outline-dark">
                  {pillar.glyph}
                </div>
                <h2 className="font-headline text-xl font-medium text-on-surface">
                  {pillar.title}
                </h2>
                <p className="mt-5 text-sm font-medium leading-7 text-on-surface-variant">
                  {pillar.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="curriculum" className="border-b border-outline px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
        <div className="mx-auto max-w-[1360px]">
          <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
            <div>
              <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.24em] text-on-surface-variant">
                Curriculum
              </p>
              <h2 className="max-w-2xl font-headline text-4xl font-medium leading-tight text-on-surface sm:text-5xl">
                Thirteen modules, one coherent arc.
              </h2>
            </div>
            <p className="pt-8 text-sm font-medium leading-7 text-on-surface-variant lg:text-right">
              A structured progression from mathematical foundations to modern generative models. Select any module to preview.
            </p>
          </div>

          <CurriculumExplorer algorithms={filteredAlgorithms} />
        </div>
      </section>

      <section className="bg-surface-dim px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
        <div className="mx-auto grid max-w-[1360px] gap-12 lg:grid-cols-[430px_minmax(0,1fr)] lg:items-center">
          <div>
            <div className="mb-9 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.22em] text-on-surface-variant">
              <span className="h-px w-8 bg-outline-dark" />
              Interactive Lab
            </div>
            <h2 className="font-headline text-4xl font-medium leading-tight text-on-surface sm:text-5xl">
              Neural Network Playground
            </h2>
            <p className="mt-8 text-base font-medium leading-8 text-on-surface-variant">
              Draw a dataset, configure a network architecture, and train it in-browser. Watch decision boundaries form in real time as loss converges.
            </p>
            <ul className="mt-9 space-y-4 text-sm font-medium leading-6 text-on-surface-variant">
              {[
                "Live decision boundary visualisation",
                "Configurable width, rate, and regularisation",
                "Real-time loss and accuracy curves",
                "Multiple classification datasets",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="font-mono text-primary">›</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/playground"
              className="mt-10 inline-flex min-h-10 items-center justify-center border border-on-surface bg-on-surface px-8 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-background hover:bg-primary"
            >
              Open Playground →
            </Link>
          </div>
          <div>
            <NetworkDiagram />
            <div className="grid grid-cols-3 border-t border-outline text-center">
              {[
                ["Layers", "2 hidden"],
                ["Neurons", "4 / layer"],
                ["Activation", "tanh"],
              ].map(([label, value]) => (
                <div key={label} className="border-r border-outline px-4 py-5 last:border-r-0">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-on-surface-variant">
                    {label}
                  </p>
                  <p className="mt-2 font-mono text-sm text-on-surface">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-outline px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1360px] flex-col gap-4 font-mono text-[11px] uppercase tracking-[0.18em] text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
          <p>ML Learn · The Digital Observatory</p>
          <p>© 2026 Suranjan Poudel</p>
        </div>
      </footer>
    </div>
  );
}
